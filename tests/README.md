# 🧪 Testes Automatizados - Xperts Center Backend

Este diretório contém todos os testes automatizados para o projeto Xperts Center Backend, organizados por categoria e tipo.

## 📁 Estrutura dos Testes

```
tests/
├── unit/                    # Testes unitários
│   ├── services/           # Testes dos serviços de negócio
│   ├── clients/            # Testes dos clientes de API externa
│   └── utils/              # Testes de utilitários
├── integration/            # Testes de integração
│   ├── api/               # Testes dos endpoints da API
│   ├── database/          # Testes de banco de dados
│   └── external/          # Testes de integrações externas
├── performance/           # Testes de performance
├── security/              # Testes de segurança
├── fixtures/              # Dados de teste
│   ├── mock-data/         # Dados mockados
│   └── test-db/           # Configuração de banco de teste
├── setup.js               # Configuração global dos testes
└── README.md              # Esta documentação
```

## 🚀 Como Executar os Testes

### Executar Todos os Testes
```bash
npm test
```

### Executar Testes Específicos
```bash
# Apenas testes unitários
npm run test:unit

# Apenas testes de integração
npm run test:integration

# Apenas testes de performance
npm run test:performance

# Apenas testes de segurança
npm run test:security
```

### Executar com Cobertura
```bash
npm run test:coverage
```

### Executar em Modo Watch
```bash
npm run test:watch
```

## 📊 Cobertura de Testes

### Metas de Cobertura
- **Services**: 90%+
- **Clients**: 85%+
- **Routes**: 80%+
- **Models**: 85%+
- **Geral**: 80%+

### Relatório de Cobertura
Após executar `npm run test:coverage`, o relatório será gerado em:
- `coverage/lcov-report/index.html` - Relatório HTML
- `coverage/lcov.info` - Relatório LCOV

## 🧪 Tipos de Testes

### 1. Testes Unitários (`tests/unit/`)

Testam funções e módulos isoladamente, sem dependências externas.

#### Services
- **usuariosCriacaoServico.test.js**: Testa lógica de criação de usuários
- **gerenciadorMatrizesServico.test.js**: Testa operações com matrizes
- **gerenciadorTimeoutServico.test.js**: Testa configuração de timeouts

#### Clients
- **idwallV3Cliente.test.js**: Testa integração com API V3
- **backofficeClient.test.js**: Testa integração com Backoffice
- **marketingCloudCliente.test.js**: Testa integração com Marketing Cloud

### 2. Testes de Integração (`tests/integration/`)

Testam a integração entre diferentes componentes do sistema.

#### API Endpoints
- **backoffice.test.js**: Testa endpoints do backoffice
- **matrizes-lote.test.js**: Testa operações em lote de matrizes
- **error-handling.test.js**: Testa tratamento de erros

#### Banco de Dados
- **database.test.js**: Testa operações de banco de dados
- **migrations.test.js**: Testa migrações de schema

### 3. Testes de Performance (`tests/performance/`)

Testam a performance e escalabilidade do sistema.

- **operacoes-lote.test.js**: Testa performance de operações em lote
- **concurrent-users.test.js**: Testa carga de usuários simultâneos
- **memory-usage.test.js**: Testa uso de memória

### 4. Testes de Segurança (`tests/security/`)

Testam aspectos de segurança da aplicação.

- **autenticacao-seguranca.test.js**: Testa autenticação e autorização
- **input-validation.test.js**: Testa validação de entrada
- **cors-security.test.js**: Testa configuração CORS

## 🔧 Configuração

### Variáveis de Ambiente para Testes
As variáveis de ambiente são configuradas automaticamente no arquivo `tests/setup.js`:

```javascript
process.env.NODE_ENV = 'test';
process.env.PORT = '8081';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'xperts_test';
// ... outras variáveis
```

### Mock de Dependências Externas
Todos os clientes externos são mockados para evitar dependências reais durante os testes:

```javascript
jest.mock('../../../src/clients/idwallV3Cliente');
jest.mock('../../../src/clients/backofficeClient');
jest.mock('../../../src/clients/marketingCloudCliente');
```

## 📝 Convenções de Nomenclatura

### Arquivos de Teste
- Nome do arquivo: `nomeDoModulo.test.js`
- Exemplo: `usuariosCriacaoServico.test.js`

### Descrições de Teste
- Use português para descrições
- Seja específico sobre o que está sendo testado
- Exemplo: `'deve criar usuário com dados válidos'`

### Estrutura de Teste
```javascript
describe('NomeDoModulo', () => {
  beforeEach(() => {
    // Setup antes de cada teste
  });

  describe('Funcionalidade Específica', () => {
    test('deve fazer algo específico', async () => {
      // Teste
    });
  });
});
```

## 🐛 Debugging de Testes

### Executar Teste Específico
```bash
npm test -- --testNamePattern="nome do teste"
```

### Executar Arquivo Específico
```bash
npm test -- tests/unit/services/usuariosCriacaoServico.test.js
```

### Modo Verbose
```bash
npm test -- --verbose
```

## 📈 Métricas de Qualidade

### Performance
- **Tempo de Execução**: Máximo 30s para operações em lote
- **Throughput**: Mínimo 3 usuários/segundo
- **Latência**: Consistente com variação máxima de 5s

### Segurança
- **CORS**: Configurado corretamente
- **Rate Limiting**: Implementado e funcional
- **Input Validation**: Todos os inputs validados
- **Headers de Segurança**: Todos configurados

### Confiabilidade
- **Tratamento de Erros**: 100% dos cenários cobertos
- **Fallbacks**: Implementados para APIs externas
- **Logs**: Estruturados e informativos

## 🔄 CI/CD Integration

### GitHub Actions
Os testes são executados automaticamente em:
- Pull Requests
- Push para main
- Releases

### Pré-commit Hooks
```bash
# Instalar husky (se necessário)
npm install --save-dev husky

# Configurar pre-commit
npx husky add .husky/pre-commit "npm test"
```

## 🚨 Troubleshooting

### Problemas Comuns

#### Testes Falhando por Timeout
```bash
# Aumentar timeout
jest --testTimeout=60000
```

#### Problemas de Mock
```bash
# Limpar mocks
jest.clearAllMocks();
```

#### Problemas de Banco de Dados
```bash
# Usar banco em memória para testes
npm install --save-dev pg-mem
```

### Logs de Debug
```bash
# Habilitar logs detalhados
DEBUG=* npm test
```

## 📚 Recursos Adicionais

### Documentação Jest
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

### Boas Práticas
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Node.js Testing](https://nodejs.org/en/docs/guides/testing-and-debugging/)

### Ferramentas Úteis
- **Jest**: Framework de testes
- **Supertest**: Testes de API HTTP
- **Nock**: Mock de requisições HTTP
- **pg-mem**: Banco de dados em memória para testes

---

**Desenvolvido por**: Equipe de Desenvolvimento  
**Última Atualização**: Dezembro 2024  
**Versão**: 1.0.0
