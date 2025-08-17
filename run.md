# Como Executar o Projeto

## Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado:

- **Node.js** versão 16.0.0 ou superior
- **npm** (Node Package Manager) ou **yarn**

### Verificar Instalações

```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version
```

## Instalação

### 1. Clonar/Download do Projeto

Se você baixou o projeto como arquivo ZIP:
1. Extraia o arquivo para uma pasta de sua preferência
2. Abra o terminal na pasta do projeto

### 2. Instalar Dependências

```bash
# Navegar para a pasta do projeto
cd "product comparisons"

# Instalar todas as dependências
npm install
```

**Nota**: A instalação pode levar alguns minutos na primeira vez.

## Execução

### Modo Desenvolvimento (Recomendado para testes)

```bash
# Executar em modo desenvolvimento com auto-reload
npm run dev
```

O servidor será iniciado na porta 3000 (padrão) e você verá mensagens como:
```
Server running on port 3000
Environment: development
```

### Modo Produção

```bash
# Executar em modo produção
npm start
```

## Configuração

### Porta do Servidor

Por padrão, o servidor roda na porta 3000. Para alterar:

```bash
# Definir porta personalizada
PORT=8080 npm start

# Ou em desenvolvimento
PORT=8080 npm run dev
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (opcional):

```env
PORT=3000
NODE_ENV=development
```

## Verificação de Funcionamento

### 1. Verificar se o Servidor Está Rodando

Após executar o comando de inicialização, você deve ver:
```
Server running on port 3000
Environment: development
```

### 2. Testar a API

Com o servidor rodando, abra um novo terminal e teste os endpoints:

```bash
# Testar endpoint de produtos
curl http://localhost:3000/api/products

# Testar endpoint de produto específico
curl http://localhost:3000/api/products/1

# Testar endpoint de comparação
curl "http://localhost:3000/api/products/compare?ids=1,2"
```

### 3. Acessar via Navegador

Abra seu navegador e acesse:
- `http://localhost:3000/api/products` - Lista de produtos
- `http://localhost:3000/api/products/1` - Produto específico

## Testes

### Executar Testes Automatizados

```bash
# Executar todos os testes uma vez
npm test

# Executar testes em modo watch (recomendado para desenvolvimento)
npm run test:watch
```

### Verificar Cobertura de Testes

Os testes incluem:
- Testes de endpoints da API
- Testes de validação de dados
- Testes de tratamento de erros

## Solução de Problemas

### Erro: "Port already in use"

```bash
# Encontrar processo usando a porta 3000
lsof -i :3000

# Matar o processo
kill -9 <PID>

# Ou usar porta diferente
PORT=3001 npm start
```

### Erro: "Module not found"

```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

### Erro: "Permission denied"

```bash
# Dar permissões de execução
chmod +x src/server.js
```

## Estrutura de Arquivos Importantes

```
product comparisons/
├── src/
│   ├── server.js          # Ponto de entrada
│   ├── controllers/       # Controladores da API
│   ├── services/          # Lógica de negócio
│   ├── middleware/        # Middlewares
│   └── data/             # Dados JSON
├── package.json           # Dependências e scripts
├── README.md              # Documentação completa
└── run.md                 # Este arquivo
```

## Comandos Úteis

```bash
# Ver logs em tempo real
npm run dev

# Parar o servidor
Ctrl + C

# Verificar status dos processos Node
ps aux | grep node

# Limpar cache do npm
npm cache clean --force
```

## Suporte

Se encontrar problemas:

1. Verifique se todas as dependências foram instaladas
2. Confirme que está usando Node.js 16+ 
3. Verifique se a porta 3000 não está sendo usada por outro processo
4. Execute `npm test` para verificar se há problemas nos testes

## Próximos Passos

Após executar com sucesso:
1. Explore os endpoints da API
2. Execute os testes para verificar funcionalidade
3. Consulte o README.md para mais detalhes sobre a API
4. Verifique o arquivo prompts.md para ver como as ferramentas GenAI foram utilizadas
