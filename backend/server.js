require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const app = express();

// Security Middlewares
// Customize helmet to allow content loads from leaflet maps and styles
app.use(
  helmet({
    contentSecurityPolicy: false, // Turn off for local development and Leaflet OSM mapping scripts
    crossOriginResourcePolicy: false,
  })
);
app.use(cors());
app.use(mongoSanitize());

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded files locally
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes Mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/properties', require('./routes/propertyRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root path fallback
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Property Management Platform API is running.' });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  server.close(() => process.exit(1));
});
