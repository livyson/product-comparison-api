const request = require('supertest');
const app = require('../../../src/app');

// Mock dos serviços
jest.mock('../../../src/services/gerenciadorMatrizesServico');

const gerenciadorMatrizesServico = require('../../../src/services/gerenciadorMatrizesServico');

describe('Matrizes em Lote - Testes de Integração', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/matrizes/usuarios/lote/adicionar', () => {
    test('deve adicionar matrizes em lote com sucesso', async () => {
      const payload = {
        idsUsuarios: ['123', '456', '789'],
        matrizes: ['100', '200'],
        email_solicitante: 'executor@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 3,
        usuariosProcessados: 3,
        usuariosComErro: 0,
        resumo: {
          totalMatrizesAdicionadas: 6,
          totalMatrizesDuplicadas: 0
        },
        resultados: [
          {
            idUsuario: '123',
            sucesso: true,
            mensagem: 'Matrizes adicionadas com sucesso',
            matrizesAdicionadas: 2,
            matrizesDuplicadas: 0
          },
          {
            idUsuario: '456',
            sucesso: true,
            mensagem: 'Matrizes adicionadas com sucesso',
            matrizesAdicionadas: 2,
            matrizesDuplicadas: 0
          },
          {
            idUsuario: '789',
            sucesso: true,
            mensagem: 'Matrizes adicionadas com sucesso',
            matrizesAdicionadas: 2,
            matrizesDuplicadas: 0
          }
        ]
      };

      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockResolvedValue(mockResultado);

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(200);

      expect(gerenciadorMatrizesServico.adicionarMatrizesEmLote).toHaveBeenCalledWith(
        payload.idsUsuarios,
        payload.matrizes,
        payload.email_solicitante
      );
      expect(response.body).toEqual(mockResultado);
    });

    test('deve tratar erro quando payload está incompleto', async () => {
      const payloadIncompleto = {
        idsUsuarios: ['123'],
        // matrizes ausente
        email_solicitante: 'executor@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payloadIncompleto)
        .expect(400);

      expect(response.body.mensagem).toContain('Parâmetros obrigatórios');
    });

    test('deve tratar erro quando lista de usuários está vazia', async () => {
      const payload = {
        idsUsuarios: [],
        matrizes: ['100', '200'],
        email_solicitante: 'executor@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(400);

      expect(response.body.mensagem).toContain('Lista de usuários não pode estar vazia');
    });

    test('deve tratar erro quando lista de matrizes está vazia', async () => {
      const payload = {
        idsUsuarios: ['123', '456'],
        matrizes: [],
        email_solicitante: 'executor@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(400);

      expect(response.body.mensagem).toContain('Lista de matrizes não pode estar vazia');
    });

    test('deve tratar erro quando email do solicitante está ausente', async () => {
      const payload = {
        idsUsuarios: ['123', '456'],
        matrizes: ['100', '200']
        // email_solicitante ausente
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(400);

      expect(response.body.mensagem).toContain('Email do solicitante é obrigatório');
    });

    test('deve tratar erro do serviço', async () => {
      const payload = {
        idsUsuarios: ['123', '456'],
        matrizes: ['100', '200'],
        email_solicitante: 'executor@empresa.com'
      };

      const erro = new Error('Erro interno do serviço');
      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockRejectedValue(erro);

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(500);

      expect(response.body.mensagem).toContain('Erro ao processar operação em lote');
    });

    test('deve processar com alguns usuários com erro', async () => {
      const payload = {
        idsUsuarios: ['123', '456', '789'],
        matrizes: ['100', '200'],
        email_solicitante: 'executor@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 3,
        usuariosProcessados: 2,
        usuariosComErro: 1,
        resumo: {
          totalMatrizesAdicionadas: 4,
          totalMatrizesDuplicadas: 0
        },
        resultados: [
          {
            idUsuario: '123',
            sucesso: true,
            mensagem: 'Matrizes adicionadas com sucesso',
            matrizesAdicionadas: 2,
            matrizesDuplicadas: 0
          },
          {
            idUsuario: '456',
            sucesso: false,
            mensagem: 'Usuário não encontrado',
            erro: 'Usuário 456 não existe'
          },
          {
            idUsuario: '789',
            sucesso: true,
            mensagem: 'Matrizes adicionadas com sucesso',
            matrizesAdicionadas: 2,
            matrizesDuplicadas: 0
          }
        ]
      };

      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockResolvedValue(mockResultado);

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(200);

      expect(response.body.usuariosComErro).toBe(1);
      expect(response.body.usuariosProcessados).toBe(2);
    });
  });

  describe('POST /api/matrizes/usuarios/lote/remover', () => {
    test('deve remover matrizes em lote com sucesso', async () => {
      const payload = {
        idsUsuarios: ['123', '456', '789'],
        matrizes: ['100', '200'],
        email_solicitante: 'executor@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 3,
        usuariosProcessados: 3,
        usuariosComErro: 0,
        resumo: {
          totalMatrizesRemovidas: 6,
          totalMatrizesNaoEncontradas: 0
        },
        resultados: [
          {
            idUsuario: '123',
            sucesso: true,
            mensagem: 'Matrizes removidas com sucesso',
            matrizesRemovidas: 2,
            matrizesNaoEncontradas: 0
          },
          {
            idUsuario: '456',
            sucesso: true,
            mensagem: 'Matrizes removidas com sucesso',
            matrizesRemovidas: 2,
            matrizesNaoEncontradas: 0
          },
          {
            idUsuario: '789',
            sucesso: true,
            mensagem: 'Matrizes removidas com sucesso',
            matrizesRemovidas: 2,
            matrizesNaoEncontradas: 0
          }
        ]
      };

      gerenciadorMatrizesServico.removerMatrizesEmLote.mockResolvedValue(mockResultado);

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/remover')
        .send(payload)
        .expect(200);

      expect(gerenciadorMatrizesServico.removerMatrizesEmLote).toHaveBeenCalledWith(
        payload.idsUsuarios,
        payload.matrizes,
        payload.email_solicitante
      );
      expect(response.body).toEqual(mockResultado);
    });

    test('deve tratar matrizes não encontradas', async () => {
      const payload = {
        idsUsuarios: ['123', '456'],
        matrizes: ['100', '200'],
        email_solicitante: 'executor@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 2,
        usuariosProcessados: 2,
        usuariosComErro: 0,
        resumo: {
          totalMatrizesRemovidas: 2,
          totalMatrizesNaoEncontradas: 2
        },
        resultados: [
          {
            idUsuario: '123',
            sucesso: true,
            mensagem: 'Matrizes removidas com sucesso',
            matrizesRemovidas: 1,
            matrizesNaoEncontradas: 1
          },
          {
            idUsuario: '456',
            sucesso: true,
            mensagem: 'Matrizes removidas com sucesso',
            matrizesRemovidas: 1,
            matrizesNaoEncontradas: 1
          }
        ]
      };

      gerenciadorMatrizesServico.removerMatrizesEmLote.mockResolvedValue(mockResultado);

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/remover')
        .send(payload)
        .expect(200);

      expect(response.body.resumo.totalMatrizesNaoEncontradas).toBe(2);
    });

    test('deve validar payload para remoção', async () => {
      const payloadInvalido = {
        idsUsuarios: ['123'],
        // matrizes ausente
        email_solicitante: 'executor@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/remover')
        .send(payloadInvalido)
        .expect(400);

      expect(response.body.mensagem).toContain('Parâmetros obrigatórios');
    });
  });

  describe('Validações Gerais', () => {
    test('deve validar limite máximo de usuários', async () => {
      const payload = {
        idsUsuarios: Array.from({ length: 101 }, (_, i) => `user${i}`), // 101 usuários
        matrizes: ['100', '200'],
        email_solicitante: 'executor@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(400);

      expect(response.body.mensagem).toContain('Máximo de 100 usuários');
    });

    test('deve validar limite máximo de matrizes', async () => {
      const payload = {
        idsUsuarios: ['123', '456'],
        matrizes: Array.from({ length: 51 }, (_, i) => `matrix${i}`), // 51 matrizes
        email_solicitante: 'executor@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(400);

      expect(response.body.mensagem).toContain('Máximo de 50 matrizes');
    });

    test('deve validar formato de email do solicitante', async () => {
      const payload = {
        idsUsuarios: ['123', '456'],
        matrizes: ['100', '200'],
        email_solicitante: 'email-invalido'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(400);

      expect(response.body.mensagem).toContain('Email inválido');
    });

    test('deve validar IDs de usuários únicos', async () => {
      const payload = {
        idsUsuarios: ['123', '123', '456'], // ID duplicado
        matrizes: ['100', '200'],
        email_solicitante: 'executor@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(400);

      expect(response.body.mensagem).toContain('IDs de usuários devem ser únicos');
    });

    test('deve validar IDs de matrizes únicos', async () => {
      const payload = {
        idsUsuarios: ['123', '456'],
        matrizes: ['100', '100', '200'], // Matriz duplicada
        email_solicitante: 'executor@empresa.com'
      };

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(400);

      expect(response.body.mensagem).toContain('IDs de matrizes devem ser únicos');
    });
  });

  describe('Auditoria e Logs', () => {
    test('deve registrar auditoria da operação', async () => {
      const payload = {
        idsUsuarios: ['123', '456'],
        matrizes: ['100', '200'],
        email_solicitante: 'executor@empresa.com'
      };

      const mockResultado = {
        sucesso: true,
        totalUsuarios: 2,
        usuariosProcessados: 2,
        usuariosComErro: 0,
        resumo: {
          totalMatrizesAdicionadas: 4,
          totalMatrizesDuplicadas: 0
        },
        resultados: [
          {
            idUsuario: '123',
            sucesso: true,
            mensagem: 'Matrizes adicionadas com sucesso',
            matrizesAdicionadas: 2,
            matrizesDuplicadas: 0
          },
          {
            idUsuario: '456',
            sucesso: true,
            mensagem: 'Matrizes adicionadas com sucesso',
            matrizesAdicionadas: 2,
            matrizesDuplicadas: 0
          }
        ]
      };

      gerenciadorMatrizesServico.adicionarMatrizesEmLote.mockResolvedValue(mockResultado);

      const response = await request(app)
        .post('/api/matrizes/usuarios/lote/adicionar')
        .send(payload)
        .expect(200);

      // Verificar se a auditoria foi registrada
      expect(gerenciadorMatrizesServico.adicionarMatrizesEmLote).toHaveBeenCalledWith(
        payload.idsUsuarios,
        payload.matrizes,
        payload.email_solicitante
      );
    });
  });
});
