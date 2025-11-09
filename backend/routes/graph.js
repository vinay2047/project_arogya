const express = require('express');
const router = express.Router();
const {
  saveGeminiKnowledgeGraph,
  updateGeminiKnowledgeGraph,
} = require('../services/geminiGraphBuilder.service');
const { authenticate } = require('../middleware/auth');
const KnowledgeGraph = require('../models/KnowledgeGraph');
const Patient = require('../models/Patient');

router.post('/saveGraph', async (req, res) => {
  try {
    
    const { text, patientId } = req.body;
    const userId = patientId;
    if (!text || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Both text and patientId are required',
      });
    }

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: 'Patient not found' });
    }

    let graph;

    if (patient.graphId) {
      // ✅ Update existing graph
      graph = await updateGeminiKnowledgeGraph(patient.graphId, text);
    } else {
      // 🆕 Create new graph
      graph = await saveGeminiKnowledgeGraph(userId, text);
      await Patient.findByIdAndUpdate(patientId, { graphId: graph.graphId });
    }

    res.status(201).json({
      success: true,
      message: patient.graphId
        ? 'Knowledge Graph updated successfully!'
        : 'Knowledge Graph created successfully!',
      data: graph,
    });
  } catch (error) {
    console.error('Error saving/updating graph:', error);
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
