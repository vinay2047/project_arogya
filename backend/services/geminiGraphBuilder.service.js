// services/graph.service.js
const axios = require('axios');
let uuidv4;

(async () => {
  const { v4 } = await import('uuid');
  uuidv4 = v4;
})();
const KnowledgeGraph = require('../models/KnowledgeGraph');

// Existing function left as-is
async function buildKnowledgeGraphFromGemini(userId, text) {
  const API_KEY = process.env.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

  const prompt = `
You are a data structuring assistant.
Analyze the text below and produce a structured JSON for a medical knowledge graph.
The JSON must follow this structure exactly:

{
  "summary": "overall summary of the text",
  "nodes": [
    { "nodeId": "n1", "label": "EntityType", "properties": { "key": "value" }, "infoId": "i1" }
  ],
  "edges": [
    { "edgeId": "e1", "source": "n1", "target": "n2", "relation": "relation_type", "properties": { "key": "value" }, "infoId": "i2" }
  ],
  "info": [
    { "infoId": "i1", "summary": "summary text", "metadata": { "key": "value" }, "embeddings": [], "source": "gemini" }
  ]
}

Return ONLY valid JSON — no extra text.

TEXT:
${text}
`;

  try {
    const response = await axios.post(
      endpoint,
      {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const output =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(output);

    return {
      userId,
      graphId: `graph_${Date.now()}_${uuidv4().slice(0, 6)}`,
      summary: parsed.summary || 'No summary provided',
      nodes: parsed.nodes || [],
      edges: parsed.edges || [],
      info: parsed.info || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error(
      '❌ Gemini Graph Builder Error:',
      error.response?.data || error.message
    );
    throw new Error('Failed to generate graph data with Gemini');
  }
}

async function saveGeminiKnowledgeGraph(userId, text) {
  const graphData = await buildKnowledgeGraphFromGemini(userId, text);
  const doc = new KnowledgeGraph(graphData);
  await doc.save();
  return doc;
}

/**
 * ✅ Update an existing Knowledge Graph intelligently.
 * If nodes/edges overlap, merge their properties.
 */
async function updateGeminiKnowledgeGraph(graphId, newText) {
  const existing = await KnowledgeGraph.findOne({ graphId });
  if (!existing) throw new Error('Graph not found for update');

  // Generate new graph data from Gemini
  const newGraph = await buildKnowledgeGraphFromGemini(
    existing.userId,
    newText
  );

  // Merge logic — keeps old nodes & edges that aren’t redefined
  const mergedNodes = [
    ...existing.nodes,
    ...newGraph.nodes.filter(
      (n) => !existing.nodes.some((old) => old.nodeId === n.nodeId)
    ),
  ];

  const mergedEdges = [
    ...existing.edges,
    ...newGraph.edges.filter(
      (e) => !existing.edges.some((old) => old.edgeId === e.edgeId)
    ),
  ];

  existing.summary = newGraph.summary || existing.summary;
  existing.nodes = mergedNodes;
  existing.edges = mergedEdges;
  existing.info = [...(existing.info || []), ...(newGraph.info || [])];
  existing.updatedAt = new Date();

  await existing.save();
  return existing;
}

module.exports = {
  buildKnowledgeGraphFromGemini,
  saveGeminiKnowledgeGraph,
  updateGeminiKnowledgeGraph,
};
