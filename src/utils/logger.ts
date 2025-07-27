const logger = {
  info: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(`❌ ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    if (import.meta.env.DEV) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }
};

export default logger;