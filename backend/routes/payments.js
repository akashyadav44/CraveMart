const express = require('express');
const router  = express.Router();
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order   = require('../models/Order');
const { protect } = require('../middleware/auth');

// ─── @route  POST /api/payments/create-session ────────────────
// Protected | Create a Stripe Checkout Session
router.post('/create-session', protect, async (req, res) => {
  try {
    const { items, orderId, couponCode } = req.body;

    // Build Stripe line items from cart
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name:        item.name,
          description: item.desc || '',
          metadata:    { emoji: item.emoji || '' },
        },
        unit_amount: item.price * 100,   // Stripe uses paise (smallest unit)
      },
      quantity: item.qty,
    }));

    // Add delivery fee line item
    lineItems.push({
      price_data: {
        currency: 'inr',
        product_data: { name: 'Delivery Fee' },
        unit_amount: 4000,  // ₹40
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'payment',
      line_items:           lineItems,

      // Discount via coupon
      discounts: couponCode === 'CRAVE30'
        ? [{ coupon: await getOrCreateStripeCoupon(stripe) }]
        : [],

      metadata: {
        userId:  req.user._id.toString(),
        orderId: orderId || '',
      },

      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${process.env.CLIENT_URL}/cart`,
    });

    res.json({ success: true, sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe session error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── @route  POST /api/payments/webhook ───────────────────────
// Stripe webhook — update order on payment success
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { orderId } = session.metadata;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        'payment.status':          'paid',
        'payment.stripeSessionId': session.id,
        'payment.stripePaymentId': session.payment_intent,
        'payment.paidAt':          new Date(),
        status:                    'confirmed',
      });
    }

    console.log(`✅ Payment confirmed for session ${session.id}`);
  }

  res.json({ received: true });
});

// ─── @route  GET /api/payments/session/:id ────────────────────
// Protected | Retrieve session details (for order confirmation page)
router.get('/session/:id', protect, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.id, {
      expand: ['line_items', 'payment_intent'],
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── @route  POST /api/payments/refund ────────────────────────
// Protected | Request a refund
router.post('/refund', protect, async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.payment.status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Order not paid — nothing to refund' });
    }

    const refund = await stripe.refunds.create({
      payment_intent: order.payment.stripePaymentId,
    });

    order.payment.status = 'refunded';
    order.status         = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Refund initiated', refund });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Helper: get or create 30% off coupon in Stripe ──────────
async function getOrCreateStripeCoupon(stripe) {
  try {
    const existing = await stripe.coupons.retrieve('CRAVE30');
    return existing.id;
  } catch {
    const coupon = await stripe.coupons.create({
      id:                  'CRAVE30',
      percent_off:         30,
      duration:            'once',
      name:                'CraveMart Welcome Discount',
    });
    return coupon.id;
  }
}

module.exports = router;
