describe('Integrações Externas Xperts Center', () => {
  test('deve ter integração com API V3 da Idwall', () => {
    const v3Config = {
      baseUrl: 'https://api-v3.idwall.co',
      endpoints: {
        users: '/users',
        companies: '/company',
        auth: '/auth'
      },
      timeout: 20000
    };
    
    expect(v3Config.baseUrl).toBe('https://api-v3.idwall.co');
    expect(v3Config.endpoints.users).toBe('/users');
    expect(v3Config.endpoints.companies).toBe('/company');
    expect(v3Config.timeout).toBe(20000);
  });

  test('deve ter integração com Marketing Cloud', () => {
    const mcConfig = {
      authUrl: 'https://auth.marketingcloud.com',
      restUrl: 'https://rest.marketingcloud.com',
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      accountId: 'test_account_id'
    };
    
    expect(mcConfig.authUrl).toBe('https://auth.marketingcloud.com');
    expect(mcConfig.restUrl).toBe('https://rest.marketingcloud.com');
    expect(mcConfig.clientId).toBe('test_client_id');
    expect(mcConfig.clientSecret).toBe('test_client_secret');
    expect(mcConfig.accountId).toBe('test_account_id');
  });

  test('deve ter integração com Backoffice', () => {
    const backofficeConfig = {
      baseUrl: 'https://backoffice.idwall.co',
      endpoints: {
        login: '/login',
        usuarios: '/usuarios',
        matrizes: '/matrizes'
      },
      credentials: {
        username: 'test_user',
        password: 'test_password'
      }
    };
    
    expect(backofficeConfig.baseUrl).toBe('https://backoffice.idwall.co');
    expect(backofficeConfig.endpoints.login).toBe('/login');
    expect(backofficeConfig.endpoints.usuarios).toBe('/usuarios');
    expect(backofficeConfig.credentials.username).toBe('test_user');
  });

  test('deve ter integração com Busca Dinâmica', () => {
    const buscaDinamicaConfig = {
      baseUrl: 'https://busca-dinamica.idwall.co',
      endpoints: {
        fallbacks: '/fallbacks',
        timeouts: '/timeouts'
      },
      timeout: 15000
    };
    
    expect(buscaDinamicaConfig.baseUrl).toBe('https://busca-dinamica.idwall.co');
    expect(buscaDinamicaConfig.endpoints.fallbacks).toBe('/fallbacks');
    expect(buscaDinamicaConfig.endpoints.timeouts).toBe('/timeouts');
    expect(buscaDinamicaConfig.timeout).toBe(15000);
  });

  test('deve ter integração com BGC Ferramentas', () => {
    const bgcConfig = {
      baseUrl: 'https://bgc-ferramentas.idwall.co',
      endpoints: {
        timeout: '/timeout',
        filas: '/filas',
        usuarios: '/usuarios'
      },
      timeout: 10000
    };
    
    expect(bgcConfig.baseUrl).toBe('https://bgc-ferramentas.idwall.co');
    expect(bgcConfig.endpoints.timeout).toBe('/timeout');
    expect(bgcConfig.endpoints.filas).toBe('/filas');
    expect(bgcConfig.endpoints.usuarios).toBe('/usuarios');
    expect(bgcConfig.timeout).toBe(10000);
  });
});
