const productService = require('../src/services/productService');

describe('Product Service', () => {
  // Test readProductsData
  describe('readProductsData', () => {
    it('should read products data successfully', async () => {
      const products = await productService.readProductsData();
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0]).toHaveProperty('id');
      expect(products[0]).toHaveProperty('name');
      expect(products[0]).toHaveProperty('price');
    });
  });

  // Test getAllProducts
  describe('getAllProducts', () => {
    it('should return all products without filters', async () => {
      const products = await productService.getAllProducts();
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('should filter products by category', async () => {
      const products = await productService.getAllProducts({ category: 'smartphones' });
      
      expect(Array.isArray(products)).toBe(true);
      products.forEach(product => {
        expect(product.category).toBe('smartphones');
      });
    });

    it('should filter products by brand', async () => {
      const products = await productService.getAllProducts({ brand: 'Apple' });
      
      expect(Array.isArray(products)).toBe(true);
      products.forEach(product => {
        expect(product.brand).toBe('Apple');
      });
    });

    it('should filter products by stock status', async () => {
      const products = await productService.getAllProducts({ inStock: true });
      
      expect(Array.isArray(products)).toBe(true);
      products.forEach(product => {
        expect(product.inStock).toBe(true);
      });
    });

    it('should apply multiple filters', async () => {
      const products = await productService.getAllProducts({ 
        category: 'smartphones', 
        brand: 'Apple' 
      });
      
      expect(Array.isArray(products)).toBe(true);
      products.forEach(product => {
        expect(product.category).toBe('smartphones');
        expect(product.brand).toBe('Apple');
      });
    });
  });

  // Test getProductById
  describe('getProductById', () => {
    it('should return product by valid ID', async () => {
      const product = await productService.getProductById('1');
      
      expect(product).toBeDefined();
      expect(product.id).toBe('1');
      expect(product.name).toBe('iPhone 15 Pro');
    });

    it('should throw error for non-existent ID', async () => {
      await expect(productService.getProductById('999')).rejects.toThrow('Falha ao obter produto: Produto não encontrado');
    });

    it('should throw error for invalid ID', async () => {
      await expect(productService.getProductById('')).rejects.toThrow('Falha ao obter produto: Produto não encontrado');
    });
  });

  // Test getProductsByIds
  describe('getProductsByIds', () => {
    it('should return products by multiple IDs', async () => {
      const products = await productService.getProductsByIds(['1', '2']);
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(2);
      expect(products[0].id).toBe('1');
      expect(products[1].id).toBe('2');
    });

    it('should maintain order of requested IDs', async () => {
      const products = await productService.getProductsByIds(['3', '1', '2']);
      
      expect(products[0].id).toBe('3');
      expect(products[1].id).toBe('1');
      expect(products[2].id).toBe('2');
    });

    it('should throw error for empty IDs array', async () => {
      await expect(productService.getProductsByIds([])).rejects.toThrow('Falha ao obter produtos para comparação: Array de IDs dos produtos é obrigatório');
    });

    it('should throw error for non-array IDs', async () => {
      await expect(productService.getProductsByIds('1,2')).rejects.toThrow('Falha ao obter produtos para comparação: Array de IDs dos produtos é obrigatório');
    });

    it('should handle non-existent IDs gracefully', async () => {
      const products = await productService.getProductsByIds(['1', '999', '2']);
      
      expect(products.length).toBe(2);
      expect(products[0].id).toBe('1');
      expect(products[1].id).toBe('2');
    });
  });

  // Test searchProducts
  describe('searchProducts', () => {
    it('should search products by name', async () => {
      const products = await productService.searchProducts('iPhone');
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      expect(products[0].name).toContain('iPhone');
    });

    it('should search products by description', async () => {
      const products = await productService.searchProducts('chip');
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
    });

    it('should search products by brand', async () => {
      const products = await productService.searchProducts('Apple');
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeGreaterThan(0);
      products.forEach(product => {
        expect(product.brand).toBe('Apple');
      });
    });

    it('should return empty array for no matches', async () => {
      const products = await productService.searchProducts('nonexistentproduct');
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(0);
    });

    it('should throw error for missing query', async () => {
      await expect(productService.searchProducts('')).rejects.toThrow('Falha ao buscar produtos: Consulta de busca é obrigatória');
    });

    it('should throw error for non-string query', async () => {
      await expect(productService.searchProducts(123)).rejects.toThrow('Falha ao buscar produtos: Consulta de busca é obrigatória');
    });
  });

  // Test getProductsByCategory
  describe('getProductsByCategory', () => {
    it('should return products by category', async () => {
      const products = await productService.getProductsByCategory('smartphones');
      
      expect(Array.isArray(products)).toBe(true);
      products.forEach(product => {
        expect(product.category).toBe('smartphones');
      });
    });

    it('should return empty array for non-existent category', async () => {
      const products = await productService.getProductsByCategory('nonexistent');
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBe(0);
    });

    it('should throw error for missing category', async () => {
      await expect(productService.getProductsByCategory('')).rejects.toThrow('Falha ao obter produtos por categoria: Categoria é obrigatória');
    });
  });

  // Test getCategories
  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const categories = await productService.getCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      
      // Check for uniqueness
      const uniqueCategories = [...new Set(categories)];
      expect(categories.length).toBe(uniqueCategories.length);
    });

    it('should return sorted categories', async () => {
      const categories = await productService.getCategories();
      
      const sortedCategories = [...categories].sort();
      expect(categories).toEqual(sortedCategories);
    });
  });

  // Test getBrands
  describe('getBrands', () => {
    it('should return unique brands', async () => {
      const brands = await productService.getBrands();
      
      expect(Array.isArray(brands)).toBe(true);
      expect(brands.length).toBeGreaterThan(0);
      
      // Check for uniqueness
      const uniqueBrands = [...new Set(brands)];
      expect(brands.length).toBe(uniqueBrands.length);
    });

    it('should return sorted brands', async () => {
      const brands = await productService.getBrands();
      
      const sortedBrands = [...brands].sort();
      expect(brands).toEqual(sortedBrands);
    });
  });

  // Test getProductStats
  describe('getProductStats', () => {
    it('should return complete product statistics', async () => {
      const stats = await productService.getProductStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('brands');
      expect(stats).toHaveProperty('priceRange');
      expect(stats).toHaveProperty('inStock');
      expect(stats).toHaveProperty('outOfStock');
    });

    it('should calculate correct price range', async () => {
      const stats = await productService.getProductStats();
      
      expect(stats.priceRange.min).toBeLessThanOrEqual(stats.priceRange.max);
      expect(stats.priceRange.average).toBeGreaterThanOrEqual(stats.priceRange.min);
      expect(stats.priceRange.average).toBeLessThanOrEqual(stats.priceRange.max);
    });

    it('should calculate correct stock counts', async () => {
      const stats = await productService.getProductStats();
      
      expect(stats.inStock + stats.outOfStock).toBe(stats.total);
    });
  });
});
