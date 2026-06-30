import { createLogger, format, transports } from 'winston';

// Log to stdout/stderr only. The hosting platform (Railway) captures the
// process output, so writing log files inside the container is pointless
// (ephemeral filesystem) and would require a writable dir for the non-root user.
const logger = createLogger({
  level: 'info',  // Minimum level to log
  transports: [
    new transports.Console({
      format: process.env.NODE_ENV === 'production'
        ? format.combine(
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.json()
          )
        : format.combine(
            format.colorize(),
            format.simple()
          ),
    }),
  ],
});

export default logger;
