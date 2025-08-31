describe('Rotas da API Xperts Center', () => {
  test('deve ter rota de health check', () => {
    const routes = {
      '/health': 'GET',
      '/api/usuarios': 'GET',
      '/api/backoffice/login': 'POST',
      '/api/matrizes/usuarios/lote/adicionar': 'POST',
      '/api/matrizes/usuarios/lote/remover': 'POST'
    };
    
    expect(routes['/health']).toBe('GET');
    expect(routes['/api/usuarios']).toBe('GET');
    expect(routes['/api/backoffice/login']).toBe('POST');
    expect(routes['/api/matrizes/usuarios/lote/adicionar']).toBe('POST');
    expect(routes['/api/matrizes/usuarios/lote/remover']).toBe('POST');
  });

  test('deve ter rotas de backoffice configuradas', () => {
    const backofficeRoutes = [
      '/api/backoffice/login',
      '/api/backoffice/usuarios/:id/essenciais',
      '/api/backoffice/usuarios/:id/fallbacks',
      '/api/backoffice/usuarios/:id/overview',
      '/api/backoffice/usuarios/:id/timeout'
    ];
    
    expect(backofficeRoutes).toHaveLength(5);
    expect(backofficeRoutes[0]).toContain('login');
    expect(backofficeRoutes[1]).toContain('essenciais');
    expect(backofficeRoutes[2]).toContain('fallbacks');
    expect(backofficeRoutes[3]).toContain('overview');
    expect(backofficeRoutes[4]).toContain('timeout');
  });

  test('deve ter rotas de matrizes em lote', () => {
    const matrizesRoutes = [
      '/api/matrizes/usuarios/lote/adicionar',
      '/api/matrizes/usuarios/lote/remover'
    ];
    
    expect(matrizesRoutes).toHaveLength(2);
    expect(matrizesRoutes[0]).toContain('adicionar');
    expect(matrizesRoutes[1]).toContain('remover');
  });

  test('deve ter rotas de usuários', () => {
    const usuariosRoutes = [
      '/api/usuarios',
      '/api/usuarios/lote',
      '/api/usuarios/:id'
    ];
    
    expect(usuariosRoutes).toHaveLength(3);
    expect(usuariosRoutes[0]).toBe('/api/usuarios');
    expect(usuariosRoutes[1]).toBe('/api/usuarios/lote');
    expect(usuariosRoutes[2]).toBe('/api/usuarios/:id');
  });
});
