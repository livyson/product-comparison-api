# 🚀 Product Comparison API

## Descrição do Projeto

**API RESTful especializada em comparação de produtos** desenvolvida como solução para o desafio "Backend Developer AI - Item Comparison". Esta API foi projetada especificamente para fornecer análises detalhadas, comparações visuais e recomendações inteligentes para ajudar usuários a tomar decisões de compra informadas.

## 🎯 Foco Principal: Comparação de Produtos

Esta API é especializada em:
- **Comparação lado a lado** de produtos com análise de características
- **Recomendações inteligentes** baseadas em múltiplos critérios (valor, preço, avaliação)
- **Visualizações otimizadas** para interfaces de usuário (máximo 6 produtos)
- **Matrizes de comparação** para análise detalhada de especificações (máximo 8 produtos)
- **Análise de valor** com scores e categorizações automáticas

## Objetivo

Construir uma **API backend avançada para comparação de produtos** que vai além de simplesmente fornecer detalhes de produtos. A implementação inclui algoritmos de análise, comparação inteligente e recomendações baseadas em dados, seguindo as melhores práticas estabelecidas de backend e fornecendo endpoints especializados para comparações avançadas.

## Arquitetura e Design

### Stack Tecnológico Escolhido

- **Runtime**: Node.js
- **Framework**: Express.js
- **Persistência**: Arquivos JSON locais (conforme solicitado)
- **Segurança**: Helmet.js, CORS, Rate Limiting
- **Logging**: Morgan
- **Testes**: Jest + Supertest

### Decisões Arquiteturais

1. **Estrutura Modular**: Separação clara entre rotas, controladores e serviços
2. **Middleware de Segurança**: Implementação de headers de segurança e rate limiting
3. **Tratamento de Erros Centralizado**: Middleware global para tratamento consistente de erros
4. **Validação de Dados**: Validação de parâmetros de entrada
5. **Logging Estruturado**: Logs para monitoramento e debugging

### Estrutura de Diretórios

```
src/
├── controllers/     # Controladores da API
├── services/        # Lógica de negócio
├── middleware/      # Middlewares customizados
├── data/           # Arquivos JSON de dados
├── utils/          # Utilitários e helpers
└── server.js       # Ponto de entrada da aplicação
```

## Endpoints Principais

### 1. GET /api/products
Retorna lista de todos os produtos disponíveis para comparação.

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Smartphone XYZ",
      "imageUrl": "https://example.com/phone.jpg",
      "description": "Smartphone de última geração",
      "price": 999.99,
      "rating": 4.5,
      "specifications": {
        "screen": "6.1 inch",
        "storage": "128GB",
        "ram": "8GB"
      }
    }
  ],
  "total": 1
}
```

### 2. GET /api/products/:id
Retorna detalhes de um produto específico.

**Parâmetros:**
- `id` (string): ID único do produto

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Smartphone XYZ",
    "imageUrl": "https://example.com/phone.jpg",
    "description": "Smartphone de última geração",
    "price": 999.99,
    "rating": 4.5,
    "specifications": {
      "screen": "6.1 inch",
      "storage": "128GB",
      "ram": "8GB"
    }
  }
}
```

### 3. GET /api/products/compare
Compara múltiplos produtos por IDs (comparação básica).

**Query Parameters:**
- `ids` (string): IDs dos produtos separados por vírgula (ex: `ids=1,2,3`)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "comparison": {
      "total": 2,
      "priceRange": { "min": 999.99, "max": 1199.99, "average": 1099.99 },
      "ratingComparison": [...],
      "priceComparison": [...]
    }
  }
}
```

### 4. GET /api/products/compare/detailed
Comparação detalhada com análise de características.

**Query Parameters:**
- `ids` (string): IDs dos produtos separados por vírgula (ex: `ids=1,2,3`)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "products": [...],
    "analysis": {
      "categories": ["smartphones"],
      "brands": ["Apple", "Samsung"],
      "priceAnalysis": { "range": {...}, "distribution": [...] },
      "ratingAnalysis": { "bestRated": {...}, "averageRating": 4.75 },
      "valueAnalysis": [...]
    }
  }
}
```

### 5. GET /api/products/compare/recommendations
Recomendações baseadas na análise de comparação.

**Query Parameters:**
- `ids` (string): IDs dos produtos separados por vírgula (ex: `ids=1,2,3`)
- `criteria` (string): Critérios de recomendação separados por vírgula (ex: `criteria=value,rating,price`)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "analyzedProducts": [...],
    "criteria": ["value", "rating", "price"],
    "recommendations": {
      "bestValue": [...],
      "bestRated": [...],
      "budgetFriendly": [...],
      "premium": [...]
    }
  }
}
```

## Tratamento de Erros

A API implementa tratamento de erros consistente com códigos HTTP apropriados:

- **400 Bad Request**: Parâmetros inválidos
- **404 Not Found**: Produto não encontrado
- **500 Internal Server Error**: Erro interno do servidor

**Formato de Erro:**
```json
{
  "success": false,
  "error": {
    "message": "Descrição do erro",
    "code": "ERROR_CODE"
  }
}
```

## Como Executar o Projeto

### Pré-requisitos
- Node.js 16.0.0 ou superior
- npm ou yarn

### Instalação
```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Executar em produção
npm start

# Executar testes
npm test
```

### Variáveis de Ambiente
O projeto pode ser configurado através de variáveis de ambiente:
- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente de execução (development/production)

## Testes

O projeto inclui testes automatizados usando Jest e Supertest:

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## Integração com Ferramentas GenAI

Durante o desenvolvimento, foram utilizadas as seguintes ferramentas de produtividade:

- **Cursor IDE**: Para desenvolvimento assistido por IA
- **GitHub Copilot**: Para sugestões de código e autocompletar
- **ChatGPT**: Para brainstorming de arquitetura e boas práticas

### Prompts Utilizados

Os prompts utilizados durante o desenvolvimento estão documentados no arquivo `prompts.md` para referência e transparência.

## Melhorias Futuras

- Implementação de cache Redis para melhor performance
- Autenticação e autorização
- Validação mais robusta com Joi ou Yup
- Documentação automática com Swagger/OpenAPI
- Métricas e monitoramento com Prometheus
- Containerização com Docker

## Licença

MIT License - veja o arquivo LICENSE para detalhes.
