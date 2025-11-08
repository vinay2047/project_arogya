const express = require('express');
const router = express.Router();
const {
  saveGeminiKnowledgeGraph,
} = require('../services/geminiGraphBuilder.service');
const { authenticate } = require('../middleware/auth');
const KnowledgeGraph = require('../models/KnowledgeGraph');

// POST /api/graph/saveGraph
router.post('/saveGraph', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;

    if (!text) {
      return res
        .status(400)
        .json({ success: false, message: 'Text is required' });
    }

    const graph = await saveGeminiKnowledgeGraph(userId, text);

    await Patient.findByIdAndUpdate(patientId, { graphId: graph.graphId });

    res.status(201).json({
      success: true,
      message: 'Knowledge Graph created successfully!',
      data: graph,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/showGraph/:graphId', authenticate, async (req, res) => {
  try {
    const { graphId } = req.params;

    const graph = await KnowledgeGraph.findOne({ graphId }).lean();
    if (!graph)
      return res
        .status(404)
        .json({ success: false, message: 'Graph not found' });

    res.json({
      success: true,
      summary: graph.summary,
      data: {
        nodes: graph.nodes,
        edges: graph.edges,
        info: graph.info,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
