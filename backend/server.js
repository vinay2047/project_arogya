// --- Core Imports ---
if(process.env.NODE_ENV!=="production"){
    require('dotenv').config()
}
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const passportLib = require('passport');
const path = require('path');
const next = require('next');


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
nextApp.prepare()
  .then(() => {
    // Routes...
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/doctor', require('./routes/doctor'));
    app.use('/api/patient', require('./routes/patient'));
    app.use('/api/appointment', require('./routes/appointment'));
    app.use('/api/payment', require('./routes/payment'));
    app.use('/api/graph', require('./routes/graph'));

    app.get('/health', (req, res) => res.ok({ time: new Date().toISOString() }, 'OK'));
    app.all('*', (req, res) => handle(req, res));

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`🚀 Unified server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  });
