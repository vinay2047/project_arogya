<<<<<<< Updated upstream
<<<<<<< Updated upstream
<<<<<<< HEAD
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream

=======
<<<<<<< HEAD:backend/modal/Document.js
=======
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
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
>>>>>>> c0cf7391be395a19242d8248d50b997389f39594
=======
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
module.exports = mongoose.model('Document', documentSchema);