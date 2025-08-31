const request = require('supertest');
const app = require('../src/server');

describe('Product API Endpoints', () => {
  // Test GET /api/products
  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('price');
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=smartphones')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.filters.category).toBe('smartphones');
      response.body.data.forEach(product => {
        expect(product.category).toBe('smartphones');
      });
    });

    it('should filter products by brand', async () => {
      const response = await request(app)
        .get('/api/products?brand=Apple')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.filters.brand).toBe('Apple');
      response.body.data.forEach(product => {
        expect(product.brand).toBe('Apple');
      });
    });

    it('should filter products by stock status', async () => {
      const response = await request(app)
        .get('/api/products?inStock=true')
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(product => {
        expect(product.inStock).toBe(true);
      });
    });

    it('should search products by query', async () => {
      const response = await request(app)
        .get('/api/products?search=iPhone')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.filters.search).toBe('iPhone');
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  // Test GET /api/products/:id
  describe('GET /api/products/:id', () => {
    it('should return a specific product by ID', async () => {
      const response = await request(app)
        .get('/api/products/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1');
      expect(response.body.data.name).toBe('iPhone 15 Pro');
    });

    it('should return 404 for non-existent product ID', async () => {
      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Produto não encontrado');
    });

    it('should return 200 for root products endpoint', async () => {
      const response = await request(app)
        .get('/api/products/')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  // Test GET /api/products/compare
  describe('GET /api/products/compare', () => {
    it('should compare multiple products by IDs', async () => {
      const response = await request(app)
        .get('/api/products/compare?ids=1,2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
      expect(response.body.data.comparison).toBeDefined();
      expect(response.body.data.comparison.total).toBe(2);
      expect(response.body.data.comparison.priceRange).toBeDefined();
      expect(response.body.data.comparison.ratingComparison).toBeDefined();
      expect(response.body.data.comparison.priceComparison).toBeDefined();
    });

    it('should return 400 for missing IDs parameter', async () => {
      const response = await request(app)
        .get('/api/products/compare')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Pelo menos um ID de produto válido é obrigatório');
    });

    it('should return 400 for empty IDs parameter', async () => {
      const response = await request(app)
        .get('/api/products/compare?ids=')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Pelo menos um ID de produto válido é obrigatório');
    });

    it('should limit comparison to maximum 10 products', async () => {
      const response = await request(app)
        .get('/api/products/compare?ids=1,2,3,4,5,6,7,8,9,10,11')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Máximo de 10 produtos podem ser comparados de uma vez');
    });
  });

  // Test GET /api/products/compare/detailed
  describe('GET /api/products/compare/detailed', () => {
    it('should provide detailed comparison analysis', async () => {
      const response = await request(app)
        .get('/api/products/compare/detailed?ids=1,2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analysis).toBeDefined();
      expect(response.body.data.analysis.categories).toBeDefined();
      expect(response.body.data.analysis.brands).toBeDefined();
      expect(response.body.data.analysis.priceAnalysis).toBeDefined();
      expect(response.body.data.analysis.ratingAnalysis).toBeDefined();
    });

    it('should return 400 for missing IDs parameter', async () => {
      const response = await request(app)
        .get('/api/products/compare/detailed')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Pelo menos um ID de produto válido é obrigatório');
    });

    it('should limit comparison to maximum 10 products', async () => {
      const response = await request(app)
        .get('/api/products/compare/detailed?ids=1,2,3,4,5,6,7,8,9,10,11')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Máximo de 10 produtos podem ser comparados de uma vez');
    });
  });



  // Test GET /api/products/compare/recommendations
  describe('GET /api/products/compare/recommendations', () => {
    it('should provide recommendations based on comparison', async () => {
      const response = await request(app)
        .get('/api/products/compare/recommendations?ids=1,2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.analyzedProducts).toBeDefined();
      expect(response.body.data.criteria).toBeDefined();
      expect(response.body.data.recommendations).toBeDefined();
      expect(response.body.data.recommendations.bestValue).toBeDefined();
      expect(response.body.data.recommendations.bestRated).toBeDefined();
      expect(response.body.data.recommendations.budgetFriendly).toBeDefined();
      expect(response.body.data.recommendations.premium).toBeDefined();
    });

    it('should accept custom criteria', async () => {
      const response = await request(app)
        .get('/api/products/compare/recommendations?ids=1,2&criteria=value,price')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.criteria).toEqual(['value', 'price']);
    });
  });

  // Test GET /api/products/category/:category
  describe('GET /api/products/category/:category', () => {
    it('should return products by category', async () => {
      const response = await request(app)
        .get('/api/products/category/smartphones')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.category).toBe('smartphones');
      response.body.data.forEach(product => {
        expect(product.category).toBe('smartphones');
      });
    });

    it('should return 400 for missing category', async () => {
      const response = await request(app)
        .get('/api/products/category/')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // Test GET /api/products/search
  describe('GET /api/products/search', () => {
    it('should search products by query', async () => {
      const response = await request(app)
        .get('/api/products/search?q=MacBook')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.query).toBe('MacBook');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 400 for missing search query', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Consulta de busca é obrigatória');
    });
  });

  // Test GET /api/products/stats/overview
  describe('GET /api/products/stats/overview', () => {
    it('should return product statistics', async () => {
      const response = await request(app)
        .get('/api/products/stats/overview')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('categories');
      expect(response.body.data).toHaveProperty('brands');
      expect(response.body.data).toHaveProperty('priceRange');
    });
  });

  // Test GET /api/products/categories/list
  describe('GET /api/products/categories/list', () => {
    it('should return list of categories', async () => {
      const response = await request(app)
        .get('/api/products/categories/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });
  });

  // Test GET /api/products/brands/list
  describe('GET /api/products/brands/list', () => {
    it('should return list of brands', async () => {
      const response = await request(app)
        .get('/api/products/brands/list')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });
  });

  // Test GET /api/products/price-range
  describe('GET /api/products/price-range', () => {
    it('should return price range statistics', async () => {
      const response = await request(app)
        .get('/api/products/price-range')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('min');
      expect(response.body.data).toHaveProperty('max');
      expect(response.body.data).toHaveProperty('average');
      expect(response.body.data).toHaveProperty('currency');
    });
  });

  // Test error handling
  describe('Error Handling', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/products/nonexistent/route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('não encontrada');
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id-format')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
