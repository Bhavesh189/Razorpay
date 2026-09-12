import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String
  },
  items: [{
    productId: { type: String, required: true },
    title: { type: String },
    price: { type: Number },
    quantity: { type: Number, required: true },
    size: { type: String },
    image: { type: String }
  }],
  summary: {
    total: { type: Number },
    discount: { type: Number },
    shipping: { type: Number },
    finalAmount: { type: Number, required: true }
  },
  address: {
    name: { type: String },
    phone: { type: String },
    pincode: { type: String },
    city: { type: String },
    state: { type: String },
    houseNo: { type: String },
    area: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed'
  },
  paymentMethod: {
    type: String,
    default: 'Razorpay'
  },
  trackingSteps: [{
    label: { type: String },
    date: { type: String },
    done: { type: Boolean, default: false }
  }],
  estimatedDelivery: {
    type: String
  }
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
