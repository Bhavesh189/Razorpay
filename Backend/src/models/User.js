import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
    select: false, // Don't return password by default
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
  },
  cart: [{
    productId: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    size: { type: String }
  }],
  wishlist: [{
    type: String // array of product IDs
  }]
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
