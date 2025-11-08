<<<<<<< HEAD:backend/modal/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    filename: { type: String, required: true },
    fileType: { type: String, required: true },
    // originalText: { type: String, required: true },
    sanitizedText: { type: String, required: true },
    formattedText: { type: String }, // Human-readable
    structuredData: { type: Object }, // JSON from Gemini
    sharedToKnowledgeGraph: { type: Boolean, default: false },
    sharedAt: { type: Date }
  },
  { timestamps: true }
);

=======
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    filename: { type: String, required: true },
    fileType: { type: String, required: true },
    originalText: { type: String, required: true },
    sanitizedText: { type: String, required: true },
    formattedText: { type: String }, // Human-readable
    structuredData: { type: Object }, // JSON from Gemini
  },
  { timestamps: true }
);

>>>>>>> 8485be2ae083102b8c316a38610bafe7e3f26eef:backend/models/Document.js
module.exports = mongoose.model('Document', documentSchema);