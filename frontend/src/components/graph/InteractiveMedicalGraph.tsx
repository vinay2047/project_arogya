'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// ... (Interface definitions: Node, Edge, etc. - NO CHANGES) ...
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
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;

// --- Loading Skeleton Component ---
const GraphLoadingSkeleton = () => (
  <div className="h-[600px] w-full flex flex-col items-center justify-center bg-slate-50 rounded-lg">
    <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
    <p className="mt-4 text-lg text-slate-600">Loading Patient Graph...</p>
  </div>
);

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

  const [zoomLevel, setZoomLevel] = useState(1);
  const draggedNodeRef = useRef<Node | null>(null);
  const hoveredNodeRef = useRef<Node | null>(null);

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

  // ... (useEffect for fetchGraph - NO CHANGES) ...
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

  // --- MODIFIED: Simulation/Physics useEffect ---
  useEffect(() => {
    if (!graph) return;

    const nodes = graph.nodes.map((n) => ({ ...n }));
    const edges = graph.edges;

    const damping = 0.95;
    const repulsion = 60000;
    const attraction = 0.05;
    const centerForce = 0.005;

    const step = () => {
      if (paused) return;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node === draggedNodeRef.current) continue;
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
          let target: Node | undefined;
          if (edge.source === node.nodeId) {
            target = nodes.find((n) => n.nodeId === edge.target);
          } else if (edge.target === node.nodeId) {
            target = nodes.find((n) => n.nodeId === edge.source);
          }

          if (target && target.x && target.y) {
            const dx = target.x - node.x;
            const dy = target.y - node.y;
            const dist = Math.hypot(dx, dy) + 1e-6;
            const restLength = 150 + edge.relation.length * 5;
            const displacement = dist - restLength;
            const force = attraction * displacement;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        });

        fx += (WIDTH / 2 - node.x) * centerForce;
        fy += (HEIGHT / 2 - node.y) * centerForce;

        node.vx = (node.vx || 0) * damping + fx;
        node.vy = (node.vy || 0) * damping + fy;

        const v = Math.hypot(node.vx, node.vy);
        if (v > 50) {
          node.vx = (node.vx / v) * 50;
          node.vy = (node.vy / v) * 50;
        }

        node.x += node.vx;
        node.y += node.vy;
      }

      draw(nodes, edges, hoveredNodeRef.current, draggedNodeRef.current);
      rafRef.current = requestAnimationFrame(step);
    };

    step();

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [graph, paused]);

  // --- MODIFIED: Draw function ---
  const draw = (
    nodes: Node[],
    edges: Edge[],
    hoveredNode: Node | null,
    draggedNode: Node | null
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#f8fafc'; // slate-50, cleaner background
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // --- NEW: Draw Grid ---
    // Draw this *before* save/translate/scale so it's static
    const gridSize = 20;
    ctx.strokeStyle = '#f1f5f9'; // slate-100
    ctx.lineWidth = 0.5;

    ctx.beginPath();
    for (let x = 0; x <= WIDTH; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, HEIGHT);
    }
    for (let y = 0; y <= HEIGHT; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(WIDTH, y);
    }
    ctx.stroke();
    // --- END NEW ---

    ctx.save();
    ctx.translate(view.current.x, view.current.y);
    ctx.scale(view.current.scale, view.current.scale);

    // --- Draw Edges and Edge Labels ---
    ctx.strokeStyle = '#e2e8f0'; // slate-200
    ctx.fillStyle = '#64748b'; // slate-500
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 1.5;

    edges.forEach((edge) => {
      const source = nodes.find((n) => n.nodeId === edge.source);
      const target = nodes.find((n) => n.nodeId === edge.target);
      if (
        !source ||
        !target ||
        !source.x ||
        !source.y ||
        !target.x ||
        !target.y
      )
        return;

      // Draw edge line
      ctx.beginPath();
      ctx.moveTo(source.x, source.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();

      // Draw Edge Label
      if (view.current.scale > 0.8) {
        // Only draw labels if zoomed in enough
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        const angle = Math.atan2(target.y - source.y, target.x - source.x);

        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(
          angle > Math.PI / 2 || angle < -Math.PI / 2 ? angle + Math.PI : angle
        );
        ctx.fillStyle = '#64748b'; // slate-500
        ctx.fillText(edge.relation.replace(/_/g, ' '), 0, -5);
        ctx.restore();
      }
    });

    // --- Draw Nodes ---
    nodes.forEach((node) => {
      if (!node.x || !node.y) return;
      const isHovered = node === hoveredNode || node === draggedNode;
      const labelText = node.label;
      const nameText = node.properties?.name || node.label;
      const radius = Math.max(20, 10 + labelText.length * 2.5);

      // Draw Halo for hovered/dragged node
      if (isHovered) {
        ctx.beginPath();
        ctx.fillStyle = (nodeColors[node.label] || nodeColors.Default) + '40'; // 25% opacity
        ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw node circle
      ctx.beginPath();
      ctx.fillStyle = nodeColors[node.label] || nodeColors.Default;
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Label (inside node)
      ctx.fillStyle = 'white';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, node.x, node.y);

      // Draw Name (below node)
      ctx.fillStyle = '#334155'; // slate-700
      ctx.font = '12px sans-serif';
      ctx.fillText(nameText, node.x, node.y + radius + 14);
    });

    ctx.restore();
  };

  // --- Zoom logic helper ---
  const updateZoom = (
    newScale: number,
    mouseX: number, // Mouse position relative to canvas
    mouseY: number
  ) => {
    const oldScale = view.current.scale;
    const clampedScale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, newScale));

    // Zoom towards the mouse pointer
    view.current.x =
      mouseX - ((mouseX - view.current.x) * clampedScale) / oldScale;
    view.current.y =
      mouseY - ((mouseY - view.current.y) * clampedScale) / oldScale;
    view.current.scale = clampedScale;
    setZoomLevel(clampedScale);
  };

  // --- Event Handlers useEffect ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - view.current.x) / view.current.scale;
      const y = (e.clientY - rect.top - view.current.y) / view.current.scale;
      return { x, y };
    };

    const getNodeAtPos = (x: number, y: number) => {
      if (!graph) return null;
      // Search in reverse so top nodes are found first
      for (let i = graph.nodes.length - 1; i >= 0; i--) {
        const node = graph.nodes[i];
        if (!node.x || !node.y) continue;
        const labelText = node.label;
        const radius = Math.max(20, 10 + labelText.length * 2.5);
        if (Math.hypot(node.x - x, node.y - y) < radius + 5) {
          // 5px buffer
          return node;
        }
      }
      return null;
    };

    const handleDown = (e: MouseEvent) => {
      const { x, y } = getMousePos(e);
      mouse.current.down = true;
      mouse.current.x = x;
      mouse.current.y = y;
      mouse.current.lastX = e.clientX;
      mouse.current.lastY = e.clientY;

      const node = getNodeAtPos(x, y);
      if (node) {
        draggedNodeRef.current = node;
        draggedNodeRef.current.vx = 0; // Stop momentum
        draggedNodeRef.current.vy = 0;
      } else {
        mouse.current.panning = true;
      }
    };

    const handleMove = (e: MouseEvent) => {
      if (!mouse.current.down) {
        // Hover detection
        const { x, y } = getMousePos(e);
        hoveredNodeRef.current = getNodeAtPos(x, y);
        canvas.style.cursor = hoveredNodeRef.current ? 'pointer' : 'grab';
        return;
      }

      canvas.style.cursor = draggedNodeRef.current ? 'grabbing' : 'grabbing';

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
      if (draggedNodeRef.current) {
        // Apply a small velocity "flick"
        draggedNodeRef.current.vx = (draggedNodeRef.current.vx || 0) * 0.1;
        draggedNodeRef.current.vy = (draggedNodeRef.current.vy || 0) * 0.1;
      }
      mouse.current.down = false;
      mouse.current.panning = false;
      draggedNodeRef.current = null;
      canvas.style.cursor = hoveredNodeRef.current ? 'pointer' : 'grab';
    };

    canvas.addEventListener('mousedown', handleDown);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    canvas.addEventListener('mouseleave', () => {
      hoveredNodeRef.current = null;
      if (!mouse.current.down) {
        canvas.style.cursor = 'grab';
      }
    });

    return () => {
      canvas.removeEventListener('mousedown', handleDown);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      canvas.removeEventListener('mouseleave', () => {
        hoveredNodeRef.current = null;
        if (!mouse.current.down) {
          canvas.style.cursor = 'grab';
        }
      });
    };
  }, [graph]); // Only depends on graph

  // --- Handlers for zoom controls ---
  const handleZoomSliderChange = (value: number[]) => {
    const newScale = value[0];
    const rect = canvasRef.current!.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    updateZoom(newScale, centerX, centerY);
  };

  const zoomByStep = (direction: 'in' | 'out') => {
    const step = 0.2;
    const newScale =
      direction === 'in'
        ? view.current.scale + step
        : view.current.scale - step;
    const rect = canvasRef.current!.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    updateZoom(newScale, centerX, centerY);
  };

  // --- Return JSX ---
  return (
    <div className="w-full px-6 py-3">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <span className="text-3xl font-bold mb-2 sm:mb-0">
            Patient's Medical Graph
          </span>
          {patient && (
            <span className="text-sm font-normal text-slate-500">
              Patient:{' '}
              <b className="font-medium text-slate-700">{patient.name}</b>
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <GraphLoadingSkeleton />
        ) : error ? (
          <div className="text-red-700 bg-red-50 border border-red-200 p-4 rounded-lg">
            <strong>Error:</strong> {error}
          </div>
        ) : graph ? (
          <>
            {summary && (
              <div className="mb-4 mt-4 bg-teal-50 p-4 rounded-lg text-sm text-teal-800 border border-teal-100">
                <b className="font-semibold">Summary:</b> {summary}
              </div>
            )}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* --- Canvas container --- */}
              <div className="flex-1 border rounded-xl bg-white p-2 relative shadow-sm">
                <canvas
                  ref={canvasRef}
                  width={WIDTH}
                  height={HEIGHT}
                  className="w-full h-[600px] lg:h-[700px] rounded-lg bg-slate-50"
                />

                {/* --- Floating Controls --- */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200 shadow-lg rounded-lg p-3 flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => zoomByStep('out')}
                    disabled={zoomLevel === MIN_ZOOM}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <input
                    type="range"
                    min={MIN_ZOOM}
                    max={MAX_ZOOM}
                    step={0.01}
                    value={zoomLevel}
                    onChange={(e) =>
                      handleZoomSliderChange([
                        Number((e.target as HTMLInputElement).value),
                      ])
                    }
                    className="w-32 h-2 bg-slate-200 rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => zoomByStep('in')}
                    disabled={zoomLevel === MAX_ZOOM}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* --- Sidebar --- */}
              <div className="w-full lg:w-72 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Legend</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(nodeColors).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-3 text-sm">
                        <div
                          className="w-4 h-4 rounded-full border border-black/10"
                          style={{ background: v }}
                        ></div>
                        <span className="text-slate-700">{k}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Graph Info</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Nodes:</span>
                      <span className="font-medium text-slate-800">
                        {graph.nodes.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Edges:</span>
                      <span className="font-medium text-slate-800">
                        {graph.edges.length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div>No graph data available.</div>
        )}
      </CardContent>
    </div>
  );
}
