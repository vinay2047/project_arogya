const mongoose = require("mongoose");

const knowledgeGraphSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  graphId: { type: String, required: true, unique: true },

  nodes: [
    {
      nodeId: { type: String, required: true },
      label: { type: String, required: true }, // e.g. "Person", "Concept"
      properties: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
      infoId: { type: String }, // optional link to info object inside the same document
    }
  ],

  edges: [
    {
      edgeId: { type: String, required: true },
      source: { type: String, required: true }, // nodeId of source
      target: { type: String, required: true }, // nodeId of target
      relation: { type: String, required: true },
      properties: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
      infoId: { type: String },
    }
  ],

  info: [
    {
      infoId: { type: String, required: true },
      summary: String,
      metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
      embeddings: [Number],
      source: String,
    }
  ],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("KnowledgeGraph", knowledgeGraphSchema);
