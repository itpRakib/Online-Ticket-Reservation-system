require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { handleSendOTP, handleVerifyOTP } = require('./controllers/otpController');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: '*', // Allow all origins for testing/integration; restrict in production
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Body parser middleware to parse JSON payloads
app.use(express.json());

// API Routes
app.post('/api/send-otp', handleSendOTP);
app.post('/api/verify-otp', handleVerifyOTP);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// Fallback for page not found (404)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'API Endpoint not found.' });
});

// Global central error handler middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({
    success: false,
    error: 'A critical server error occurred.'
  });
});

// Start listening for connections
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`  EMAIL OTP VERIFICATION SERVICE RUNNING           `);
  console.log(`  Port: ${PORT}                                    `);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);
});
