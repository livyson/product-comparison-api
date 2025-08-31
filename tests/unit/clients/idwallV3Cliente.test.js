const axios = require('axios');
const {
  buscarUsuarioV3PorEmail,
  buscarUsuarioV3PorId,
  extrairCompanyIdERolesDoV3,
  buscarEmpresaV3PorCompanyId,
  extrairDomainsDaEmpresa,
  criarUsuarioV3,
} = require('../../../src/clients/idwallV3Cliente');

// Mock do axios
jest.mock('axios');

describe('IdwallV3Cliente - Testes Unitários', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Configurar variáveis de ambiente para testes
    process.env.TOKEN = 'test_token';
    process.env.API_V3_BASE_URL = 'https://api-v3-test.idwall.co';
  });

  describe('buscarUsuarioV3PorEmail', () => {
    test('deve buscar usuário por email com sucesso', async () => {
      const mockResponse = {
        data: {
          id: '123',
          email: 'usuario@empresa.com',
          name: 'João Silva',
          companyId: '456',
          roles: [{ value: 'ADMIN' }],
          v2Id: '789'
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const resultado = await buscarUsuarioV3PorEmail('usuario@empresa.com');

      expect(axios.get).toHaveBeenCalledWith(
        'https://api-v3-test.idwall.co/users/e/usuario%40empresa.com',
        {
          headers: { Authorization: 'test_token' },
          timeout: 20000,
        }
      );
      expect(resultado).toEqual(mockResponse.data);
    });

    test('deve tratar email com caracteres especiais', async () => {
      const mockResponse = { data: { id: '123' } };
      axios.get.mockResolvedValue(mockResponse);

      await buscarUsuarioV3PorEmail('joão+teste@empresa.com.br');

      expect(axios.get).toHaveBeenCalledWith(
        'https://api-v3-test.idwall.co/users/e/jo%C3%A3o%2Bteste%40empresa.com.br',
        expect.any(Object)
      );
    });

    test('deve lançar erro quando TOKEN não está configurado', async () => {
      delete process.env.TOKEN;

      await expect(buscarUsuarioV3PorEmail('usuario@empresa.com'))
        .rejects
        .toThrow('Variável de ambiente TOKEN ausente para chamada à API V3');
    });

    test('deve lançar erro quando API falha', async () => {
      const erro = new Error('API Error');
      erro.response = { status: 500, data: { message: 'Internal Server Error' } };
      axios.get.mockRejectedValue(erro);

      await expect(buscarUsuarioV3PorEmail('usuario@empresa.com'))
        .rejects
        .toThrow('API Error');
    });

    test('deve lançar erro de timeout', async () => {
      const erro = new Error('Request timeout');
      erro.code = 'ECONNABORTED';
      axios.get.mockRejectedValue(erro);

      await expect(buscarUsuarioV3PorEmail('usuario@empresa.com'))
        .rejects
        .toThrow('Request timeout');
    });
  });

  describe('buscarUsuarioV3PorId', () => {
    test('deve buscar usuário por ID com sucesso', async () => {
      const mockResponse = {
        data: {
          id: '123',
          publicId: 'user-123',
          email: 'usuario@empresa.com',
          name: 'João Silva'
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const resultado = await buscarUsuarioV3PorId('user-123');

      expect(axios.get).toHaveBeenCalledWith(
        'https://api-v3-test.idwall.co/users/u/user-123',
        {
          headers: { Authorization: 'test_token' },
          timeout: 20000,
        }
      );
      expect(resultado).toEqual(mockResponse.data);
    });

    test('deve tratar ID com caracteres especiais', async () => {
      const mockResponse = { data: { id: '123' } };
      axios.get.mockResolvedValue(mockResponse);

      await buscarUsuarioV3PorId('user-123/456');

      expect(axios.get).toHaveBeenCalledWith(
        'https://api-v3-test.idwall.co/users/u/user-123%2F456',
        expect.any(Object)
      );
    });
  });

  describe('extrairCompanyIdERolesDoV3', () => {
    test('deve extrair companyId e roles corretamente', () => {
      const payload = {
        data: {
          companyId: '123',
          roles: [
            { value: 'ADMIN' },
            { value: 'USER' },
            { value: 'MANAGER' }
          ],
          v2Id: '456'
        }
      };

      const resultado = extrairCompanyIdERolesDoV3(payload);

      expect(resultado).toEqual({
        companyId: '123',
        roles: ['ADMIN', 'USER', 'MANAGER'],
        v2Id: '456'
      });
    });

    test('deve tratar payload sem roles', () => {
      const payload = {
        data: {
          companyId: '123',
          v2Id: '456'
        }
      };

      const resultado = extrairCompanyIdERolesDoV3(payload);

      expect(resultado).toEqual({
        companyId: '123',
        roles: [],
        v2Id: '456'
      });
    });

    test('deve tratar payload com roles nulas', () => {
      const payload = {
        data: {
          companyId: '123',
          roles: null,
          v2Id: '456'
        }
      };

      const resultado = extrairCompanyIdERolesDoV3(payload);

      expect(resultado).toEqual({
        companyId: '123',
        roles: [],
        v2Id: '456'
      });
    });

    test('deve filtrar roles com valores nulos', () => {
      const payload = {
        data: {
          companyId: '123',
          roles: [
            { value: 'ADMIN' },
            { value: null },
            { value: 'USER' },
            { value: undefined }
          ],
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

    test('deve tratar payload sem data', () => {
      const payload = {};

      const resultado = extrairCompanyIdERolesDoV3(payload);

      expect(resultado).toEqual({
        companyId: null,
        roles: [],
        v2Id: null
      });
    });
  });

  describe('buscarEmpresaV3PorCompanyId', () => {
    test('deve buscar empresa por companyId com sucesso', async () => {
      const mockResponse = {
        data: {
          company: {
            id: '123',
            name: 'Empresa Teste',
            domains: ['empresa.com', 'empresa.com.br']
          }
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const resultado = await buscarEmpresaV3PorCompanyId('123');

      expect(axios.get).toHaveBeenCalledWith(
        'https://api-v3-test.idwall.co/company/c/123',
        {
          headers: { Authorization: 'test_token' },
          timeout: 20000,
        }
      );
      expect(resultado).toEqual(mockResponse.data);
    });

    test('deve lançar erro quando TOKEN não está configurado', async () => {
      delete process.env.TOKEN;

      await expect(buscarEmpresaV3PorCompanyId('123'))
        .rejects
        .toThrow('Variável de ambiente TOKEN ausente para chamada à API V3 (company)');
    });
  });

  describe('extrairDomainsDaEmpresa', () => {
    test('deve extrair domínios corretamente', () => {
      const payload = {
        data: {
          company: {
            domains: ['empresa.com', 'empresa.com.br', 'teste.org']
          }
        }
      };

      const resultado = extrairDomainsDaEmpresa(payload);

      expect(resultado).toEqual(['empresa.com', 'empresa.com.br', 'teste.org']);
    });

    test('deve filtrar domínios não string', () => {
      const payload = {
        data: {
          company: {
            domains: ['empresa.com', 123, null, 'teste.org', undefined]
          }
        }
      };

      const resultado = extrairDomainsDaEmpresa(payload);

      expect(resultado).toEqual(['empresa.com', 'teste.org']);
    });

    test('deve retornar array vazio quando não há domínios', () => {
      const payload = {
        data: {
          company: {
            domains: []
          }
        }
      };

      const resultado = extrairDomainsDaEmpresa(payload);

      expect(resultado).toEqual([]);
    });

    test('deve tratar payload sem company', () => {
      const payload = { data: {} };

      const resultado = extrairDomainsDaEmpresa(payload);

      expect(resultado).toEqual([]);
    });

    test('deve tratar payload sem data', () => {
      const payload = {};

      const resultado = extrairDomainsDaEmpresa(payload);

      expect(resultado).toEqual([]);
    });
  });

  describe('criarUsuarioV3', () => {
    test('deve criar usuário com sucesso', async () => {
      const dadosUsuario = {
        name: 'João Silva',
        username: 'joao.silva',
        email: 'joao@empresa.com',
        companyId: '123',
        roles: ['ADMIN', 'USER']
      };

      const mockResponse = {
        data: {
          id: '789',
          ...dadosUsuario,
          redirectTo: 'https://app.idwall.co',
          mfaRequired: true
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const resultado = await criarUsuarioV3(dadosUsuario);

      expect(axios.post).toHaveBeenCalledWith(
        'https://api-v3-test.idwall.co/users',
        {
          ...dadosUsuario,
          redirectTo: 'https://app.idwall.co',
          mfaRequired: true
        },
        {
          headers: { Authorization: 'test_token' },
          timeout: 20000,
        }
      );
      expect(resultado).toEqual(mockResponse.data);
    });

    test('deve criar usuário com parâmetros customizados', async () => {
      const dadosUsuario = {
        name: 'João Silva',
        username: 'joao.silva',
        email: 'joao@empresa.com',
        companyId: '123',
        roles: ['ADMIN'],
        redirectTo: 'https://custom.idwall.co',
        mfaRequired: false
      };

      const mockResponse = { data: { id: '789', ...dadosUsuario } };
      axios.post.mockResolvedValue(mockResponse);

      const resultado = await criarUsuarioV3(dadosUsuario);

      expect(axios.post).toHaveBeenCalledWith(
        'https://api-v3-test.idwall.co/users',
        dadosUsuario,
        expect.any(Object)
      );
      expect(resultado).toEqual(mockResponse.data);
    });

    test('deve lançar erro quando TOKEN não está configurado', async () => {
      delete process.env.TOKEN;

      const dadosUsuario = {
        name: 'João Silva',
        username: 'joao.silva',
        email: 'joao@empresa.com',
        companyId: '123',
        roles: ['ADMIN']
      };

      await expect(criarUsuarioV3(dadosUsuario))
        .rejects
        .toThrow('TOKEN ausente para criar usuário na V3');
    });

    test('deve lançar erro quando criação falha', async () => {
      const erro = new Error('Validation Error');
      erro.response = { 
        status: 400, 
        data: { message: 'Email already exists' } 
      };
      axios.post.mockRejectedValue(erro);

      const dadosUsuario = {
        name: 'João Silva',
        username: 'joao.silva',
        email: 'joao@empresa.com',
        companyId: '123',
        roles: ['ADMIN']
      };

      await expect(criarUsuarioV3(dadosUsuario))
        .rejects
        .toThrow('Validation Error');
    });
  });

  describe('Configuração de URLs', () => {
    test('deve usar URL base customizada quando configurada', async () => {
      process.env.API_V3_BASE_URL = 'https://custom-api.idwall.co';
      
      const mockResponse = { data: { id: '123' } };
      axios.get.mockResolvedValue(mockResponse);

      await buscarUsuarioV3PorEmail('usuario@empresa.com');

      expect(axios.get).toHaveBeenCalledWith(
        'https://custom-api.idwall.co/users/e/usuario%40empresa.com',
        expect.any(Object)
      );
    });

    test('deve usar URL padrão quando não configurada', async () => {
      delete process.env.API_V3_BASE_URL;
      
      const mockResponse = { data: { id: '123' } };
      axios.get.mockResolvedValue(mockResponse);

      await buscarUsuarioV3PorEmail('usuario@empresa.com');

      expect(axios.get).toHaveBeenCalledWith(
        'https://api-v3.idwall.co/users/e/usuario%40empresa.com',
        expect.any(Object)
      );
    });
  });
});
