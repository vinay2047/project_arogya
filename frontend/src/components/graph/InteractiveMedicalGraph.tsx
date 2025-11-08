'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';

interface Node {
  nodeId: string;
  label: string;
  properties: Record<string, any>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface Edge {
  edgeId: string;
  source: string;
  target: string;
  relation: string;
  properties?: Record<string, any>;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
  info: any[];
}

interface PatientInfo {
  id: string;
  name: string;
  email: string;
}

interface ApiResponse {
  success: boolean;
  summary: string;
  patient?: PatientInfo;
  data: GraphData;
}

const WIDTH = 1000;
const HEIGHT = 700;

export default function InteractiveMedicalGraph({
  graphId,
}: {
  graphId: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [graph, setGraph] = useState<GraphData | null>(null);
  const [summary, setSummary] = useState('');
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number | null>(null);
  const view = useRef({ x: 0, y: 0, scale: 1 });
  const draggedNodeRef = useRef<Node | null>(null);
  const mouse = useRef({
    x: 0,
    y: 0,
    down: false,
    lastX: 0,
    lastY: 0,
    panning: false,
  });

  const nodeColors: Record<string, string> = {
    Patient: '#60a5fa',
    Doctor: '#34d399',
    Condition: '#f87171',
    Medication: '#a78bfa',
    Treatment: '#fbbf24',
    Default: '#6366f1',
  };

  useEffect(() => {
    async function fetchGraph() {
      if (!graphId) {
        setError('Graph ID missing');
        setLoading(false);
        return;
      }

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/graph/showGraph/${graphId}`;
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        const data: ApiResponse = await res.json();

        if (data.success) {
          const initializedNodes = data.data.nodes.map((node, i) => {
            const angle = (2 * Math.PI * i) / data.data.nodes.length;
            const radius = Math.min(WIDTH, HEIGHT) / 3 + Math.random() * 60;
            return {
              ...node,
              x: WIDTH / 2 + radius * Math.cos(angle),
              y: HEIGHT / 2 + radius * Math.sin(angle),
              vx: 0,
              vy: 0,
            };
          });

          setGraph({
            nodes: initializedNodes,
            edges: data.data.edges,
            info: data.data.info,
          });
          setSummary(data.summary || '');
          setPatient(data.patient || null);
          setError('');
        } else {
          setError('Graph load failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching graph');
      } finally {
        setLoading(false);
      }
    }

    fetchGraph();
  }, [graphId]);

  useEffect(() => {
    if (!graph) return;
    const nodes = graph.nodes.map((n) => ({ ...n }));
    const edges = graph.edges;

    const damping = 0.9;
    const repulsion = 35000;
    const attraction = 0.006;
    const centerForce = 0.001;

    const step = () => {
      if (paused) return;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!node.x || !node.y) continue;

        let fx = 0,
          fy = 0;

        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const other = nodes[j];
          if (!other.x || !other.y) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist2 = dx * dx + dy * dy + 0.1;
          const force = repulsion / dist2;
          fx += (dx / Math.sqrt(dist2)) * force;
          fy += (dy / Math.sqrt(dist2)) * force;
        }

        edges.forEach((edge) => {
          if (edge.source === node.nodeId) {
            const target = nodes.find((n) => n.nodeId === edge.target);
            if (target && target.x && target.y) {
              fx += (target.x - node.x) * attraction;
              fy += (target.y - node.y) * attraction;
            }
          }
        });

        fx += (WIDTH / 2 - node.x) * centerForce;
        fy += (HEIGHT / 2 - node.y) * centerForce;

        node.vx = (node.vx || 0) * damping + fx;
        node.vy = (node.vy || 0) * damping + fy;
        node.x += node.vx;
        node.y += node.vy;
      }

      draw(nodes, edges);
      rafRef.current = requestAnimationFrame(step);
    };

    step();
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [graph, paused]);

  const draw = (nodes: Node[], edges: Edge[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.translate(view.current.x, view.current.y);
    ctx.scale(view.current.scale, view.current.scale);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    edges.forEach((edge) => {
      const source = nodes.find((n) => n.nodeId === edge.source);
      const target = nodes.find((n) => n.nodeId === edge.target);
      if (!source || !target) return;
      ctx.beginPath();
      ctx.moveTo(source.x!, source.y!);
      ctx.lineTo(target.x!, target.y!);
      ctx.stroke();
    });

    nodes.forEach((node) => {
      if (!node.x || !node.y) return;
      const text = node.properties?.name || node.label;
      const textLength = text ? text.length : 6;
      const radius = Math.min(22 + textLength * 1.4, 55);

      ctx.beginPath();
      ctx.fillStyle = nodeColors[node.label] || nodeColors.Default;
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.shadowColor = 'rgba(0,0,0,0.25)';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);

      ctx.fillStyle = '#0f172a';
      ctx.font = '12px sans-serif';
      ctx.fillText(text, node.x, node.y + radius + 15);
    });

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - view.current.x) / view.current.scale;
      const y = (e.clientY - rect.top - view.current.y) / view.current.scale;

      mouse.current.down = true;
      mouse.current.x = x;
      mouse.current.y = y;
      mouse.current.lastX = e.clientX;
      mouse.current.lastY = e.clientY;

      const node = graph?.nodes.find(
        (n) => n.x && n.y && Math.hypot(n.x - x, n.y - y) < 50
      );
      if (node) {
        draggedNodeRef.current = node;
      } else {
        mouse.current.panning = true;
      }
    };

    const handleMove = (e: MouseEvent) => {
      if (!mouse.current.down) return;
      const dx = e.clientX - mouse.current.lastX;
      const dy = e.clientY - mouse.current.lastY;
      mouse.current.lastX = e.clientX;
      mouse.current.lastY = e.clientY;

      if (draggedNodeRef.current) {
        draggedNodeRef.current.x! += dx / view.current.scale;
        draggedNodeRef.current.y! += dy / view.current.scale;
      } else if (mouse.current.panning) {
        view.current.x += dx;
        view.current.y += dy;
      }
    };

    const handleUp = () => {
      mouse.current.down = false;
      mouse.current.panning = false;
      draggedNodeRef.current = null;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const scaleAmount = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(
        2.5,
        Math.max(0.5, view.current.scale * scaleAmount)
      );
      view.current.x =
        mouseX - ((mouseX - view.current.x) * newScale) / view.current.scale;
      view.current.y =
        mouseY - ((mouseY - view.current.y) * newScale) / view.current.scale;
      view.current.scale = newScale;
    };

    canvas.addEventListener('mousedown', handleDown);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleDown);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [graph]);

  return (
    <Card className="w-full p-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Interactive Knowledge Graph</span>
          {patient && (
            <span className="text-sm text-muted-foreground">
              Patient: <b>{patient.name}</b>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            Loading...
          </div>
        ) : error ? (
          <div className="text-red-500 bg-red-50 border p-3 rounded">
            {error}
          </div>
        ) : graph ? (
          <>
            {summary && (
              <div className="mb-4 bg-blue-50 p-3 rounded text-sm border border-blue-100">
                {summary}
              </div>
            )}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 border rounded-lg bg-white p-2">
                <canvas
                  ref={canvasRef}
                  width={WIDTH}
                  height={HEIGHT}
                  className="w-full h-[600px] rounded shadow-sm"
                />
                <div className="mt-2 text-xs text-center text-muted-foreground">
                  Zoom with scroll • Drag nodes or pan background
                </div>
              </div>
              <div className="w-full lg:w-80 space-y-4">
                <div className="border rounded-lg p-4 bg-white">
                  <h3 className="font-semibold mb-2 text-sm">Legend</h3>
                  {Object.entries(nodeColors).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ background: v }}
                      ></div>
                      {k}
                    </div>
                  ))}
                </div>
                <div className="border rounded-lg p-4 bg-white text-sm">
                  <h3 className="font-semibold mb-2">Graph Info</h3>
                  <div>Nodes: {graph.nodes.length}</div>
                  <div>Edges: {graph.edges.length}</div>
                  <Button
                    variant="outline"
                    className="mt-3 w-full"
                    onClick={() => setPaused((p) => !p)}
                  >
                    {paused ? 'Resume Simulation' : 'Pause Simulation'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>No graph data</div>
        )}
      </CardContent>
    </Card>
  );
}
