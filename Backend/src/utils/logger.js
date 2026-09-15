const serializeError = (error) => {
  if (!error) return undefined;
  return {
    name: error.name,
    message: error.message,
    code: error.code,
    status: error.statusCode || error.response?.status
  };
};

const write = (level, event, data = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data
  };

  if (data.error instanceof Error) {
    entry.error = serializeError(data.error);
  }

  const output = JSON.stringify(entry);
  if (level === 'error') console.error(output);
  else if (level === 'warn') console.warn(output);
  else console.log(output);
};

export const logger = {
  info: (event, data) => write('info', event, data),
  warn: (event, data) => write('warn', event, data),
  error: (event, data) => write('error', event, data)
};

export { serializeError };
