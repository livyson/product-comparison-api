# Exemplos de Uso da API

Este documento demonstra como usar os diferentes endpoints da Product Comparison API através de exemplos práticos.

## Base URL
```
http://localhost:3000/api
```

## 1. Listar Todos os Produtos

### Endpoint
```
GET /products
```

### Exemplo com cURL
```bash
curl http://localhost:3000/api/products
```

### Exemplo com JavaScript (fetch)
```javascript
const response = await fetch('http://localhost:3000/api/products');
const data = await response.json();
console.log(data);
```

### Resposta
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "iPhone 15 Pro",
      "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
      "description": "O iPhone mais avançado da Apple com chip A17 Pro...",
      "price": 999.99,
      "rating": 4.8,
      "specifications": { ... }
    }
  ],
  "total": 6
}
```

## 2. Filtrar Produtos

### Filtrar por Categoria
```bash
curl "http://localhost:3000/api/products?category=smartphones"
```

### Filtrar por Marca
```bash
curl "http://localhost:3000/api/products?brand=Apple"
```

### Filtrar por Disponibilidade
```bash
curl "http://localhost:3000/api/products?inStock=true"
```

### Múltiplos Filtros
```bash
curl "http://localhost:3000/api/products?category=smartphones&brand=Apple&inStock=true"
```

## 3. Buscar Produto por ID

### Endpoint
```
GET /products/:id
```

### Exemplo
```bash
curl http://localhost:3000/api/products/1
```

### Resposta
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "iPhone 15 Pro",
    "price": 999.99,
    "rating": 4.8,
    "specifications": { ... }
  }
}
```

## 4. Comparar Produtos

### Endpoint
```
GET /products/compare?ids=1,2,3
```

### Exemplo
```bash
curl "http://localhost:3000/api/products/compare?ids=1,2"
```

### Resposta
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "iPhone 15 Pro",
      "price": 999.99,
      "rating": 4.8
    },
    {
      "id": "2",
      "name": "Samsung Galaxy S24 Ultra",
      "price": 1199.99,
      "rating": 4.7
    }
  ],
  "total": 2,
  "requestedIds": ["1", "2"],
  "foundIds": ["1", "2"]
}
```

## 5. Buscar Produtos

### Endpoint
```
GET /products/search?q=query
```

### Exemplo
```bash
curl "http://localhost:3000/api/products/search?q=iPhone"
```

### Resposta
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "iPhone 15 Pro",
      "price": 999.99
    }
  ],
  "total": 1,
  "query": "iPhone"
}
```

## 6. Produtos por Categoria

### Endpoint
```
GET /products/category/:category
```

### Exemplo
```bash
curl http://localhost:3000/api/products/category/smartphones
```

## 7. Estatísticas dos Produtos

### Visão Geral
```bash
curl http://localhost:3000/api/products/stats/overview
```

### Faixa de Preços
```bash
curl http://localhost:3000/api/products/price-range
```

### Categorias Disponíveis
```bash
curl http://localhost:3000/api/products/categories/list
```

### Marcas Disponíveis
```bash
curl http://localhost:3000/api/products/brands/list
```

## 8. Exemplos de Uso em Aplicações

### Frontend React
```javascript
import React, { useState, useEffect } from 'react';

function ProductComparison() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();
      setProducts(data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const compareProducts = async (ids) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/products/compare?ids=${ids.join(',')}`
      );
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error comparing products:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Product Comparison</h1>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>Price: ${product.price}</p>
          <p>Rating: {product.rating}/5</p>
        </div>
      ))}
    </div>
  );
}

export default ProductComparison;
```

### Backend Node.js
```javascript
const axios = require('axios');

class ProductAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  async getAllProducts(filters = {}) {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${this.baseURL}/products?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }
  }

  async getProductById(id) {
    try {
      const response = await axios.get(`${this.baseURL}/products/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  async compareProducts(ids) {
    try {
      const response = await axios.get(
        `${this.baseURL}/products/compare?ids=${ids.join(',')}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to compare products: ${error.message}`);
    }
  }

  async searchProducts(query) {
    try {
      const response = await axios.get(`${this.baseURL}/products/search?q=${query}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }
  }
}

// Uso
const productAPI = new ProductAPI();

// Exemplo de uso
async function example() {
  try {
    // Buscar todos os smartphones
    const smartphones = await productAPI.getAllProducts({ category: 'smartphones' });
    console.log('Smartphones:', smartphones.data);

    // Comparar iPhone e Samsung
    const comparison = await productAPI.compareProducts(['1', '2']);
    console.log('Comparison:', comparison.data);

    // Buscar produtos com "chip"
    const searchResults = await productAPI.searchProducts('chip');
    console.log('Search results:', searchResults.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

example();
```

## 9. Tratamento de Erros

### Exemplo de Resposta de Erro
```json
{
  "success": false,
  "error": {
    "message": "Product not found",
    "code": "PRODUCT_NOT_FOUND"
  }
}
```

### Códigos de Status HTTP
- `200` - Sucesso
- `400` - Bad Request (parâmetros inválidos)
- `404` - Not Found (produto não encontrado)
- `500` - Internal Server Error (erro interno)

## 10. Limitações e Considerações

### Rate Limiting
- Máximo de 100 requisições por IP a cada 15 minutos
- Resposta de erro quando limite excedido

### Comparação de Produtos
- Máximo de 10 produtos por comparação
- IDs devem ser separados por vírgula

### Filtros
- Filtros são case-insensitive
- Múltiplos filtros podem ser combinados
- Filtros vazios são ignorados

## 11. Testes da API

### Health Check
```bash
curl http://localhost:3000/health
```

### Teste de CORS
```javascript
// Teste se a API aceita requisições do frontend
fetch('http://localhost:3000/api/products', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log('CORS test successful:', data))
.catch(error => console.error('CORS test failed:', error));
```

Estes exemplos demonstram as principais funcionalidades da API e como integrá-la em diferentes tipos de aplicações.
