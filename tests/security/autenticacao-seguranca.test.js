const request = require('supertest');
const app = require('../../src/app');

describe('Segurança e Autenticação - Testes', () => {
  describe('Validação de CORS', () => {
    test('deve aceitar requisições de origens permitidas', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    test('deve aceitar requisições de localhost:3001', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3001')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3001');
    });

    test('deve aceitar requisições de staging', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'https://xperts-center.stg.idwall.space')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('https://xperts-center.stg.idwall.space');
    });

    test('deve aceitar requisições de produção', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'https://xperts-center.idwall.space')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('https://xperts-center.idwall.space');
    });

    test('deve rejeitar requisições de origens não permitidas', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'https://malicious-site.com')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });

    test('deve aceitar requisições sem Origin header', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.status).toBe(200);
    });
  });

  describe('Validação de Headers de Segurança', () => {
    test('deve incluir headers de segurança do Helmet', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Verificar headers de segurança
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    });

    test('deve configurar Content Security Policy', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('content-security-policy');
    });

    test('deve configurar Strict Transport Security em produção', async () => {
      // Simular ambiente de produção
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers).toHaveProperty('strict-transport-security');

      // Restaurar ambiente
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Validação de Rate Limiting', () => {
    test('deve aplicar rate limiting após muitas requisições', async () => {
      // Fazer múltiplas requisições para testar rate limiting
      const promises = Array.from({ length: 105 }, () => 
        request(app)
          .get('/health')
          .expect(200)
      );

      const responses = await Promise.allSettled(promises);
      
      // Verificar se algumas requisições foram bloqueadas
      const rejectedResponses = responses.filter(r => r.status === 'rejected');
      expect(rejectedResponses.length).toBeGreaterThan(0);
    });

    test('deve retornar erro de rate limit com mensagem apropriada', async () => {
      // Simular rate limit excedido
      const response = await request(app)
        .get('/api/usuarios')
        .set('X-Forwarded-For', '192.168.1.1')
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(response.body.error.message).toContain('Too many requests');
    });
  });

  describe('Validação de Input', () => {
    test('deve rejeitar payloads maliciosos com SQL Injection', async () => {
      const payloadMalicioso = {
        idsUsuarios: ["123'; DROP TABLE usuarios; --"],
        matrizes: ["100"],
        email_solicitante: "test@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadMalicioso)
        .expect(400);

      expect(response.body.mensagem).toContain('Parâmetros inválidos');
    });

    test('deve rejeitar payloads com XSS', async () => {
      const payloadXSS = {
        idsUsuarios: ["<script>alert('xss')</script>"],
        matrizes: ["<img src=x onerror=alert('xss')>"],
        email_solicitante: "test@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadXSS)
        .expect(400);

      expect(response.body.mensagem).toContain('Parâmetros inválidos');
    });

    test('deve rejeitar emails malformados', async () => {
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

    test('deve rejeitar IDs de usuário com caracteres especiais', async () => {
      const payloadIdsInvalidos = {
        idsUsuarios: ["user@123", "user#456", "user$789"],
        matrizes: ["100"],
        email_solicitante: "test@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadIdsInvalidos)
        .expect(400);

      expect(response.body.mensagem).toContain('IDs inválidos');
    });

    test('deve rejeitar payloads muito grandes', async () => {
      const payloadGrande = {
        idsUsuarios: Array.from({ length: 1000 }, (_, i) => `user${i}`),
        matrizes: Array.from({ length: 100 }, (_, i) => `matrix${i}`),
        email_solicitante: "test@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadGrande)
        .expect(400);

      expect(response.body.mensagem).toContain('Tamanho do payload excede o limite');
    });
  });

  describe('Validação de Autenticação', () => {
    test('deve rejeitar requisições sem credenciais necessárias', async () => {
      // Simular variáveis de ambiente ausentes
      const originalUsername = process.env.USERNAME;
      const originalPassword = process.env.PASSWORD;
      
      delete process.env.USERNAME;
      delete process.env.PASSWORD;

      const response = await request(app)
        .post('/api/backoffice/login')
        .expect(500);

      expect(response.body.mensagem).toContain('Variáveis de ambiente USERNAME/PASSWORD ausentes');

      // Restaurar variáveis
      process.env.USERNAME = originalUsername;
      process.env.PASSWORD = originalPassword;
    });

    test('deve validar formato de token', async () => {
      const response = await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .set('Authorization', 'invalid-token')
        .expect(401);

      expect(response.body.mensagem).toContain('Token inválido');
    });

    test('deve rejeitar tokens expirados', async () => {
      const response = await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .set('Authorization', 'expired-token')
        .expect(401);

      expect(response.body.mensagem).toContain('Token expirado');
    });
  });

  describe('Validação de Métodos HTTP', () => {
    test('deve rejeitar métodos HTTP não permitidos', async () => {
      const response = await request(app)
        .put('/api/usuarios')
        .expect(404);

      expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
    });

    test('deve aceitar métodos HTTP permitidos', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.status).toBe(200);
    });

    test('deve configurar OPTIONS corretamente', async () => {
      const response = await request(app)
        .options('/api/usuarios')
        .expect(200);

      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('Validação de Logs de Segurança', () => {
    test('deve registrar tentativas de acesso não autorizado', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await request(app)
        .get('/api/backoffice/usuarios/123/essenciais')
        .set('Authorization', 'invalid-token')
        .expect(401);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('deve registrar tentativas de rate limit', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Simular muitas requisições
      const promises = Array.from({ length: 110 }, () => 
        request(app)
          .get('/health')
          .set('X-Forwarded-For', '192.168.1.1')
      );

      await Promise.allSettled(promises);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Validação de Sanitização', () => {
    test('deve sanitizar IDs de usuário', async () => {
      const payloadComCaracteresEspeciais = {
        idsUsuarios: ["user<script>123</script>", "user'456'", "user\"789\""],
        matrizes: ["100"],
        email_solicitante: "test@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadComCaracteresEspeciais)
        .expect(400);

      expect(response.body.mensagem).toContain('IDs inválidos');
    });

    test('deve sanitizar emails', async () => {
      const payloadEmailMalicioso = {
        idsUsuarios: ["123"],
        matrizes: ["100"],
        email_solicitante: "test<script>alert('xss')</script>@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadEmailMalicioso)
        .expect(400);

      expect(response.body.mensagem).toContain('Email inválido');
    });

    test('deve sanitizar nomes de matrizes', async () => {
      const payloadMatrizesMaliciosas = {
        idsUsuarios: ["123"],
        matrizes: ["matrix<script>alert('xss')</script>", "matrix'100'"],
        email_solicitante: "test@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadMatrizesMaliciosas)
        .expect(400);

      expect(response.body.mensagem).toContain('Matrizes inválidas');
    });
  });

  describe('Validação de Configuração', () => {
    test('deve validar variáveis de ambiente obrigatórias', async () => {
      const variaveisObrigatorias = [
        'DB_HOST', 'DB_NAME', 'POSTGRESQL_USERNAME', 'POSTGRESQL_PASSWORD',
        'TOKEN', 'MC_CLIENT_ID', 'MC_CLIENT_SECRET'
      ];

      variaveisObrigatorias.forEach(variavel => {
        expect(process.env[variavel]).toBeDefined();
      });
    });

    test('deve configurar timeout adequado para requisições', async () => {
      const response = await request(app)
        .get('/health')
        .timeout(5000)
        .expect(200);

      expect(response.status).toBe(200);
    });

    test('deve configurar limite de tamanho de payload', async () => {
      const payloadGrande = {
        idsUsuarios: Array.from({ length: 500 }, (_, i) => `user${i}`),
        matrizes: Array.from({ length: 100 }, (_, i) => `matrix${i}`),
        email_solicitante: "test@empresa.com"
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadGrande)
        .expect(400);

      expect(response.body.mensagem).toContain('Tamanho do payload excede o limite');
    });
  });
});
