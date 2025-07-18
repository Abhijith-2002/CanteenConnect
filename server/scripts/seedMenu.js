const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('../models/MenuItem');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/canteenconnect';

const menuItems = [
  {
    name: 'Meal',
    price: 40,
    description: 'Delicious and filling meal',
    dailyQuantity: 100
  },
  {
    name: 'Chai',
    price: 10,
    description: 'Hot Indian tea',
    dailyQuantity: 200
  },
  {
    name: 'Samosa',
    price: 15,
    description: 'Crispy fried snack',
    dailyQuantity: 100
  },
  {
    name: 'Vada',
    price: 20,
    description: 'South Indian savory snack',
    dailyQuantity: 100
  },
  {
    name: 'Cutlet',
    price: 25,
    description: 'Spicy vegetable cutlet',
    dailyQuantity: 100
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(menuItems);
    console.log('Menu seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed(); 