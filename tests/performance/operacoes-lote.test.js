const request = require('supertest');
const app = require('../../src/app');

// Mock dos serviços
jest.mock('../../src/services/gerenciadorMatrizesServico');
jest.mock('../../src/services/usuariosCriacaoServico');
jest.mock('../../src/services/gerenciadorTimeoutServico');

const gerenciadorMatrizesServico = require('../../src/services/gerenciadorMatrizesServico');
const usuariosCriacaoServico = require('../../src/services/usuariosCriacaoServico');
const gerenciadorTimeoutServico = require('../../src/services/gerenciadorTimeoutServico');

describe('Performance - Operações em Lote', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Performance de Matrizes em Lote', () => {
    test('deve processar 100 usuários em lote em menos de 30 segundos', async () => {
      const usuarios = Array.from({ length: 100 }, (_, i) => `user${i}`);
      const matrizes = ['100', '200', '300'];
      
      const payload = {
        idsUsuarios: usuarios,
        matrizes: matrizes,
        email_solicitante: 'performance@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 100,
        usuariosProcessados: 100,
        usuariosComErro: 0,
        resumo: {
          totalMatrizesAdicionadas: 300,
          totalMatrizesDuplicadas: 0
        },
        resultados: usuarios.map(id => ({
          idUsuario: id,
          sucesso: true,
          mensagem: 'Matrizes adicionadas com sucesso',
          matrizesAdicionadas: 3,
          matrizesDuplicadas: 0
        }))
      };

      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockResolvedValue(mockResultado);

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(200);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(30000); // 30 segundos
      expect(response.body.totalUsuarios).toBe(100);
      expect(response.body.usuariosProcessados).toBe(100);
      expect(response.body.usuariosComErro).toBe(0);
    });

    test('deve processar 50 usuários com 50 matrizes em menos de 15 segundos', async () => {
      const usuarios = Array.from({ length: 50 }, (_, i) => `user${i}`);
      const matrizes = Array.from({ length: 50 }, (_, i) => `matrix${i}`);
      
      const payload = {
        idsUsuarios: usuarios,
        matrizes: matrizes,
        email_solicitante: 'performance@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 50,
        usuariosProcessados: 50,
        usuariosComErro: 0,
        resumo: {
          totalMatrizesAdicionadas: 2500, // 50 usuários * 50 matrizes
          totalMatrizesDuplicadas: 0
        },
        resultados: usuarios.map(id => ({
          idUsuario: id,
          sucesso: true,
          mensagem: 'Matrizes adicionadas com sucesso',
          matrizesAdicionadas: 50,
          matrizesDuplicadas: 0
        }))
      };

      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockResolvedValue(mockResultado);

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(200);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(15000); // 15 segundos
      expect(response.body.totalUsuarios).toBe(50);
      expect(response.body.resumo.totalMatrizesAdicionadas).toBe(2500);
    });

    test('deve manter performance mesmo com alguns erros', async () => {
      const usuarios = Array.from({ length: 100 }, (_, i) => `user${i}`);
      const matrizes = ['100', '200'];
      
      const payload = {
        idsUsuarios: usuarios,
        matrizes: matrizes,
        email_solicitante: 'performance@empresa.com'
      };

      // Simular 10% de erro (10 usuários com erro)
      const usuariosComErro = 10;
      const usuariosProcessados = 90;

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 100,
        usuariosProcessados: usuariosProcessados,
        usuariosComErro: usuariosComErro,
        resumo: {
          totalMatrizesAdicionadas: 180, // 90 usuários * 2 matrizes
          totalMatrizesDuplicadas: 0
        },
        resultados: usuarios.map((id, index) => {
          if (index < usuariosComErro) {
            return {
              idUsuario: id,
              sucesso: false,
              mensagem: 'Usuário não encontrado',
              erro: `Usuário ${id} não existe`
            };
          } else {
            return {
              idUsuario: id,
              sucesso: true,
              mensagem: 'Matrizes adicionadas com sucesso',
              matrizesAdicionadas: 2,
              matrizesDuplicadas: 0
            };
          }
        })
      };

      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockResolvedValue(mockResultado);

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(200);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(30000); // 30 segundos
      expect(response.body.usuariosComErro).toBe(usuariosComErro);
      expect(response.body.usuariosProcessados).toBe(usuariosProcessados);
    });
  });

  describe('Performance de Criação de Usuários em Lote', () => {
    test('deve criar 50 usuários em lote em menos de 60 segundos', async () => {
      const usuarios = Array.from({ length: 50 }, (_, i) => ({
        email: `usuario${i}@empresa.com`,
        nome: `Usuário ${i}`,
        emailEspelho: 'espelho@empresa.com'
      }));

      const payload = {
        usuarios: usuarios,
        email_solicitante: 'performance@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 50,
        usuariosProcessados: 50,
        usuariosComErro: 0,
        resumo: {
          usuariosCriados: 50,
          usuariosFalharam: 0
        },
        resultados: usuarios.map((usuario, index) => ({
          email: usuario.email,
          sucesso: true,
          mensagem: 'Usuário criado com sucesso',
          idUsuario: `user_${index + 1}`,
          idV3: `v3_${index + 1}`
        }))
      };

      usuariosCriacaoServico.criarUsuariosEmLote.mockResolvedValue(mockResultado);

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/usuarios/lote')
        .send(payload)
        .expect(200);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(60000); // 60 segundos
      expect(response.body.totalUsuarios).toBe(50);
      expect(response.body.usuariosProcessados).toBe(50);
    });

    test('deve processar criação com fallbacks em tempo aceitável', async () => {
      const usuarios = Array.from({ length: 25 }, (_, i) => ({
        email: `usuario${i}@empresa.com`,
        nome: `Usuário ${i}`,
        emailEspelho: 'espelho@empresa.com'
      }));

      const payload = {
        usuarios: usuarios,
        email_solicitante: 'performance@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 25,
        usuariosProcessados: 25,
        usuariosComErro: 0,
        resumo: {
          usuariosCriados: 25,
          usuariosFalharam: 0,
          fallbacksAplicados: 25,
          timeoutsConfigurados: 25
        },
        resultados: usuarios.map((usuario, index) => ({
          email: usuario.email,
          sucesso: true,
          mensagem: 'Usuário criado com sucesso',
          idUsuario: `user_${index + 1}`,
          idV3: `v3_${index + 1}`,
          fallbacksAplicados: 3,
          timeoutConfigurado: true
        }))
      };

      usuariosCriacaoServico.criarUsuariosEmLote.mockResolvedValue(mockResultado);

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/usuarios/lote')
        .send(payload)
        .expect(200);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(45000); // 45 segundos
      expect(response.body.resumo.fallbacksAplicados).toBe(25);
      expect(response.body.resumo.timeoutsConfigurados).toBe(25);
    });
  });

  describe('Performance de Timeouts em Lote', () => {
    test('deve configurar timeouts para 100 usuários em menos de 20 segundos', async () => {
      const usuarios = Array.from({ length: 100 }, (_, i) => `user${i}`);
      
      const payload = {
        usuarios: usuarios,
        timeout: {
          tem_timeout: true,
          segundos_para_cancelar: 300,
          tipo: 'dedicated'
        },
        email_solicitante: 'performance@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 100,
        usuariosProcessados: 100,
        usuariosComErro: 0,
        resumo: {
          timeoutsConfigurados: 100,
          timeoutsFalharam: 0
        },
        resultados: usuarios.map(id => ({
          idUsuario: id,
          sucesso: true,
          mensagem: 'Timeout configurado com sucesso',
          timeoutConfigurado: true
        }))
      };

      gerenciadorTimeoutServico.configurarTimeoutsEmLote.mockResolvedValue(mockResultado);

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/timeout/usuarios/lote/configurar')
        .send(payload)
        .expect(200);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(20000); // 20 segundos
      expect(response.body.totalUsuarios).toBe(100);
      expect(response.body.usuariosProcessados).toBe(100);
    });
  });

  describe('Performance de Consultas', () => {
    test('deve consultar 100 usuários em menos de 10 segundos', async () => {
      const usuarios = Array.from({ length: 100 }, (_, i) => `user${i}`);
      
      const payload = {
        usuarios: usuarios,
        email_solicitante: 'performance@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 100,
        usuariosProcessados: 100,
        usuariosComErro: 0,
        resultados: usuarios.map(id => ({
          idUsuario: id,
          sucesso: true,
          timeout: {
            tem_timeout: true,
            segundos_para_cancelar: 300,
            tipo: 'dedicated'
          }
        }))
      };

      gerenciadorTimeoutServico.consultarTimeoutsEmLote.mockResolvedValue(mockResultado);

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/timeout/usuarios/lote/consultar')
        .send(payload)
        .expect(200);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(10000); // 10 segundos
      expect(response.body.totalUsuarios).toBe(100);
    });
  });

  describe('Métricas de Performance', () => {
    test('deve calcular métricas de throughput corretamente', async () => {
      const usuarios = Array.from({ length: 100 }, (_, i) => `user${i}`);
      const matrizes = ['100', '200'];
      
      const payload = {
        idsUsuarios: usuarios,
        matrizes: matrizes,
        email_solicitante: 'performance@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 100,
        usuariosProcessados: 100,
        usuariosComErro: 0,
        resumo: {
          totalMatrizesAdicionadas: 200,
          totalMatrizesDuplicadas: 0
        },
        resultados: usuarios.map(id => ({
          idUsuario: id,
          sucesso: true,
          mensagem: 'Matrizes adicionadas com sucesso',
          matrizesAdicionadas: 2,
          matrizesDuplicadas: 0
        }))
      };

      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockResolvedValue(mockResultado);

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(200);

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Calcular métricas
      const throughput = response.body.totalUsuarios / (executionTime / 1000); // usuários por segundo
      const successRate = (response.body.usuariosProcessados / response.body.totalUsuarios) * 100;

      expect(throughput).toBeGreaterThan(3); // Mínimo 3 usuários por segundo
      expect(successRate).toBe(100); // 100% de sucesso
      expect(executionTime).toBeLessThan(30000); // Máximo 30 segundos
    });

    test('deve manter latência consistente em múltiplas execuções', async () => {
      const usuarios = Array.from({ length: 50 }, (_, i) => `user${i}`);
      const matrizes = ['100', '200'];
      
      const payload = {
        idsUsuarios: usuarios,
        matrizes: matrizes,
        email_solicitante: 'performance@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 50,
        usuariosProcessados: 50,
        usuariosComErro: 0,
        resumo: {
          totalMatrizesAdicionadas: 100,
          totalMatrizesDuplicadas: 0
        },
        resultados: usuarios.map(id => ({
          idUsuario: id,
          sucesso: true,
          mensagem: 'Matrizes adicionadas com sucesso',
          matrizesAdicionadas: 2,
          matrizesDuplicadas: 0
        }))
      };

      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockResolvedValue(mockResultado);

      const executionTimes = [];

      // Executar 5 vezes para verificar consistência
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        
        await request(app)
          .post('/api/matrizes/usuarios/lote/adicionar')
          .send(payload)
          .expect(200);

        const endTime = Date.now();
        executionTimes.push(endTime - startTime);
      }

      // Calcular média e desvio padrão
      const averageTime = executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length;
      const maxDeviation = Math.max(...executionTimes) - Math.min(...executionTimes);

      expect(averageTime).toBeLessThan(15000); // Média menor que 15 segundos
      expect(maxDeviation).toBeLessThan(5000); // Variação máxima de 5 segundos
    });
  });

  describe('Limites de Performance', () => {
    test('deve rejeitar operações que excedem limites de performance', async () => {
      const usuarios = Array.from({ length: 1000 }, (_, i) => `user${i}`); // 1000 usuários
      const matrizes = Array.from({ length: 100 }, (_, i) => `matrix${i}`); // 100 matrizes
      
      const payload = {
        idsUsuarios: usuarios,
        matrizes: matrizes,
        email_solicitante: 'performance@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(400);

      expect(response.body.mensagem).toContain('Limite excedido');
    });

    test('deve validar tamanho do payload', async () => {
      const payloadGrande = {
        idsUsuarios: Array.from({ length: 200 }, (_, i) => `user${i}`),
        matrizes: Array.from({ length: 60 }, (_, i) => `matrix${i}`),
        email_solicitante: 'performance@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadGrande)
        .expect(400);

      expect(response.body.mensagem).toContain('Tamanho do payload excede o limite');
    });
  });
});
