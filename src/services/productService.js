const fs = require('fs').promises;
const path = require('path');

/**
 * Serviço de Produtos
 * Gerencia a lógica de negócio para operações de produtos
 */
class ProductService {
  constructor() {
    this.dataPath = path.join(__dirname, '../data/products.json');
  }

  /**
   * Ler dados dos produtos do arquivo JSON
   * @returns {Promise<Array>} Array de produtos
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
   * Obter todos os produtos com filtros opcionais
   * @param {Object} filters - Filtros opcionais (category, brand, inStock)
   * @returns {Promise<Array>} Produtos filtrados
   */
  async getAllProducts(filters = {}) {
    try {
      let products = await this.readProductsData();

      // Aplicar filtros se fornecidos
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
   * Obter produto por ID
   * @param {string} id - ID do produto
   * @returns {Promise<Object>} Objeto do produto
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
   * Obter produtos por múltiplos IDs para comparação
   * @param {Array<string>} ids - Array de IDs dos produtos
   * @returns {Promise<Array>} Array de produtos
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

      // Ordenar produtos pela ordem dos IDs fornecidos
      const sortedProducts = ids
        .map(id => foundProducts.find(product => product.id === id))
        .filter(Boolean);

      return sortedProducts;
    } catch (error) {
      throw new Error(`Failed to get products for comparison: ${error.message}`);
    }
  }

  /**
   * Buscar produtos por nome ou descrição
   * @param {string} query - Consulta de busca
   * @returns {Promise<Array>} Array de produtos correspondentes
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
   * Obter produtos por categoria
   * @param {string} category - Categoria do produto
   * @returns {Promise<Array>} Array de produtos na categoria
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
   * Obter categorias disponíveis
   * @returns {Promise<Array>} Array de categorias únicas
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
   * Obter marcas disponíveis
   * @returns {Promise<Array>} Array de marcas únicas
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
   * Obter estatísticas dos produtos
   * @returns {Promise<Object>} Estatísticas dos produtos
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
