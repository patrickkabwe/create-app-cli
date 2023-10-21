import winston from 'winston';

const colors = {
  error: 'red',
  warn: 'darkred',
  info: 'blue',
  debug: 'gray',
};

const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({
          colors,
        }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.align(),
        winston.format.printf((info) => {
          const { timestamp, level, message, ...extra } = info;

          return `${timestamp} [${level}]: ${message} ${
            (Object.keys(extra).length > 0) ? JSON.stringify(extra, null, 2) : ''
          }`;
        }),
      ),
    }),
  ],
});

export { logger };
