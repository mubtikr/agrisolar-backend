export class StructuredLogger {
  static info(message: string, context?: Record<string, unknown>) {
    const entry = {
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    console.log(JSON.stringify(entry));
  }

  static warn(message: string, context?: Record<string, unknown>) {
    const entry = {
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    console.warn(JSON.stringify(entry));
  }

  static error(message: string, context?: Record<string, unknown>) {
    const entry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      ...context,
    };
    console.error(JSON.stringify(entry));
  }
}
