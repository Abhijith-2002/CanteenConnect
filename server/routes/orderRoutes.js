const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Place a new order (student)
router.post('/', orderController.placeOrder);

// Admin: Get all orders
router.get('/all', orderController.getAllOrders);

// Mark order as paid
router.patch('/:id/pay', orderController.markAsPaid);

// Mark order as ready
router.patch('/:id/ready', orderController.markAsReady);

// Item sales ranking
router.get('/ranking', orderController.getItemSalesRanking);

// Student: Get my orders
router.get('/mine', orderController.getMyOrders);

// Revenue stats (admin)
router.get('/revenue-stats', orderController.getRevenueStats);
// Expense stats (student)
router.get('/expense-stats', orderController.getExpenseStats);

module.exports = router; 