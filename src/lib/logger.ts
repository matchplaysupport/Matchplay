export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.info(`[match-play] ${message}`, context ?? {});
  },
  error(message: string, error: unknown, context?: Record<string, unknown>) {
    console.error(`[match-play] ${message}`, error, context ?? {});
  },
};
