const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Coupon logic ──────────────────────────────────────────────
const COUPONS = {
  CRAVE30:  { discount: 0.30, desc: '30% off' },
  FIRST50:  { discount: 0.50, desc: '50% off first order' },
  FLAT100:  { discount: 100,  flat: true, desc: '₹100 flat off' },
};

// ─── @route  POST /api/orders ─────────────────────────────────
// Protected | Place a new order
router.post('/', protect, async (req, res) => {
  try {
    const { items, deliveryAddress, payment, couponCode } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Calculate pricing
    const subtotal    = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const deliveryFee = subtotal >= 299 ? 0 : 40;
    const tax         = Math.round(subtotal * 0.05);

    let discount = 0;
    if (couponCode && COUPONS[couponCode.toUpperCase()]) {
      const c = COUPONS[couponCode.toUpperCase()];
      discount = c.flat ? c.discount : Math.round(subtotal * c.discount);
    }

    const total = subtotal + deliveryFee + tax - discount;

    const estimatedDelivery = new Date(Date.now() + 35 * 60 * 1000); // 35 mins from now

    const order = await Order.create({
      user: req.user._id,
      items,
      deliveryAddress,
      payment,
      pricing: { subtotal, deliveryFee, tax, discount, couponCode, total },
      estimatedDelivery,
    });

    res.status(201).json({ success: true, message: 'Order placed!', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── @route  GET /api/orders/my ───────────────────────────────
// Protected | Get logged-in user's orders
router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name emoji')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── @route  GET /api/orders/:id ──────────────────────────────
// Protected | Get a single order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Only owner or admin can view
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── @route  PUT /api/orders/:id/cancel ───────────────────────
// Protected | Cancel an order (only if placed or confirmed)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (!['placed', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
    }

    order.status      = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by user';
    await order.save();

    res.json({ success: true, message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── @route  GET /api/orders ──────────────────────────────────
// Admin | Get all orders
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(query);
    res.json({ success: true, total, page: Number(page), orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── @route  PUT /api/orders/:id/status ───────────────────────
// Admin | Update order status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    if (status === 'delivered') order.deliveredAt = new Date();
    if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
    await order.save();

    res.json({ success: true, message: `Order marked as ${status}`, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── @route  POST /api/orders/validate-coupon ─────────────────
// Public | Validate coupon code
router.post('/validate-coupon', async (req, res) => {
  const { code } = req.body;
  const coupon = COUPONS[code?.toUpperCase()];
  if (!coupon) return res.status(400).json({ success: false, message: 'Invalid coupon code' });
  res.json({ success: true, coupon: { code: code.toUpperCase(), ...coupon } });
});

module.exports = router;
