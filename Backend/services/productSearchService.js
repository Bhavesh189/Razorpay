import { Product } from '../src/models/Product.js';

/**
 * Searches products in MongoDB based on extracted AI requirements.
 */
export async function searchProducts(requirements, cursor = null, limit = 30) {
  try {
    const query = { isActive: true };
    const addCategorySearch = (pattern, excludeAccessories = false) => {
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { category: { $regex: pattern } },
          { subCategory: { $regex: pattern } },
          { title: { $regex: pattern } }
        ]
      });
      if (excludeAccessories) {
        query.$nor = [
          { title: { $regex: /bag|backpack|sleeve|case|cover|charger|stand|dock|mouse|keyboard|accessor/i } },
          { subCategory: { $regex: /bag|backpack|accessor/i } }
        ];
      }
    };

    if (requirements.category && requirements.category !== 'all') {
      const catLower = requirements.category.toLowerCase();
      if (catLower.includes('laptop') || catLower.includes('computer')) {
        addCategorySearch(/laptop|computer/i, true);
      } else if (catLower.includes('phone') || catLower.includes('mobile')) {
        addCategorySearch(/mobile|phone|smartphone/i);
      } else if (catLower.includes('headphone') || catLower.includes('audio') || catLower.includes('earbud')) {
        addCategorySearch(/audio|headphone|earbud|speaker|neckband/i);
      } else if (catLower.includes('shoe') || catLower.includes('sneaker') || catLower.includes('footwear')) {
        addCategorySearch(/shoe|sneaker|footwear/i);
      } else if (catLower.includes('fashion') || catLower.includes('shirt') || catLower.includes('clothing')) {
        addCategorySearch(/fashion|shirt|t-shirt|hoodie|jeans|trouser|clothing|dress|saree|kurti/i);
      } else if (catLower.includes('beauty') || catLower.includes('trimmer') || catLower.includes('fragrance') || catLower.includes('perfume')) {
        addCategorySearch(/beauty|trimmer|shaver|fragrance|perfume|att[aà]r|skincare/i);
      } else if (catLower.includes('fitness') || catLower.includes('gym') || catLower.includes('sport')) {
        addCategorySearch(/fitness|gym|sport|dumbbell|yoga|workout|massage/i);
      } else if (catLower.includes('appliance') || catLower.includes('kitchen') || catLower.includes('home')) {
        addCategorySearch(/appliance|kitchen|home|air fryer|blender|kettle|vacuum/i);
      } else {
        query.$and = query.$and || [];
        query.$and.push({ $or: [
          { category: { $regex: new RegExp(requirements.category, 'i') } },
          { subCategory: { $regex: new RegExp(requirements.category, 'i') } }
        ] });
      }
    }

    if (requirements.query) {
      const queryTerms = String(requirements.query)
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length >= 3 && !/^(?:under|below|with|want|need|show|me|mujhe|chahiye|please)$/i.test(term))
        .slice(0, 8);
      if (queryTerms.length > 0) {
        query.$and = query.$and || [];
        query.$and.push({
          $or: queryTerms.flatMap(term => [
            { title: { $regex: new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
            { tags: { $regex: new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } },
            { subCategory: { $regex: new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') } }
          ])
        });
      }
    }

    // Budget constraints
    if (requirements.budget && requirements.budget.max) {
      query.price = { $lte: Number(requirements.budget.max) };
    } else if (requirements.budgetMax) {
      query.price = { $lte: Number(requirements.budgetMax) };
    }
    
    if (requirements.budget && requirements.budget.min) {
      query.price = { ...query.price, $gte: Number(requirements.budget.min) };
    }

    // Specification/Keyword matching
    const searchTerms = [];
    if (requirements.ram) searchTerms.push(requirements.ram);
    if (requirements.purpose) searchTerms.push(requirements.purpose);
    if (requirements.brand) searchTerms.push(requirements.brand);
    
    if (searchTerms.length > 0) {
      const regexStr = searchTerms.join('|');
      query.$and = query.$and || [];
      query.$and.push({
         $or: [
            { description: { $regex: new RegExp(regexStr, 'i') } },
            { title: { $regex: new RegExp(regexStr, 'i') } },
            { tags: { $regex: new RegExp(regexStr, 'i') } }
         ]
      });
    }

    // Cursor-based pagination (simple implementation using _id)
    if (cursor) {
      query._id = { $lt: cursor };
    }

    // Sorting: prioritize higher rated / highly reviewed products
    const products = await Product.find(query)
      .sort({ _id: -1, rating: -1 })
      .limit(limit)
      .lean();

    const mappedProducts = products.map(p => ({ ...p, id: p._id.toString() }));

    const hasMore = mappedProducts.length === limit;
    const nextCursor = hasMore ? mappedProducts[mappedProducts.length - 1].id : null;

    return {
      success: true,
      products: mappedProducts,
      hasMore,
      nextCursor
    };
  } catch (error) {
    console.error("[ProductSearchService] Error:", error);
    return { success: false, products: [], hasMore: false, error: error.message };
  }
}

/**
 * Gets related products based on a product category
 */
export async function getRelatedProducts(category, limit = 5) {
  try {
     let query = { isActive: true };
     
     const catLower = (category || "").toLowerCase();
     if (catLower.includes('laptop')) {
       query.subCategory = { $regex: /gaming|accessory/i };
     } else if (catLower.includes('phone')) {
       query.subCategory = { $regex: /audio|wearable/i };
     } else {
        query.category = { $regex: new RegExp(category, 'i') };
     }

     const products = await Product.find(query)
       .sort({ rating: -1 })
       .limit(limit)
       .lean();
     return products.map(p => ({ ...p, id: p._id.toString() }));
  } catch (error) {
    return [];
  }
}
