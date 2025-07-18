const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const jwt = require('jsonwebtoken');

// Helper: Get today's date range
function getTodayRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// Place Order Controller
exports.placeOrder = async (req, res) => {
  try {
    // 1. JWT validation (student only)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    // Remove role check for prototype
    // if (payload.role !== 'student') {
    //   return res.status(403).json({ message: 'Only students can place orders' });
    // }
    const userId = payload.userId;

    // 2. Get items and paymentStatus from body
    const { items, paymentStatus } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }

    // 3. Check stock for each item
    const { start, end } = getTodayRange();
    let totalPrice = 0;
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItem);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item not found: ${item.menuItem}` });
      }
      // Count paid orders for this menuItem today
      const paidOrders = await Order.aggregate([
        { $match: {
            'items.menuItem': menuItem._id,
            status: 'Paid',
            createdAt: { $gte: start, $lte: end }
        }},
        { $unwind: '$items' },
        { $match: { 'items.menuItem': menuItem._id } },
        { $group: { _id: null, totalOrdered: { $sum: '$items.quantity' } } }
      ]);
      const alreadyOrdered = paidOrders[0]?.totalOrdered || 0;
      if (alreadyOrdered + item.quantity > menuItem.dailyQuantity) {
        return res.status(400).json({ message: `Insufficient stock for ${menuItem.name}` });
      }
      totalPrice += menuItem.price * item.quantity;
    }

    // 5. Generate daily sequential token number
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tokenCount = await Order.countDocuments({
      createdAt: { $gte: today },
    });
    const tokenNumber = tokenCount + 1;

    // 6. Create order in DB
    const order = new Order({
      user: userId,
      items,
      totalPrice,
      paymentStatus: paymentStatus === 'Paid' ? 'Paid' : 'Pending',
      status: 'Preparing',
      tokenNumber
    });
    await order.save();

    // 7. Dummy payment integration
    const dummyPaymentId = 'DUMMY_PAYMENT_ID';

    // 8. Return order ID, token number, and dummy payment ID
    res.status(201).json({
      orderId: order._id,
      tokenNumber: order.tokenNumber,
      paymentId: dummyPaymentId,
      amount: totalPrice,
      currency: 'INR'
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: Get all orders (today), with user info and sorted by tokenNumber
exports.getAllOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const orders = await Order.find({ createdAt: { $gte: today }, cancelled: false })
      .populate('user', 'name email')
      .populate('items.menuItem', 'name')
      .sort({ tokenNumber: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// Mark order as paid (update paymentStatus only)
exports.markAsPaid = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: 'Paid' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};

// Mark order as ready (update status only)
exports.markAsReady = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Ready' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order', error: err.message });
  }
};

// Admin: Get item sales ranking for today
exports.getItemSalesRanking = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sales = await Order.aggregate([
      { $match: { createdAt: { $gte: today }, cancelled: false } },
      { $unwind: '$items' },
      { $group: {
        _id: '$items.menuItem',
        totalSold: { $sum: '$items.quantity' }
      }},
      { $sort: { totalSold: -1 } },
      { $lookup: {
        from: 'menuitems',
        localField: '_id',
        foreignField: '_id',
        as: 'menuItem'
      }},
      { $unwind: '$menuItem' },
      { $project: {
        _id: 0,
        name: '$menuItem.name',
        totalSold: 1
      }}
    ]);
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sales ranking', error: err.message });
  }
};

// Student: Get my orders
exports.getMyOrders = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const userId = payload.userId;
    const orders = await Order.find({ user: userId, cancelled: false })
      .populate('items.menuItem', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch your orders', error: err.message });
  }
};

// Admin: Get total revenue today and this month
exports.getRevenueStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const [todayRevenue] = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', cancelled: false, createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const [monthRevenue] = await Order.aggregate([
      { $match: { paymentStatus: 'Paid', cancelled: false, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    res.json({
      today: todayRevenue?.total || 0,
      month: monthRevenue?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch revenue stats', error: err.message });
  }
};
// Student: Get total expense today and this month
exports.getExpenseStats = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const userId = payload.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const [todayExpense] = await Order.aggregate([
      { $match: { user: userId, paymentStatus: 'Paid', cancelled: false, createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const [monthExpense] = await Order.aggregate([
      { $match: { user: userId, paymentStatus: 'Paid', cancelled: false, createdAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    res.json({
      today: todayExpense?.total || 0,
      month: monthExpense?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expense stats', error: err.message });
  }
}; 