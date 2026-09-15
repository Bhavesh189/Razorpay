import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { logger } from '../utils/logger.js';

// Sync Cart and Wishlist from Frontend
export const syncUserData = async (req, res) => {
  try {
    const { cart, wishlist } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (cart) user.cart = cart;
    if (wishlist) user.wishlist = wishlist;

    await user.save();

    res.status(200).json({ success: true, message: 'Data synced successfully', cart: user.cart, wishlist: user.wishlist });
  } catch (error) {
    logger.error('user.data_sync.failed', { error, userId: req.user?.id });
    res.status(500).json({ success: false, message: 'Server error while syncing data' });
  }
};

// Create a new Order
export const createOrder = async (req, res) => {
  try {
    const { orderId, paymentId, items, summary, address, paymentMethod, estimatedDelivery } = req.body;

    const newOrder = await Order.create({
      userId: req.user.id,
      orderId,
      paymentId,
      items,
      summary,
      address,
      paymentMethod,
      estimatedDelivery,
      trackingSteps: [
        { label: 'Order Confirmed', date: new Date().toLocaleString(), done: true },
        { label: 'Processing', date: 'Expected tomorrow', done: false },
        { label: 'Shipped', date: 'Pending', done: false },
        { label: 'Out for Delivery', date: 'Pending', done: false }
      ]
    });

    // Optionally clear user's cart after successful order creation
    const user = await User.findById(req.user.id);
    if (user) {
      user.cart = [];
      await user.save();
    }

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    logger.error('order.create.failed', { error, userId: req.user?.id, orderId: req.body?.orderId });
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
};

// Fetch User Orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    logger.error('orders.fetch.failed', { error, userId: req.user?.id });
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};
