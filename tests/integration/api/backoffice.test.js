const request = require('supertest');
const app = require('../../../src/app');

// Mock dos clientes externos
jest.mock('../../../src/clients/backofficeClient');
jest.mock('../../../src/clients/buscaDinamicaCliente');
jest.mock('../../../src/clients/bgcFerramentasCliente');
jest.mock('../../../src/clients/idwallV3Cliente');

const {
  autenticarBackoffice,
  carregarUsuarioPorId,
} = require('../../../src/clients/backofficeClient');
const { buscarFallbacks } = require('../../../src/clients/buscaDinamicaCliente');
const {
  buscarTimeoutPorUsuario,
  normalizarRespostaTimeout,
} = require('../../../src/clients/bgcFerramentasCliente');
const {
  buscarUsuarioV3PorEmail,
  buscarUsuarioV3PorId,
  extrairCompanyIdERolesDoV3,
  buscarEmpresaV3PorCompanyId,
  extrairDomainsDaEmpresa,
} = require('../../../src/clients/idwallV3Cliente');

describe('Backoffice API - Testes de Integração', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar variáveis de ambiente para testes
    process.env.USERNAME = 'test_user';
    process.env.PASSWORD = 'test_password';
  });

  describe('POST /api/backoffice/login', () => {
    test('deve autenticar no backoffice com sucesso', async () => {
      const mockResposta = {
        token: 'test_token_123',
        expires_in: 3600,
        user: {
          id: '123',
          email: 'test@empresa.com',
          name: 'Usuário Teste'
        }
      };

      autenticarBackoffice.mockResolvedValue(mockResposta);

      const response = await request(app)
        .post('/api/backoffice/login')
        .expect(200);

      expect(autenticarBackoffice).toHaveBeenCalledWith({
        usuario: 'test_user',
        senha: 'test_password'
      });
      expect(response.body.mensagem).toBe('Autenticado no Backoffice');
      expect(response.body.dados).toEqual(mockResposta);
    });

    test('deve retornar erro quando variáveis de ambiente estão ausentes', async () => {
      delete process.env.USERNAME;
      delete process.env.PASSWORD;

      const response = await request(app)
        .post('/api/backoffice/login')
        .expect(500);

      expect(response.body.mensagem).toBe('Variáveis de ambiente USERNAME/PASSWORD ausentes');
    });

    test('deve tratar erro de autenticação', async () => {
      const erro = new Error('Credenciais inválidas');
      erro.response = { status: 401 };
      autenticarBackoffice.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/backoffice/login')
        .expect(401);

      expect(response.body.mensagem).toBe('Falha ao autenticar no Backoffice');
      expect(response.body.detalhes).toBe('Credenciais inválidas');
    });

    test('deve tratar erro interno do servidor', async () => {
      const erro = new Error('Erro interno');
      autenticarBackoffice.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/backoffice/login')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao autenticar no Backoffice');
      expect(response.body.detalhes).toBe('Erro interno');
    });
  });

  describe('GET /api/backoffice/usuarios/:id/essenciais', () => {
    test('deve retornar dados essenciais do usuário', async () => {
      const mockUsuario = {
        result: {
          usuario: {
            id: '123',
            email: 'usuario@empresa.com',
            nome_de_usuario: 'usuario',
            id_organizacao: '456',
            fila: 'fila_teste',
            webhook_url2: 'https://webhook.com',
            data_expiracao: '2025-12-31'
          },
          matrizes: [
            { id: '1', nome: 'Matriz A' },
            { id: '2', nome: 'Matriz B' }
          ],
          queue: {
            queueV3: 'fila_v3',
            queueV2: 'fila_v2'
          }
        }
      };

      carregarUsuarioPorId.mockResolvedValue(mockUsuario);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .expect(200);

      expect(carregarUsuarioPorId).toHaveBeenCalledWith('123');
      expect(response.body.dados).toEqual({
        fila: 'fila_teste',
        webhook_url2: 'https://webhook.com',
        id_organizacao: '456',
        data_expiracao: '2025-12-31',
        matrizes: [
          { id: '1', nome: 'Matriz A' },
          { id: '2', nome: 'Matriz B' }
        ],
        queue: {
          queueV3: 'fila_v3',
          queueV2: 'fila_v2'
        }
      });
    });

    test('deve tratar usuário não encontrado', async () => {
      const erro = new Error('Usuário não encontrado');
      erro.response = { status: 404 };
      carregarUsuarioPorId.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/999/essenciais')
        .expect(404);

      expect(response.body.mensagem).toBe('Usuário não encontrado no Backoffice');
    });

    test('deve tratar erro de não autorizado', async () => {
      const erro = new Error('Não autorizado');
      erro.response = { status: 401 };
      carregarUsuarioPorId.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .expect(401);

      expect(response.body.mensagem).toBe('Não autorizado no Backoffice');
    });

    test('deve tratar dados nulos/undefined', async () => {
      const mockUsuario = {
        result: {
          usuario: {},
          matrizes: [],
          queue: {}
        }
      };

      carregarUsuarioPorId.mockResolvedValue(mockUsuario);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .expect(200);

      expect(response.body.dados).toEqual({
        fila: null,
        webhook_url2: null,
        id_organizacao: null,
        data_expiracao: null,
        matrizes: [],
        queue: {
          queueV3: null,
          queueV2: null
        }
      });
    });
  });

  describe('GET /api/backoffice/usuarios/:id/fallbacks', () => {
    test('deve retornar fallbacks do usuário', async () => {
      const mockUsuario = {
        result: {
          usuario: {
            id: '123',
            email: 'usuario@empresa.com',
            id_organizacao: '456'
          }
        }
      };

      const mockFallbacks = {
        fallbacks: [
          { tipo: 'webhook', url: 'https://webhook.com' },
          { tipo: 'email', email: 'admin@empresa.com' }
        ]
      };

      carregarUsuarioPorId.mockResolvedValue(mockUsuario);
      buscarFallbacks.mockResolvedValue(mockFallbacks);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/fallbacks')
        .expect(200);

      expect(carregarUsuarioPorId).toHaveBeenCalledWith('123');
      expect(buscarFallbacks).toHaveBeenCalledWith({
        empresaId: '456',
        emailUsuario: 'usuario@empresa.com'
      });
      expect(response.body.dados).toEqual(mockFallbacks);
    });

    test('deve tratar erro quando email ou empresaId estão ausentes', async () => {
      const mockUsuario = {
        result: {
          usuario: {
            id: '123'
            // email e id_organizacao ausentes
          }
        }
      };

      carregarUsuarioPorId.mockResolvedValue(mockUsuario);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/fallbacks')
        .expect(400);

      expect(response.body.mensagem).toBe('Email ou id_organizacao ausentes no usuário');
    });

    test('deve tratar erro na busca de fallbacks', async () => {
      const mockUsuario = {
        result: {
          usuario: {
            id: '123',
            email: 'usuario@empresa.com',
            id_organizacao: '456'
          }
        }
      };

      const erro = new Error('Erro na busca dinâmica');
      carregarUsuarioPorId.mockResolvedValue(mockUsuario);
      buscarFallbacks.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/fallbacks')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao buscar fallbacks');
    });
  });

  describe('GET /api/backoffice/usuarios/:id/overview', () => {
    test('deve retornar overview completo do usuário', async () => {
      const mockUsuario = {
        result: {
          usuario: {
            id: '123',
            email: 'usuario@empresa.com',
            nome_de_usuario: 'usuario',
            id_organizacao: '456',
            data_expiracao: '2025-12-31'
          },
          matrizes: [
            { id: '1', nome: 'Matriz A' },
            { id: '2', nome: 'Matriz B' }
          ],
          queue: {
            queueV3: 'fila_v3',
            queueV2: 'fila_v2'
          }
        }
      };

      const mockUsuarioV3 = {
        data: {
          companyId: '789',
          roles: [{ value: 'ADMIN' }],
          v2Id: '123'
        }
      };

      const mockEmpresa = {
        data: {
          company: {
            name: 'Empresa Teste',
            domains: ['empresa.com']
          }
        }
      };

      carregarUsuarioPorId.mockResolvedValue(mockUsuario);
      buscarUsuarioV3PorEmail.mockResolvedValue(mockUsuarioV3);
      buscarEmpresaV3PorCompanyId.mockResolvedValue(mockEmpresa);

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(200);

      expect(carregarUsuarioPorId).toHaveBeenCalledWith('123');
      expect(buscarUsuarioV3PorEmail).toHaveBeenCalledWith('usuario@empresa.com');
      expect(buscarEmpresaV3PorCompanyId).toHaveBeenCalledWith('789');
      
      expect(response.body).toHaveProperty('usuario_migrado', true);
      expect(response.body).toHaveProperty('usuario_expirado', true);
      expect(response.body).toHaveProperty('data_expiracao', '2025-12-31');
      expect(response.body).toHaveProperty('usuario_desativado', false);
    });

    test('deve tratar usuário não migrado para V3', async () => {
      const mockUsuario = {
        result: {
          usuario: {
            id: '123',
            email: 'usuario@empresa.com',
            nome_de_usuario: 'usuario',
            id_organizacao: '456'
          },
          matrizes: [],
          queue: {}
        }
      };

      const erro404 = new Error('Usuário não encontrado');
      erro404.response = { status: 404 };

      carregarUsuarioPorId.mockResolvedValue(mockUsuario);
      buscarUsuarioV3PorEmail.mockRejectedValue(erro404);

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(200);

      expect(response.body).toHaveProperty('usuario_migrado', false);
    });

    test('deve tratar usuário expirado', async () => {
      const mockUsuario = {
        result: {
          usuario: {
            id: '123',
            email: 'usuario@empresa.com',
            nome_de_usuario: 'usuario',
            id_organizacao: '456',
            data_expiracao: '2020-01-01' // Data passada
          },
          matrizes: [],
          queue: {}
        }
      };

      carregarUsuarioPorId.mockResolvedValue(mockUsuario);

      const response = await request(app)
        .get('/api/backoffice/usuarios-por-email/overview?email=usuario@empresa.com')
        .expect(200);

      expect(response.body).toHaveProperty('usuario_expirado', true);
      expect(response.body).toHaveProperty('usuario_desativado', true);
    });
  });

  describe('GET /api/backoffice/usuarios/:id/timeout', () => {
    test('deve retornar configurações de timeout do usuário', async () => {
      const mockTimeout = {
        timeout: {
          enabled: true,
          seconds: 300,
          type: 'dedicated'
        }
      };

      buscarTimeoutPorUsuario.mockResolvedValue(mockTimeout);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/timeout')
        .expect(200);

      expect(buscarTimeoutPorUsuario).toHaveBeenCalledWith({
        nomeDeUsuario: 'usuario'
      });
      expect(response.body.dados).toEqual({
        tem_timeout: true,
        segundos_para_cancelar: 300,
        tipo: 'dedicated'
      });
    });

    test('deve tratar erro na busca de timeout', async () => {
      const erro = new Error('Erro na busca de timeout');
      buscarTimeoutPorUsuario.mockRejectedValue(erro);

      const response = await request(app)
        .get('/api/backoffice/usuarios/123/timeout')
        .expect(500);

      expect(response.body.mensagem).toBe('Falha ao buscar timeout do usuário');
    });
  });
});
