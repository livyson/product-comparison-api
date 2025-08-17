const express = require('express');
const productService = require('../services/productService');

const router = express.Router();

/**
 * GET /api/products
 * Get all products with optional filtering
 */
router.get('/', async (req, res, next) => {
  try {
    // Extract query parameters for filtering
    const { category, brand, inStock, search } = req.query;
    
    let products;
    
    // Handle search functionality
    if (search) {
      products = await productService.searchProducts(search);
    } else {
      // Apply filters
      const filters = {};
      if (category) filters.category = category;
      if (brand) filters.brand = brand;
      if (inStock !== undefined) {
        filters.inStock = inStock === 'true';
      }
      
      products = await productService.getAllProducts(filters);
    }

    res.json({
      success: true,
      data: products,
      total: products.length,
      filters: { category, brand, inStock, search }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/compare
 * Compare multiple products by IDs
 */
router.get('/compare', async (req, res, next) => {
  try {
    const { ids } = req.query;
    
    // Validate ids parameter
    if (!ids || ids.trim() === '') {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    // Parse and validate IDs
    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    
    if (productIds.length === 0) {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    // Limit comparison to maximum 10 products
    if (productIds.length > 10) {
      const error = new Error('Maximum 10 products can be compared at once');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    
    // Enhanced comparison data
    const comparisonData = {
      products: products,
      comparison: {
        total: products.length,
        requestedIds: productIds,
        foundIds: products.map(p => p.id),
        missingIds: productIds.filter(id => !products.find(p => p.id === id)),
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price)),
          average: Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length * 100) / 100
        },
        ratingComparison: products.map(p => ({
          id: p.id,
          name: p.name,
          rating: p.rating,
          price: p.price,
          category: p.category,
          brand: p.brand
        })).sort((a, b) => b.rating - a.rating),
        priceComparison: products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          pricePerRating: Math.round((p.price / p.rating) * 100) / 100
        })).sort((a, b) => a.price - b.price)
      }
    };
    
    res.json({
      success: true,
      data: comparisonData,
      total: products.length,
      requestedIds: productIds,
      foundIds: products.map(p => p.id)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/compare/detailed
 * Detailed comparison with feature analysis
 */
router.get('/compare/detailed', async (req, res, next) => {
  try {
    const { ids } = req.query;
    
    if (!ids || ids.trim() === '') {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    
    if (productIds.length === 0) {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    if (productIds.length > 10) {
      const error = new Error('Maximum 10 products can be compared at once');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    
    // Detailed feature comparison
    const featureComparison = {
      products: products,
      analysis: {
        categories: [...new Set(products.map(p => p.category))],
        brands: [...new Set(products.map(p => p.brand))],
        priceAnalysis: {
          range: {
            min: Math.min(...products.map(p => p.price)),
            max: Math.max(...products.map(p => p.price)),
            average: Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length * 100) / 100
          },
          distribution: products.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            priceCategory: p.price < 500 ? 'Budget' : p.price < 1000 ? 'Mid-range' : 'Premium'
          }))
        },
        ratingAnalysis: {
          bestRated: products.reduce((best, current) => current.rating > best.rating ? current : best),
          averageRating: Math.round(products.reduce((sum, p) => sum + p.rating, 0) / products.length * 100) / 100,
          ratingDistribution: products.map(p => ({
            id: p.id,
            name: p.name,
            rating: p.rating,
            ratingCategory: p.rating >= 4.5 ? 'Excellent' : p.rating >= 4.0 ? 'Good' : p.rating >= 3.5 ? 'Average' : 'Below Average'
          }))
        },
        valueAnalysis: products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          rating: p.rating,
          valueScore: Math.round((p.rating / p.price * 1000) * 100) / 100,
          recommendation: p.rating >= 4.5 && p.price < 1000 ? 'Best Value' : 
                         p.rating >= 4.0 && p.price < 800 ? 'Good Value' : 'Consider Alternatives'
        })).sort((a, b) => b.valueScore - a.valueScore)
      }
    };
    
    res.json({
      success: true,
      data: featureComparison,
      total: products.length,
      requestedIds: productIds,
      foundIds: products.map(p => p.id)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/compare/visual
 * Side-by-side visual comparison for frontend
 */
router.get('/compare/visual', async (req, res, next) => {
  try {
    const { ids } = req.query;
    
    if (!ids || ids.trim() === '') {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    
    if (productIds.length === 0) {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    if (productIds.length > 6) {
      const error = new Error('Maximum 6 products can be compared visually');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    
    // Visual comparison data optimized for frontend display
    const visualComparison = {
      layout: {
        columns: products.length,
        maxColumns: 6,
        responsive: products.length > 3 ? 'grid' : 'table'
      },
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        price: p.price,
        rating: p.rating,
        category: p.category,
        brand: p.brand,
        inStock: p.inStock,
        highlights: {
          topFeature: p.specifications ? Object.keys(p.specifications)[0] : 'N/A',
          priceRange: p.price < 500 ? 'Budget' : p.price < 1000 ? 'Mid-range' : 'Premium',
          ratingLevel: p.rating >= 4.5 ? 'Excellent' : p.rating >= 4.0 ? 'Good' : 'Average'
        }
      })),
      comparison: {
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price))
        },
        categories: [...new Set(products.map(p => p.category))],
        brands: [...new Set(products.map(p => p.brand))],
        bestValue: products.reduce((best, current) => 
          (current.rating / current.price) > (best.rating / best.price) ? current : best
        )
      }
    };
    
    res.json({
      success: true,
      data: visualComparison,
      total: products.length,
      requestedIds: productIds,
      foundIds: products.map(p => p.id)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/compare/matrix
 * Comparison matrix with all features side-by-side
 */
router.get('/compare/matrix', async (req, res, next) => {
  try {
    const { ids } = req.query;
    
    if (!ids || ids.trim() === '') {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    
    if (productIds.length === 0) {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    if (productIds.length > 8) {
      const error = new Error('Maximum 8 products can be compared in matrix view');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    
    // Create comparison matrix
    const allFeatures = new Set();
    products.forEach(p => {
      if (p.specifications) {
        Object.keys(p.specifications).forEach(feature => allFeatures.add(feature));
      }
    });
    
    const matrixComparison = {
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        price: p.price,
        rating: p.rating,
        category: p.category,
        brand: p.brand,
        inStock: p.inStock
      })),
      features: Array.from(allFeatures),
      matrix: Array.from(allFeatures).map(feature => ({
        feature: feature,
        values: products.map(p => ({
          productId: p.id,
          productName: p.name,
          value: p.specifications && p.specifications[feature] ? p.specifications[feature] : 'N/A',
          hasFeature: p.specifications && p.specifications[feature] ? true : false
        }))
      })),
      summary: {
        totalProducts: products.length,
        totalFeatures: allFeatures.size,
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price)),
          average: Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length * 100) / 100
        },
        ratingRange: {
          min: Math.min(...products.map(p => p.rating)),
          max: Math.max(...products.map(p => p.rating)),
          average: Math.round(products.reduce((sum, p) => sum + p.rating, 0) / products.length * 100) / 100
        }
      }
    };
    
    res.json({
      success: true,
      data: matrixComparison,
      total: products.length,
      requestedIds: productIds,
      foundIds: products.map(p => p.id)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/compare/recommendations
 * Get recommendations based on comparison analysis
 */
router.get('/compare/recommendations', async (req, res, next) => {
  try {
    const { ids, criteria } = req.query;
    
    if (!ids || ids.trim() === '') {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    const recommendationCriteria = criteria ? criteria.split(',') : ['value', 'rating', 'price'];
    
    if (productIds.length === 0) {
      const error = new Error('At least one valid product ID is required');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    if (productIds.length > 10) {
      const error = new Error('Maximum 10 products can be analyzed for recommendations');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    const allProducts = await productService.getAllProducts();
    
    // Generate recommendations based on criteria
    const recommendations = {
      analyzedProducts: products,
      criteria: recommendationCriteria,
      recommendations: {
        bestValue: allProducts
          .filter(p => !productIds.includes(p.id))
          .sort((a, b) => (b.rating / b.price) - (a.rating / a.price))
          .slice(0, 3)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            rating: p.rating,
            valueScore: Math.round((p.rating / p.price * 1000) * 100) / 100,
            reason: 'Best value for money'
          })),
        bestRated: allProducts
          .filter(p => !productIds.includes(p.id))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            rating: p.rating,
            reason: 'Highest rated alternatives'
          })),
        budgetFriendly: allProducts
          .filter(p => !productIds.includes(p.id) && p.price < Math.min(...products.map(p => p.price)))
          .sort((a, b) => a.price - b.price)
          .slice(0, 3)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            rating: p.rating,
            reason: 'More affordable options'
          })),
        premium: allProducts
          .filter(p => !productIds.includes(p.id) && p.price > Math.max(...products.map(p => p.price)))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 3)
          .map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            rating: p.rating,
            reason: 'Premium alternatives'
          }))
      },
      analysis: {
        currentAveragePrice: Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length * 100) / 100,
        currentAverageRating: Math.round(products.reduce((sum, p) => sum + p.rating, 0) / products.length * 100) / 100,
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price))
        }
      }
    };
    
    res.json({
      success: true,
      data: recommendations,
      total: products.length,
      requestedIds: productIds,
      foundIds: products.map(p => p.id)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/search
 * Search products by query
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      const error = new Error('Search query is required');
      error.statusCode = 400;
      error.errorCode = 'MISSING_QUERY';
      throw error;
    }

    const products = await productService.searchProducts(q);
    
    res.json({
      success: true,
      data: products,
      total: products.length,
      query: q
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/stats/overview
 * Get product statistics overview
 */
router.get('/stats/overview', async (req, res, next) => {
  try {
    const stats = await productService.getProductStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/categories/list
 * Get list of available categories
 */
router.get('/categories/list', async (req, res, next) => {
  try {
    const categories = await productService.getCategories();
    
    res.json({
      success: true,
      data: categories,
      total: categories.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/brands/list
 * Get list of available brands
 */
router.get('/brands/list', async (req, res, next) => {
  try {
    const brands = await productService.getBrands();
    
    res.json({
      success: true,
      data: brands,
      total: brands.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/price-range
 * Get price range statistics
 */
router.get('/price-range', async (req, res, next) => {
  try {
    const stats = await productService.getProductStats();
    
    res.json({
      success: true,
      data: {
        min: stats.priceRange.min,
        max: stats.priceRange.max,
        average: Math.round(stats.priceRange.average * 100) / 100,
        currency: 'USD'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/category/:category
 * Get products by category
 */
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    
    if (!category || category.trim() === '') {
      const error = new Error('Category is required');
      error.statusCode = 400;
      error.errorCode = 'MISSING_CATEGORY';
      throw error;
    }

    const products = await productService.getProductsByCategory(category);
    
    res.json({
      success: true,
      data: products,
      total: products.length,
      category: category
    });
  } catch (error) {
    // Set proper status code for category validation
    if (error.message.includes('Category is required')) {
      error.statusCode = 400;
      error.errorCode = 'MISSING_CATEGORY';
    }
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Get product by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate ID parameter
    if (!id || id.trim() === '' || id === '') {
      const error = new Error('Product ID is required');
      error.statusCode = 404;
      error.errorCode = 'MISSING_ID';
      throw error;
    }

    const product = await productService.getProductById(id);
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    // Set proper status code for product not found
    if (error.message.includes('Product not found')) {
      error.statusCode = 404;
      error.errorCode = 'PRODUCT_NOT_FOUND';
      error.message = 'Product not found'; // Clean up the message
    }
    next(error);
  }
});

module.exports = router;
