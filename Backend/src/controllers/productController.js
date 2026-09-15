import { Product } from '../models/Product.js';
import { logger } from '../utils/logger.js';

export const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 24, 
      category = 'all', 
      subCategory = 'all', 
      search = '', 
      q = '',
      sortBy = 'relevance',
      priceRange = 'all'
    } = req.query;

    const searchQuery = (search || q).toString().trim();
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    // Use High-Performance Memory Search Engine if available (handles typos, ranking, etc.)
    if (req.app.locals.searchEngine) {
      const searchRes = req.app.locals.searchEngine.search({
        ...req.query,
        query: searchQuery,
        page: pageNum,
        limit: limitNum
      });
      logger.info('catalog.search.completed', {
        query: searchQuery,
        resultCount: searchRes.products.length,
        total: searchRes.total,
        correctedQuery: searchRes.didYouMean || null
      });
      return res.status(200).json(searchRes);
    }

    // Fallback to MongoDB if Search Engine isn't loaded yet
    const queryObj = { isActive: true };

    // Text Search
    if (searchQuery) {
      queryObj.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    // Filters
    if (category !== 'all') {
      // Check if it's matching mainCategory or category slug
      queryObj.$or = [
        ...(queryObj.$or || []),
        { category },
        { mainCategory: { $regex: new RegExp(`^${category}$`, 'i') } }
      ];
    }

    if (subCategory !== 'all') {
      queryObj.subCategory = { $regex: new RegExp(`^${subCategory}$`, 'i') };
    }

    // Price Filtering
    if (priceRange !== 'all') {
      // Example: priceRange = "0-499" or "1000+"
      if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-');
        queryObj.price = { $gte: Number(min), $lte: Number(max) };
      } else if (priceRange.includes('+')) {
        const min = priceRange.replace('+', '');
        queryObj.price = { $gte: Number(min) };
      }
    }

    // Sorting
    let sortObj = {};
    if (sortBy === 'price-low') sortObj.price = 1;
    else if (sortBy === 'price-high') sortObj.price = -1;
    else if (sortBy === 'rating') sortObj.rating = -1;
    else if (sortBy === 'discount') sortObj.discount = -1;
    else sortObj.createdAt = -1; // Default relevance / newest

    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(queryObj).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(queryObj)
    ]);

    res.status(200).json({
      success: true,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      products
    });

  } catch (error) {
    logger.error('catalog.products.failed', { error, query: searchQuery });
    res.status(500).json({ success: false, message: 'Server error while fetching products' });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id, isActive: true }).lean();
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    logger.error('catalog.product.failed', { error, productId: req.params.id });
    res.status(500).json({ success: false, message: 'Server error while fetching product details' });
  }
};
