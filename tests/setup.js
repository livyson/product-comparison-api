// Configuração global para todos os testes
require('dotenv').config({ path: '.env.test' });

// Configurar timezone para testes
process.env.TZ = 'America/Sao_Paulo';

// Mock global do console para reduzir ruído nos testes
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Configurar timeout global
jest.setTimeout(30000);

// Limpar mocks após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Configurar variáveis de ambiente para testes
process.env.NODE_ENV = 'test';
process.env.PORT = '8081';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'xperts_test';
process.env.POSTGRESQL_USERNAME = 'test_user';
process.env.POSTGRESQL_PASSWORD = 'test_password';
process.env.TOKEN = 'test_token';
process.env.API_V3_BASE_URL = 'https://api-v3-test.idwall.co';
process.env.MC_AUTH_URL = 'https://test.auth.marketingcloud.com';
process.env.MC_REST_URL = 'https://test.rest.marketingcloud.com';
process.env.MC_CLIENT_ID = 'test_client_id';
process.env.MC_CLIENT_SECRET = 'test_client_secret';
process.env.MC_DE_EXTERNAL_KEY = 'test_de_key';
process.env.MC_ACCOUNT_ID = 'test_account_id';
process.env.USERNAME = 'test_user';
process.env.PASSWORD = 'test_password';
