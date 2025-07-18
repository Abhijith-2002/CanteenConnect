const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/canteenconnect';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    const email = 'admin@canteen.com';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin user already exists.');
      process.exit(0);
    }
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin',
      email,
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Admin user seeded: admin@canteen.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Seeding admin failed:', err);
    process.exit(1);
  }
}

seedAdmin(); 