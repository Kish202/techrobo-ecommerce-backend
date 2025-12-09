import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import reviewRoutes from './routes/reviews.js';
import messageRoutes from './routes/message.js';

// Import error handler
import errorHandler from './middlewares/errorHandler.js';

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RoboTech API is running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      reviews: '/api/reviews',
      messages: '/api/messages'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('⚠️  Unhandled Rejection:', err.message);
  process.exit(1);
});