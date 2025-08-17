# Exemplos de Uso da API de Comparação de Produtos

Este arquivo contém exemplos práticos de como usar os diferentes endpoints da API para comparação de produtos.

## 1. Comparação Básica

### Comparar 2 smartphones
```bash
curl "http://localhost:3000/api/products/compare?ids=1,2"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "comparison": {
      "total": 2,
      "priceRange": {
        "min": 999.99,
        "max": 1199.99,
        "average": 1099.99
      },
      "ratingComparison": [
        {
          "id": "1",
          "name": "iPhone 15 Pro",
          "rating": 4.8,
          "price": 999.99,
          "category": "smartphones",
          "brand": "Apple"
        },
        {
          "id": "2",
          "name": "Samsung Galaxy S24 Ultra",
          "rating": 4.7,
          "price": 1199.99,
          "category": "smartphones",
          "brand": "Samsung"
        }
      ],
      "priceComparison": [
        {
          "id": "1",
          "name": "iPhone 15 Pro",
          "price": 999.99,
          "pricePerRating": 208.33
        },
        {
          "id": "2",
          "name": "Samsung Galaxy S24 Ultra",
          "price": 1199.99,
          "pricePerRating": 255.32
        }
      ]
    }
  }
}
```

## 2. Comparação Detalhada

### Análise completa de características
```bash
curl "http://localhost:3000/api/products/compare/detailed?ids=1,2,3"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "analysis": {
      "categories": ["smartphones", "laptops"],
      "brands": ["Apple", "Samsung"],
      "priceAnalysis": {
        "range": {
          "min": 999.99,
          "max": 1999.99,
          "average": 1399.99
        },
        "distribution": [
          {
            "id": "1",
            "name": "iPhone 15 Pro",
            "price": 999.99,
            "priceCategory": "Premium"
          },
          {
            "id": "2",
            "name": "Samsung Galaxy S24 Ultra",
            "price": 1199.99,
            "priceCategory": "Premium"
          },
          {
            "id": "3",
            "name": "MacBook Pro 14\" M3 Pro",
            "price": 1999.99,
            "priceCategory": "Premium"
          }
        ]
      },
      "ratingAnalysis": {
        "bestRated": {
          "id": "3",
          "name": "MacBook Pro 14\" M3 Pro",
          "rating": 4.9
        },
        "averageRating": 4.8
      },
      "valueAnalysis": [
        {
          "id": "1",
          "name": "iPhone 15 Pro",
          "price": 999.99,
          "rating": 4.8,
          "valueScore": 4.8,
          "recommendation": "Best Value"
        },
        {
          "id": "2",
          "name": "Samsung Galaxy S24 Ultra",
          "price": 1199.99,
          "rating": 4.7,
          "valueScore": 3.92,
          "recommendation": "Good Value"
        },
        {
          "id": "3",
          "name": "MacBook Pro 14\" M3 Pro",
          "price": 1999.99,
          "rating": 4.9,
          "valueScore": 2.45,
          "recommendation": "Consider Alternatives"
        }
      ]
    }
  }
}
```

## 3. Comparação Visual

### Layout otimizado para frontend
```bash
curl "http://localhost:3000/api/products/compare/visual?ids=1,2,3"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "layout": {
      "columns": 3,
      "maxColumns": 6,
      "responsive": "table"
    },
    "products": [
      {
        "id": "1",
        "name": "iPhone 15 Pro",
        "imageUrl": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
        "price": 999.99,
        "rating": 4.8,
        "category": "smartphones",
        "brand": "Apple",
        "inStock": true,
        "highlights": {
          "topFeature": "screen",
          "priceRange": "Premium",
          "ratingLevel": "Excellent"
        }
      }
    ],
    "comparison": {
      "priceRange": {
        "min": 999.99,
        "max": 1999.99
      },
      "categories": ["smartphones", "laptops"],
      "brands": ["Apple", "Samsung"],
      "bestValue": {
        "id": "1",
        "name": "iPhone 15 Pro"
      }
    }
  }
}
```

## 4. Matriz de Comparação

### Comparação lado a lado de características
```bash
curl "http://localhost:3000/api/products/compare/matrix?ids=1,2,3"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "features": ["screen", "storage", "ram", "processor", "camera", "battery"],
    "matrix": [
      {
        "feature": "screen",
        "values": [
          {
            "productId": "1",
            "productName": "iPhone 15 Pro",
            "value": "6.1 inch Super Retina XDR OLED",
            "hasFeature": true
          },
          {
            "productId": "2",
            "productName": "Samsung Galaxy S24 Ultra",
            "value": "6.8 inch Dynamic AMOLED 2X",
            "hasFeature": true
          },
          {
            "productId": "3",
            "productName": "MacBook Pro 14\" M3 Pro",
            "value": "14.2 inch Liquid Retina XDR",
            "hasFeature": true
          }
        ]
      }
    ],
    "summary": {
      "totalProducts": 3,
      "totalFeatures": 6,
      "priceRange": {
        "min": 999.99,
        "max": 1999.99,
        "average": 1399.99
      },
      "ratingRange": {
        "min": 4.7,
        "max": 4.9,
        "average": 4.8
      }
    }
  }
}
```

## 5. Recomendações

### Obter sugestões baseadas na comparação
```bash
curl "http://localhost:3000/api/products/compare/recommendations?ids=1,2&criteria=value,rating"
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "analyzedProducts": [...],
    "criteria": ["value", "rating"],
    "recommendations": {
      "bestValue": [
        {
          "id": "5",
          "name": "Sony WH-1000XM5",
          "price": 399.99,
          "rating": 4.8,
          "valueScore": 12.0,
          "reason": "Best value for money"
        }
      ],
      "bestRated": [
        {
          "id": "3",
          "name": "MacBook Pro 14\" M3 Pro",
          "price": 1999.99,
          "rating": 4.9,
          "reason": "Highest rated alternatives"
        }
      ],
      "budgetFriendly": [
        {
          "id": "6",
          "name": "Nintendo Switch OLED",
          "price": 349.99,
          "rating": 4.7,
          "reason": "More affordable options"
        }
      ],
      "premium": [
        {
          "id": "3",
          "name": "MacBook Pro 14\" M3 Pro",
          "price": 1999.99,
          "rating": 4.9,
          "reason": "Premium alternatives"
        }
      ]
    },
    "analysis": {
      "currentAveragePrice": 1099.99,
      "currentAverageRating": 4.75,
      "priceRange": {
        "min": 999.99,
        "max": 1199.99
      }
    }
  }
}
```

## 6. Casos de Uso Comuns

### Comparar smartphones da mesma categoria
```bash
# Comparar iPhone vs Samsung
curl "http://localhost:3000/api/products/compare/detailed?ids=1,2"

# Comparar laptops
curl "http://localhost:3000/api/products/compare/visual?ids=3,4"

# Comparar produtos de áudio
curl "http://localhost:3000/api/products/compare/matrix?ids=5"
```

### Buscar alternativas mais baratas
```bash
# Encontrar produtos mais acessíveis
curl "http://localhost:3000/api/products/compare/recommendations?ids=1,2&criteria=price"
```

### Análise de valor por categoria
```bash
# Comparar produtos de diferentes categorias
curl "http://localhost:3000/api/products/compare/detailed?ids=1,3,5"
```

## 7. Integração com Frontend

### JavaScript/Fetch
```javascript
// Comparação básica
const compareProducts = async (ids) => {
  const response = await fetch(`/api/products/compare?ids=${ids.join(',')}`);
  const data = await response.json();
  return data.data.comparison;
};

// Comparação visual
const getVisualComparison = async (ids) => {
  const response = await fetch(`/api/products/compare/visual?ids=${ids.join(',')}`);
  const data = await response.json();
  return data.data;
};

// Recomendações
const getRecommendations = async (ids, criteria = ['value', 'rating']) => {
  const response = await fetch(
    `/api/products/compare/recommendations?ids=${ids.join(',')}&criteria=${criteria.join(',')}`
  );
  const data = await response.json();
  return data.data.recommendations;
};
```

### React Hook
```javascript
import { useState, useEffect } from 'react';

const useProductComparison = (productIds) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productIds || productIds.length === 0) return;

    const fetchComparison = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/products/compare/detailed?ids=${productIds.join(',')}`
        );
        const data = await response.json();
        setComparison(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComparison();
  }, [productIds]);

  return { comparison, loading, error };
};
```

## 8. Tratamento de Erros

### Exemplos de respostas de erro
```json
{
  "success": false,
  "error": {
    "message": "At least one valid product ID is required",
    "code": "INVALID_IDS"
  }
}
```

### Códigos de erro comuns
- `INVALID_IDS`: IDs de produtos inválidos ou ausentes
- `TOO_MANY_PRODUCTS`: Excedeu o limite de produtos para comparação
- `PRODUCT_NOT_FOUND`: Produto não encontrado
- `MISSING_CATEGORY`: Categoria não especificada
- `VALIDATION_ERROR`: Erro de validação nos parâmetros

## 9. Limites e Restrições

- **Comparação básica**: Máximo 10 produtos
- **Comparação visual**: Máximo 6 produtos
- **Matriz de comparação**: Máximo 8 produtos
- **Recomendações**: Máximo 10 produtos analisados
- **Rate limiting**: 100 requisições por IP a cada 15 minutos
