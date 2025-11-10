const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const Otp = require('../models/otp');
const transporter = require('../utils/mailer');
const router = express.Router();

const signToken = (id, type) =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post(
  '/doctor/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  async (req, res) => {
    try {
      const exists = await Doctor.findOne({ email: req.body.email });
      if (exists) return res.badRequest('Doctor alredy exists');
      const hashed = await bcrypt.hash(req.body.password, 12);
      const doc = await Doctor.create({ ...req.body, password: hashed });
      const token = signToken(doc._id, 'doctor');
      res.created(
        { token, user: { id: doc._id, type: 'doctor' } },
        'Doctor registered'
      );
    } catch (error) {
      res.serverError('Registration failed', [error.message]);
    }
  }
);

router.post(
  '/doctor/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate,
  async (req, res) => {
    try {
      const doc = await Doctor.findOne({ email: req.body.email });
      if (!doc || !doc.password) return res.unauthorized('Invalid credentials');
      const match = await bcrypt.compare(req.body.password, doc.password);
      if (!match) return res.unauthorized('Invalid credentials');
      const token = signToken(doc._id, 'doctor');
      res.created(
        { token, user: { id: doc._id, type: 'doctor' } },
        'Login successful'
      );
    } catch (error) {
      res.serverError('Login failed', [error.message]);
    }
  }
);

router.post(
  '/patient/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  validate,
  async (req, res) => {
    try {
      const exists = await Patient.findOne({ email: req.body.email });
      if (exists) return res.badRequest('Patient alredy exists');
      const hashed = await bcrypt.hash(req.body.password, 12);
      const patient = await Patient.create({ ...req.body, password: hashed });
      const token = signToken(patient._id, 'patient');
      res.created(
        { token, user: { id: patient._id, type: 'patient' } },
        'Patient registered'
      );
    } catch (error) {
      res.serverError('Registration failed', [error.message]);
    }
  }
);

router.post(
  '/patient/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  validate,
  async (req, res) => {
    try {
      const patient = await Patient.findOne({ email: req.body.email });
      if (!patient || !patient.password)
        return res.unauthorized('Invalid credentials');
      const match = await bcrypt.compare(req.body.password, patient.password);
      if (!match) return res.unauthorized('Invalid credentials');
      const token = signToken(patient._id, 'patient');
      res.created(
        { token, user: { id: patient._id, type: 'patient' } },
        'Login successful'
      );
    } catch (error) {
      res.serverError('Login failed', [error.message]);
    }
  }
);

//Google Outh Start form here

router.get('/google', (req, res, next) => {
  const userType = req.query.type || 'patient';

  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: userType,
    prompt: 'select_account',
  })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: '/auth/failure',
  }),

  async (req, res) => {
    try {
      const { user, type } = req.user;
      const token = signToken(user._id, type);

      //Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/success?token=${token}&type=${type}&user=${encodeURIComponent(
        JSON.stringify({
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
        })
      )}`;

      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(
        `${process.env.FRONTEND_URL}/auth/error?message=${encodeURIComponent(
          e.message
        )}`
      );
    }
  }
);

router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    await Otp.create({ email, otp });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email- Arogya',
      html: `<h3>Your otp is ${otp}</h3><p>It will expire in 15 minutes</p>`,
    });

    res.json({ success: true, message: 'Otp sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const record = await otp.findOne({ email, otp });
    if (!record) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or expired OTP' });
    }
    await Otp.deleteMany({ email });
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Auth failure
router.get('/failure', (req, res) =>
  res.badRequest('Google authentication Failed')
);

module.exports = router;
