const express = require('express');
const productService = require('../services/productService');

const router = express.Router();

/**
 * GET /api/products
 * Obter todos os produtos com filtros opcionais
 */
router.get('/', async (req, res, next) => {
  try {
    // Extrair parâmetros de consulta para filtragem
    const { category, brand, inStock, search } = req.query;
    
    let products;
    
    // Lidar com funcionalidade de busca
    if (search) {
      products = await productService.searchProducts(search);
    } else {
      // Aplicar filtros
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
 * Comparar múltiplos produtos por IDs
 */
router.get('/compare', async (req, res, next) => {
  try {
    const { ids } = req.query;
    
    // Validar parâmetro ids
    if (!ids || ids.trim() === '') {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    // Analisar e validar IDs
    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    
    if (productIds.length === 0) {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    // Limitar comparação a máximo 10 produtos
    if (productIds.length > 10) {
      const error = new Error('Máximo de 10 produtos podem ser comparados de uma vez');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    
    // Dados de comparação aprimorados
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
 * Comparação detalhada com análise de recursos
 */
router.get('/compare/detailed', async (req, res, next) => {
  try {
    const { ids } = req.query;
    
    if (!ids || ids.trim() === '') {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    
    if (productIds.length === 0) {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    if (productIds.length > 10) {
      const error = new Error('Máximo de 10 produtos podem ser comparados de uma vez');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    
    // Comparação detalhada de recursos
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
 * Comparação visual lado a lado para frontend
 */
router.get('/compare/visual', async (req, res, next) => {
  try {
    const { ids } = req.query;
    
    if (!ids || ids.trim() === '') {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    
    if (productIds.length === 0) {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    if (productIds.length > 6) {
      const error = new Error('Máximo de 6 produtos podem ser comparados visualmente');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    
    // Dados de comparação visual otimizados para exibição no frontend
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
 * Matriz de comparação com todos os recursos lado a lado
 */
router.get('/compare/matrix', async (req, res, next) => {
  try {
    const { ids } = req.query;
    
    if (!ids || ids.trim() === '') {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    
    if (productIds.length === 0) {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    if (productIds.length > 8) {
      const error = new Error('Máximo de 8 produtos podem ser comparados na visualização de matriz');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    
    // Criar matriz de comparação
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
 * Obter recomendações baseadas na análise de comparação
 */
router.get('/compare/recommendations', async (req, res, next) => {
  try {
    const { ids, criteria } = req.query;
    
    if (!ids || ids.trim() === '') {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    const productIds = ids.split(',').map(id => id.trim()).filter(id => id);
    const recommendationCriteria = criteria ? criteria.split(',') : ['value', 'rating', 'price'];
    
    if (productIds.length === 0) {
      const error = new Error('Pelo menos um ID de produto válido é obrigatório');
      error.statusCode = 400;
      error.errorCode = 'INVALID_IDS';
      throw error;
    }

    if (productIds.length > 10) {
      const error = new Error('Máximo de 10 produtos podem ser analisados para recomendações');
      error.statusCode = 400;
      error.errorCode = 'TOO_MANY_PRODUCTS';
      throw error;
    }

    const products = await productService.getProductsByIds(productIds);
    const allProducts = await productService.getAllProducts();
    
    // Gerar recomendações baseadas nos critérios
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
 * Buscar produtos por consulta
 */
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      const error = new Error('Consulta de busca é obrigatória');
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
 * Obter visão geral das estatísticas dos produtos
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
 * Obter lista de categorias disponíveis
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
 * Obter lista de marcas disponíveis
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
 * Obter estatísticas de faixa de preço
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
 * Obter produtos por categoria
 */
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    
    if (!category || category.trim() === '') {
      const error = new Error('Categoria é obrigatória');
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
    // Definir código de status apropriado para validação de categoria
    if (error.message.includes('Categoria é obrigatória')) {
      error.statusCode = 400;
      error.errorCode = 'MISSING_CATEGORY';
    }
    next(error);
  }
});

/**
 * GET /api/products/:id
 * Obter produto por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validar parâmetro ID
    if (!id || id.trim() === '' || id === '') {
      const error = new Error('ID do produto é obrigatório');
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
    // Definir código de status apropriado para produto não encontrado
    if (error.message.includes('Product not found')) {
      error.statusCode = 404;
      error.errorCode = 'PRODUCT_NOT_FOUND';
      error.message = 'Produto não encontrado'; // Limpar a mensagem
    }
    next(error);
  }
});

module.exports = router;
