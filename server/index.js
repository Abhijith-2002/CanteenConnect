const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Order = require('./models/Order');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Example root route
app.get('/', (req, res) => {
  res.send('CanteenConnect API is running');
});

const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

// TODO: Add routes here
app.use('/api', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Periodic job to cancel unpaid 'Pay Later' orders that are 'Ready' for more than 30 minutes
setInterval(async () => {
  const cutoff = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
  try {
    const result = await Order.updateMany(
      {
        paymentStatus: 'Pending',
        status: 'Ready',
        cancelled: false,
        updatedAt: { $lte: cutoff }
      },
      { $set: { cancelled: true } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Auto-cancelled ${result.modifiedCount} unpaid ready orders.`);
    }
  } catch (err) {
    console.error('Auto-cancel job error:', err);
  }
}, 60 * 1000); // Run every 1 minute

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/canteenconnect';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  }); 