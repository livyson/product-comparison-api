const request = require('supertest');
const app = require('../../../src/app');

// Mock dos clientes externos
jest.mock('../../../src/clients/backofficeClient');
jest.mock('../../../src/clients/idwallV3Cliente');
jest.mock('../../../src/clients/marketingCloudCliente');
jest.mock('../../../src/clients/buscaDinamicaCliente');
jest.mock('../../../src/clients/bgcFerramentasCliente');

const {
  autenticarBackoffice,
  carregarUsuarioPorId,
} = require('../../../src/clients/backofficeClient');
const {
  buscarUsuarioV3PorEmail,
  criarUsuarioV3,
} = require('../../../src/clients/idwallV3Cliente');
const {
  importarComunicados,
} = require('../../../src/clients/marketingCloudCliente');
const {
  buscarFallbacks,
} = require('../../../src/clients/buscaDinamicaCliente');
const {
  buscarTimeoutPorUsuario,
} = require('../../../src/clients/bgcFerramentasCliente');

describe('Tratamento de Erros - Testes de Integração', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Erros de Autenticação', () => {
    test('deve tratar falha na autenticação do backoffice', async () => {
      const erro = new Error('Credenciais inválidas');
      erro.response = { status: 401, data: { message: 'Invalid credentials' } };
      autenticarBackoffice.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/backoffice/login')
        .expect(401);

      expect(response.body.mensagem).toBe('Falha ao autenticar no Backoffice');
      expect(response.body.detalhes).toBe('Credenciais inválidas');
    });

    test('deve tratar erro de conexão com backoffice', async () => {
      const erro = new Error('Connection timeout');
      erro.code = 'ECONNABORTED';
      autenticarBackoffice.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/backoffice/login')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao autenticar no Backoffice');
      expect(response.body.detalhes).toBe('Connection timeout');
    });

    test('deve tratar erro de servidor indisponível', async () => {
      const erro = new Error('Service unavailable');
      erro.response = { status: 503 };
      autenticarBackoffice.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/backoffice/login')
        .expect(503);

      expect(response.body.mensagem).toBe('Falha ao autenticar no Backoffice');
    });
  });

  describe('Erros de API V3', () => {
    test('deve tratar usuário não encontrado na V3', async () => {
      const erro = new Error('User not found');
      erro.response = { status: 404 };
      buscarUsuarioV3PorEmail.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(200);

      expect(response.body).toHaveProperty('usuario_migrado', false);
    });

    test('deve tratar erro de timeout na API V3', async () => {
      const erro = new Error('Request timeout');
      erro.code = 'ECONNABORTED';
      buscarUsuarioV3PorEmail.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(500);

      expect(response.body.mensagem).toContain('Erro na integração com API V3');
    });

    test('deve tratar erro de criação de usuário na V3', async () => {
      const erro = new Error('Email already exists');
      erro.response = { status: 409, data: { message: 'Email already exists' } };
      criarUsuarioV3.mockRejectedValue(erro);

      const payload = {
        usuarios: [{
          email: 'usuario@empresa.com',
          nome: 'Usuário Teste',
          emailEspelho: 'espelho@empresa.com'
        }],
        email_solicitante: 'test@empresa.com'
      };

      const response = await request(app)
        .post('/api/usuarios/lote')
        .send(payload)
        .expect(409);

      expect(response.body.mensagem).toContain('Erro na criação do usuário');
    });
  });

  describe('Erros de Marketing Cloud', () => {
    test('deve tratar erro de autenticação OAuth2', async () => {
      const erro = new Error('Invalid client credentials');
      erro.response = { status: 401 };
      importarComunicados.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/comunicados/importar')
        .expect(401);

      expect(response.body.mensagem).toContain('Erro na autenticação do Marketing Cloud');
    });

    test('deve tratar erro de Data Extension não encontrada', async () => {
      const erro = new Error('Data Extension not found');
      erro.response = { status: 404 };
      importarComunicados.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/comunicados/importar')
        .expect(404);

      expect(response.body.mensagem).toContain('Data Extension não encontrada');
    });

    test('deve tratar erro de limite de API excedido', async () => {
      const erro = new Error('API rate limit exceeded');
      erro.response = { status: 429 };
      importarComunicados.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/comunicados/importar')
        .expect(429);

      expect(response.body.mensagem).toContain('Limite de API excedido');
    });
  });

  describe('Erros de Busca Dinâmica', () => {
    test('deve tratar erro na busca de fallbacks', async () => {
      const erro = new Error('Busca dinâmica indisponível');
      buscarFallbacks.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/fallbacks')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao buscar fallbacks');
    });

    test('deve tratar erro de configuração de fallbacks', async () => {
      const erro = new Error('Configuração inválida');
      buscarFallbacks.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/fallbacks')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao buscar fallbacks');
    });
  });

  describe('Erros de BGC Ferramentas', () => {
    test('deve tratar erro na busca de timeout', async () => {
      const erro = new Error('Serviço de timeout indisponível');
      buscarTimeoutPorUsuario.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/timeout')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao buscar timeout do usuário');
    });

    test('deve tratar erro de configuração de timeout', async () => {
      const erro = new Error('Configuração de timeout inválida');
      buscarTimeoutPorUsuario.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/timeout')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao buscar timeout do usuário');
    });
  });

  describe('Erros de Banco de Dados', () => {
    test('deve tratar erro de conexão com banco', async () => {
      const erro = new Error('Database connection failed');
      erro.code = 'ECONNREFUSED';
      carregarUsuarioPorId.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao carregar dados do usuário');
    });

    test('deve tratar erro de query inválida', async () => {
      const erro = new Error('Invalid query');
      erro.code = 'ER_PARSE_ERROR';
      carregarUsuarioPorId.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao carregar dados do usuário');
    });

    test('deve tratar erro de timeout de banco', async () => {
      const erro = new Error('Database timeout');
      erro.code = 'ETIMEDOUT';
      carregarUsuarioPorId.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao carregar dados do usuário');
    });
  });

  describe('Erros de Validação', () => {
    test('deve tratar payload inválido', async () => {
      const payloadInvalido = {
        idsUsuarios: "não é um array",
        matrizes: ["100"],
        email_solicitante: "test@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadInvalido)
        .expect(400);

      expect(response.body.mensagem).toContain('Parâmetros inválidos');
    });

    test('deve tratar email inválido', async () => {
      const payloadEmailInvalido = {
        idsUsuarios: ["123"],
        matrizes: ["100"],
        email_solicitante: "email-invalido"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadEmailInvalido)
        .expect(400);

      expect(response.body.mensagem).toContain('Email inválido');
    });

    test('deve tratar IDs de usuário inválidos', async () => {
      const payloadIdsInvalidos = {
        idsUsuarios: ["", null, undefined],
        matrizes: ["100"],
        email_solicitante: "test@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadIdsInvalidos)
        .expect(400);

      expect(response.body.mensagem).toContain('IDs inválidos');
    });
  });

  describe('Erros de Operações em Lote', () => {
    test('deve tratar erro parcial em operações em lote', async () => {
      const payload = {
        idsUsuarios: ["123", "456", "789"],
        matrizes: ["100", "200"],
        email_solicitante: "test@empresa.com"
      };

      // Simular erro parcial
      const mockResultado = {
        sucesso: true,
        totalUsuarios: 3,
        usuariosProcessados: 2,
        usuariosComErro: 1,
        resultados: [
          { idUsuario: "123", sucesso: true },
          { idUsuario: "456", sucesso: false, erro: "Usuário não encontrado" },
          { idUsuario: "789", sucesso: true }
        ]
      };

      // Mock do serviço para simular erro parcial
      const gerenciadorMatrizesServico = require('../../../src/services/gerenciadorMatrizesServico');
      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockResolvedValue(mockResultado);

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(200);

      expect(response.body.usuariosComErro).toBe(1);
      expect(response.body.usuariosProcessados).toBe(2);
    });

    test('deve tratar erro total em operações em lote', async () => {
      const payload = {
        idsUsuarios: ["123", "456"],
        matrizes: ["100"],
        email_solicitante: "test@empresa.com"
      };

      const erro = new Error('Erro crítico no sistema');
      const gerenciadorMatrizesServico = require('../../../src/services/gerenciadorMatrizesServico');
      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(500);

      expect(response.body.mensagem).toContain('Erro ao processar operação em lote');
    });
  });

  describe('Erros de Rede', () => {
    test('deve tratar erro de DNS', async () => {
      const erro = new Error('DNS resolution failed');
      erro.code = 'ENOTFOUND';
      buscarUsuarioV3PorEmail.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(500);

      expect(response.body.mensagem).toContain('Erro de conectividade');
    });

    test('deve tratar erro de certificado SSL', async () => {
      const erro = new Error('SSL certificate error');
      erro.code = 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';
      buscarUsuarioV3PorEmail.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(500);

      expect(response.body.mensagem).toContain('Erro de certificado SSL');
    });
  });

  describe('Erros de Configuração', () => {
    test('deve tratar variáveis de ambiente ausentes', async () => {
      const originalToken = process.env.TOKEN;
      delete process.env.TOKEN;

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(500);

      expect(response.body.mensagem).toContain('Configuração incompleta');

      process.env.TOKEN = originalToken;
    });

    test('deve tratar URLs inválidas', async () => {
      const originalUrl = process.env.API_V3_BASE_URL;
      process.env.API_V3_BASE_URL = 'invalid-url';

      const erro = new Error('Invalid URL');
      buscarUsuarioV3PorEmail.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(500);

      expect(response.body.mensagem).toContain('URL inválida');

      process.env.API_V3_BASE_URL = originalUrl;
    });
  });

  describe('Recuperação de Erros', () => {
    test('deve tentar fallback quando API principal falha', async () => {
      const erro = new Error('API principal indisponível');
      buscarUsuarioV3PorEmail.mockRejectedValue(erro);

      // Mock do fallback para backoffice
      const mockUsuarioBackoffice = {
        result: {
          usuario: {
            id: '123',
            email: 'usuario@empresa.com',
            nome_de_usuario: 'usuario'
          }
        }
      };
      carregarUsuarioPorId.mockResolvedValue(mockUsuarioBackoffice);

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(200);

      expect(response.body).toHaveProperty('usuario_migrado', false);
    });

    test('deve retornar dados parciais quando possível', async () => {
      const erro = new Error('Serviço secundário indisponível');
      buscarTimeoutPorUsuario.mockRejectedValue(erro);

      const mockUsuario = {
        result: {
          usuario: {
            id: '123',
            email: 'usuario@empresa.com'
          }
        }
      };
      carregarUsuarioPorId.mockResolvedValue(mockUsuario);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .expect(200);

      expect(response.body.dados).toBeDefined();
      expect(response.body.dados.id_organizacao).toBeNull();
    });
  });
});
