// --- Core Imports ---
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const passportLib = require('passport');
const path = require('path');
const next = require('next');
require('dotenv').config();

// --- Local Imports ---
require('./config/passport');
const response = require('./middleware/response');

// --- Initialize Express ---
const app = express();

// --- Security & Middleware ---
app.use(helmet());
app.use(morgan('dev'));
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(response);
app.use(passportLib.initialize());

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// --- Next.js Setup ---
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: path.join(__dirname, '../frontend') });
const handle = nextApp.getRequestHandler();

// --- Start Next.js + Express ---
nextApp.prepare().then(() => {
  // --- API Routes ---
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/doctor', require('./routes/doctor'));
  app.use('/api/patient', require('./routes/patient'));
  app.use('/api/appointment', require('./routes/appointment'));
  app.use('/api/payment', require('./routes/payment'));
  app.use('/api/graph', require('./routes/graph'));

  // --- Health Check ---
  app.get('/health', (req, res) =>
    res.ok({ time: new Date().toISOString() }, 'OK')
  );

  // --- Handle All Other Routes with Next.js ---
  app.all('*', (req, res) => handle(req, res));

  // --- Start Unified Server ---
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () =>
    console.log(`🚀 Unified server running on port ${PORT}`)
  );
});
