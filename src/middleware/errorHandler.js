/**
 * Middleware global de tratamento de erros
 * Fornece respostas de erro consistentes em toda a API
 */

const errorHandler = (err, req, res, next) => {
  // Registrar erro para depuração
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Valores padrão de erro
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Erro interno do servidor';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  // Lidar com tipos específicos de erro
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = 'Falha na validação';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID_FORMAT';
    message = 'Formato de ID inválido';
  } else if (err.code === 'ENOENT') {
    statusCode = 500;
    errorCode = 'FILE_NOT_FOUND';
    message = 'Arquivo de dados não encontrado';
  }

  // Não vazar detalhes de erro em produção
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Erro interno do servidor';
    errorCode = 'INTERNAL_ERROR';
  }

  // Enviar resposta de erro
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: errorCode,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = errorHandler;
