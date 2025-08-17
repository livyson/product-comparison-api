const fs = require('fs').promises;
const path = require('path');

/**
 * Product Service
 * Handles business logic for product operations
 */
class ProductService {
  constructor() {
    this.dataPath = path.join(__dirname, '../data/products.json');
  }

  /**
   * Read products data from JSON file
   * @returns {Promise<Array>} Array of products
   */
  async readProductsData() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Products data file not found');
      }
      throw new Error('Failed to read products data');
    }
  }

  /**
   * Get all products with optional filtering
   * @param {Object} filters - Optional filters (category, brand, inStock)
   * @returns {Promise<Array>} Filtered products
   */
  async getAllProducts(filters = {}) {
    try {
      let products = await this.readProductsData();

      // Apply filters if provided
      if (filters.category) {
        products = products.filter(product => 
          product.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      if (filters.brand) {
        products = products.filter(product => 
          product.brand.toLowerCase() === filters.brand.toLowerCase()
        );
      }

      if (filters.inStock !== undefined) {
        products = products.filter(product => 
          product.inStock === filters.inStock
        );
      }

      return products;
    } catch (error) {
      throw new Error(`Failed to get products: ${error.message}`);
    }
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product object
   */
  async getProductById(id) {
    try {
      const products = await this.readProductsData();
      const product = products.find(p => p.id === id);
      
      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      throw new Error(`Failed to get product: ${error.message}`);
    }
  }

  /**
   * Get products by multiple IDs for comparison
   * @param {Array<string>} ids - Array of product IDs
   * @returns {Promise<Array>} Array of products
   */
  async getProductsByIds(ids) {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error('Product IDs array is required');
      }

      const products = await this.readProductsData();
      const foundProducts = products.filter(product => ids.includes(product.id));

      if (foundProducts.length === 0) {
        throw new Error('No products found with the provided IDs');
      }

      // Sort products by the order of provided IDs
      const sortedProducts = ids
        .map(id => foundProducts.find(product => product.id === id))
        .filter(Boolean);

      return sortedProducts;
    } catch (error) {
      throw new Error(`Failed to get products for comparison: ${error.message}`);
    }
  }

  /**
   * Search products by name or description
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching products
   */
  async searchProducts(query) {
    try {
      if (!query || typeof query !== 'string') {
        throw new Error('Search query is required');
      }

      const products = await this.readProductsData();
      const searchTerm = query.toLowerCase();

      const matchingProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        product.brand.toLowerCase().includes(searchTerm)
      );

      return matchingProducts;
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }

  /**
   * Get products by category
   * @param {string} category - Product category
   * @returns {Promise<Array>} Array of products in category
   */
  async getProductsByCategory(category) {
    try {
      if (!category) {
        throw new Error('Category is required');
      }

      const products = await this.readProductsData();
      return products.filter(product => 
        product.category.toLowerCase() === category.toLowerCase()
      );
    } catch (error) {
      throw new Error(`Failed to get products by category: ${error.message}`);
    }
  }

  /**
   * Get available categories
   * @returns {Promise<Array>} Array of unique categories
   */
  async getCategories() {
    try {
      const products = await this.readProductsData();
      const categories = [...new Set(products.map(product => product.category))];
      return categories.sort();
    } catch (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }
  }

  /**
   * Get available brands
   * @returns {Promise<Array>} Array of unique brands
   */
  async getBrands() {
    try {
      const products = await this.readProductsData();
      const brands = [...new Set(products.map(product => product.brand))];
      return brands.sort();
    } catch (error) {
      throw new Error(`Failed to get brands: ${error.message}`);
    }
  }

  /**
   * Get product statistics
   * @returns {Promise<Object>} Product statistics
   */
  async getProductStats() {
    try {
      const products = await this.readProductsData();
      
      const stats = {
        total: products.length,
        categories: await this.getCategories(),
        brands: await this.getBrands(),
        priceRange: {
          min: Math.min(...products.map(p => p.price)),
          max: Math.max(...products.map(p => p.price)),
          average: products.reduce((sum, p) => sum + p.price, 0) / products.length
        },
        inStock: products.filter(p => p.inStock).length,
        outOfStock: products.filter(p => !p.inStock).length
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get product statistics: ${error.message}`);
    }
  }
}

module.exports = new ProductService();
