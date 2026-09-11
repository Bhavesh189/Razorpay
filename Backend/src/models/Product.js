import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  mainCategory: {
    type: String,
  },
  subCategory: {
    type: String,
  },
  images: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0
  },
  reviewsCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String
  }],
  sizes: [{
    type: String
  }],
  colors: [{
    type: String
  }],
  fabric: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
