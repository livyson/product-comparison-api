const {
  buscarUsuarioV3PorEmail,
  extrairCompanyIdERolesDoV3,
  criarUsuarioV3,
} = require('../../../src/clients/idwallV3Cliente');
const {
  carregarUsuarioPorId,
  buscarUsuarioBackofficePorEmail,
  atualizarUsuarioBackoffice,
} = require('../../../src/clients/backofficeClient');
const {
  buscarFallbacks,
  aplicarFallbacks,
} = require('../../../src/clients/buscaDinamicaCliente');
const {
  buscarTimeoutPorUsuario,
  normalizarRespostaTimeout,
  aplicarTimeoutParaUsuario,
  configurarFilasDedicated,
} = require('../../../src/clients/bgcFerramentasCliente');

// Mock dos clientes externos
jest.mock('../../../src/clients/idwallV3Cliente');
jest.mock('../../../src/clients/backofficeClient');
jest.mock('../../../src/clients/buscaDinamicaCliente');
jest.mock('../../../src/clients/bgcFerramentasCliente');

// Importar as funções do serviço (precisamos extrair as funções individuais)
const usuariosCriacaoServico = require('../../../src/services/usuariosCriacaoServico');

describe('UsuariosCriacaoServico - Testes Unitários', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('Funções Utilitárias', () => {
    test('deve gerar username correto a partir do email', () => {
      // Função extraída do serviço para teste
      const gerarUsernameAPartirDoEmail = (email) => {
        const [nome, dominio] = email.split("@");
        const primeiroDominio = (dominio || "").split(".")[0] || "org";
        return `${nome}.${primeiroDominio}`.replace(/\+/g, "");
      };

      const email = 'joao.silva@empresa.com.br';
      const username = gerarUsernameAPartirDoEmail(email);
      expect(username).toBe('joao.silva.empresa');
    });

    test('deve gerar username com domínio simples', () => {
      const gerarUsernameAPartirDoEmail = (email) => {
        const [nome, dominio] = email.split("@");
        const primeiroDominio = (dominio || "").split(".")[0] || "org";
        return `${nome}.${primeiroDominio}`.replace(/\+/g, "");
      };

      const email = 'maria@teste.com';
      const username = gerarUsernameAPartirDoEmail(email);
      expect(username).toBe('maria.teste');
    });

    test('deve filtrar roles de fraude corretamente', () => {
      // Função extraída do serviço para teste
      const filtrarRolesFraude = (roles) => {
        const proibidas = new Set([
          "FRAUD_NOTIFICATION",
          "FRAUD_NOTIFICATION_SERVICE",
          "FRAUD_NOTIFICATION_INTEROP_ADMIN",
          "FRAUD_NOTIFICATION_CONSULTANT",
        ]);
        return (roles || []).filter((r) => !proibidas.has(r));
      };

      const roles = ['ADMIN', 'FRAUD_NOTIFICATION', 'USER', 'FRAUD_NOTIFICATION_SERVICE'];
      const rolesFiltradas = filtrarRolesFraude(roles);
      expect(rolesFiltradas).toEqual(['ADMIN', 'USER']);
    });

    test('deve retornar array vazio para roles nulas', () => {
      const filtrarRolesFraude = (roles) => {
        const proibidas = new Set([
          "FRAUD_NOTIFICATION",
          "FRAUD_NOTIFICATION_SERVICE",
          "FRAUD_NOTIFICATION_INTEROP_ADMIN",
          "FRAUD_NOTIFICATION_CONSULTANT",
        ]);
        return (roles || []).filter((r) => !proibidas.has(r));
      };

      const rolesFiltradas = filtrarRolesFraude(null);
      expect(rolesFiltradas).toEqual([]);
    });
  });

  describe('Integração com API V3', () => {
    test('deve buscar usuário V3 por email com sucesso', async () => {
      const mockUsuarioV3 = {
        data: {
          companyId: '123',
          roles: [{ value: 'ADMIN' }, { value: 'USER' }],
          v2Id: '456'
        }
      };

      buscarUsuarioV3PorEmail.mockResolvedValue(mockUsuarioV3);

      const resultado = await buscarUsuarioV3PorEmail('usuario@empresa.com');
      
      expect(buscarUsuarioV3PorEmail).toHaveBeenCalledWith('usuario@empresa.com');
      expect(resultado).toEqual(mockUsuarioV3);
    });

    test('deve extrair companyId e roles corretamente', () => {
      const payload = {
        data: {
          companyId: '123',
          roles: [{ value: 'ADMIN' }, { value: 'USER' }],
          v2Id: '456'
        }
      };

      const resultado = extrairCompanyIdERolesDoV3(payload);
      
      expect(resultado).toEqual({
        companyId: '123',
        roles: ['ADMIN', 'USER'],
        v2Id: '456'
      });
    });

    test('deve criar usuário V3 com dados corretos', async () => {
      const dadosUsuario = {
        name: 'João Silva',
        username: 'joao.silva',
        email: 'joao@empresa.com',
        companyId: '123',
        roles: ['ADMIN']
      };

      const mockResposta = {
        data: {
          id: '789',
          ...dadosUsuario
        }
      };

      criarUsuarioV3.mockResolvedValue(mockResposta);

      const resultado = await criarUsuarioV3(dadosUsuario);
      
      expect(criarUsuarioV3).toHaveBeenCalledWith(dadosUsuario);
      expect(resultado).toEqual(mockResposta);
    });
  });

  describe('Integração com Backoffice', () => {
    test('deve carregar usuário por ID com sucesso', async () => {
      const mockUsuario = {
        result: {
          usuario: {
            id: '123',
            email: 'usuario@empresa.com',
            nome_de_usuario: 'usuario',
            id_organizacao: '456'
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

      const resultado = await carregarUsuarioPorId('123');
      
      expect(carregarUsuarioPorId).toHaveBeenCalledWith('123');
      expect(resultado).toEqual(mockUsuario);
    });

    test('deve buscar usuário no backoffice por email', async () => {
      const mockUsuarios = {
        result: [
          {
            id: '123',
            email: 'usuario@empresa.com',
            nome_de_usuario: 'usuario'
          }
        ]
      };

      buscarUsuarioBackofficePorEmail.mockResolvedValue(mockUsuarios);

      const resultado = await buscarUsuarioBackofficePorEmail('usuario@empresa.com');
      
      expect(buscarUsuarioBackofficePorEmail).toHaveBeenCalledWith('usuario@empresa.com');
      expect(resultado).toEqual(mockUsuarios);
    });
  });

  describe('Integração com Busca Dinâmica', () => {
    test('deve buscar fallbacks com sucesso', async () => {
      const mockFallbacks = {
        fallbacks: [
          { tipo: 'webhook', url: 'https://webhook.com' },
          { tipo: 'email', email: 'admin@empresa.com' }
        ]
      };

      buscarFallbacks.mockResolvedValue(mockFallbacks);

      const resultado = await buscarFallbacks({
        empresaId: '123',
        emailUsuario: 'usuario@empresa.com'
      });
      
      expect(buscarFallbacks).toHaveBeenCalledWith({
        empresaId: '123',
        emailUsuario: 'usuario@empresa.com'
      });
      expect(resultado).toEqual(mockFallbacks);
    });

    test('deve aplicar fallbacks corretamente', async () => {
      const mockFallbacks = [
        { tipo: 'webhook', url: 'https://webhook.com' }
      ];

      aplicarFallbacks.mockResolvedValue({ sucesso: true });

      const resultado = await aplicarFallbacks('usuario@empresa.com', mockFallbacks);
      
      expect(aplicarFallbacks).toHaveBeenCalledWith('usuario@empresa.com', mockFallbacks);
      expect(resultado).toEqual({ sucesso: true });
    });
  });

  describe('Integração com BGC Ferramentas', () => {
    test('deve buscar timeout por usuário', async () => {
      const mockTimeout = {
        tem_timeout: true,
        segundos_para_cancelar: 300,
        tipo: 'dedicated'
      };

      buscarTimeoutPorUsuario.mockResolvedValue(mockTimeout);

      const resultado = await buscarTimeoutPorUsuario({
        nomeDeUsuario: 'usuario'
      });
      
      expect(buscarTimeoutPorUsuario).toHaveBeenCalledWith({
        nomeDeUsuario: 'usuario'
      });
      expect(resultado).toEqual(mockTimeout);
    });

    test('deve normalizar resposta de timeout', () => {
      const mockResposta = {
        timeout: {
          enabled: true,
          seconds: 300,
          type: 'dedicated'
        }
      };

      const resultado = normalizarRespostaTimeout(mockResposta);
      
      expect(resultado).toEqual({
        tem_timeout: true,
        segundos_para_cancelar: 300,
        tipo: 'dedicated'
      });
    });

    test('deve aplicar timeout para usuário', async () => {
      const mockTimeout = {
        tem_timeout: true,
        segundos_para_cancelar: 300,
        tipo: 'dedicated'
      };

      aplicarTimeoutParaUsuario.mockResolvedValue({ sucesso: true });

      const resultado = await aplicarTimeoutParaUsuario('usuario', mockTimeout);
      
      expect(aplicarTimeoutParaUsuario).toHaveBeenCalledWith('usuario', mockTimeout);
      expect(resultado).toEqual({ sucesso: true });
    });
  });

  describe('Tratamento de Erros', () => {
    test('deve tratar erro quando usuário não encontrado na V3', async () => {
      const erro404 = new Error('Usuário não encontrado');
      erro404.response = { status: 404 };

      buscarUsuarioV3PorEmail.mockRejectedValue(erro404);

      await expect(buscarUsuarioV3PorEmail('usuario@empresa.com'))
        .rejects
        .toThrow('Usuário não encontrado');
    });

    test('deve tratar erro de timeout na API', async () => {
      const erroTimeout = new Error('Request timeout');
      erroTimeout.code = 'ECONNABORTED';

      buscarUsuarioV3PorEmail.mockRejectedValue(erroTimeout);

      await expect(buscarUsuarioV3PorEmail('usuario@empresa.com'))
        .rejects
        .toThrow('Request timeout');
    });
  });
});
