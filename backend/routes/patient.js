
const express = require('express');
const Patient = require('../models/Patient');
const { authenticate, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const { computeAgeFromDob } = require('../utils/date');
const validate = require('../middleware/validate');
const multer = require('multer');

// 🧩 Import our services
const { extractTextFromFile } = require('../services/extra.service');
const { sanitizeText } = require('../services/sanitize.service');
const { formatWithGemini } = require('../services/gemini.service');

const Document = require('../models/Document'); // new model
const KnowledgeGraph = require("../models/KnowledgeGraph")

const router = express.Router();

/* --------------------- Patient Profile Routes --------------------- */

router.get('/me', authenticate, requireRole('patient'), async (req, res) => {
  try {
    const doc = await Patient.findById(req.user._id).select(
      '-password -googleId'
    );
    if (!doc) return res.notFound('Patient not found');
    res.ok(doc, 'Profile fetched');
  } catch (error) {
    console.error(error);
    res.serverError('Failed to fetch profile', [error.message]);
  }
});

router.put(
  '/onboarding/update',
  authenticate,
  requireRole('patient'),
  [
    body('name').optional().notEmpty(),
    body('phone').optional().isString(),
    body('dob').optional().isISO8601(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('bloodGroup').optional().isString(),

    body('emergencyContact').optional().isObject(),
    body('emergencyContact.name').optional().isString().notEmpty(),
    body('emergencyContact.phone').optional().isString().notEmpty(),
    body('emergencyContact.relationship').optional().isString().notEmpty(),

    body('medicalHistory').optional().isObject(),
    body('medicalHistory.allergies').optional().isString().notEmpty(),
    body('medicalHistory.currentMedications').optional().isString().notEmpty(),
    body('medicalHistory.chronicConditions').optional().isString().notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      const updated = { ...req.body };
      if (updated.dob) updated.age = computeAgeFromDob(updated.dob);
      delete updated.password;
      updated.isVerified = true;

      const doc = await Patient.findByIdAndUpdate(req.user._id, updated, {
        new: true,
      }).select('-password -googleId');

      res.ok(doc, 'Profile updated successfully');
    } catch (error) {
      console.error(error);
      res.serverError('Update failed', [error.message]);
    }
  }
);

/* --------------------- File Upload + LLM Processing --------------------- */

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only PDF, PNG, and JPEG files are allowed'));
  },
});

router.post(
  '/upload',
  authenticate,
  requireRole('patient'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) return res.badRequest('No file uploaded');

      // 1️⃣ Extract Text (PDF or Image)
      const extractedText = await extractTextFromFile(req.file);

      // 2️⃣ Sanitize Text
      const sanitizedText = sanitizeText(extractedText);

      // 3️⃣ Format with Gemini (structured JSON output)
      const structuredData = await formatWithGemini(sanitizedText);

      // 4️⃣ Save in MongoDB
      const document = new Document({
        patient: req.user._id,
        filename: req.file.originalname,
        fileType: req.file.mimetype,
        sanitizedText,
        formattedText: JSON.stringify(structuredData, null, 2),
        structuredData,
      });
      await document.save();

      // 5️⃣ Respond
      res.status(201).json({
        success: true,
        message: 'Document processed and saved successfully',
        data: {
          documentId: document._id,
          filename: document.filename,
          structuredData,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload or LLM processing failed',
        errors: [error.message],
      });
    }
  }
);



module.exports = router;