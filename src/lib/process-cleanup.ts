// Prevent EventEmitter memory leak by setting max listeners
process.setMaxListeners(20);

// Global cleanup handler to prevent memory leaks
const cleanup = () => {
  // Remove all listeners to prevent memory leaks
  process.removeAllListeners('SIGTERM');
  process.removeAllListeners('SIGINT');
  process.removeAllListeners('uncaughtException');
  process.removeAllListeners('unhandledRejection');
};

// Set up single cleanup handlers
if (!process.listenerCount('SIGTERM')) {
  process.once('SIGTERM', cleanup);
}

if (!process.listenerCount('SIGINT')) {
  process.once('SIGINT', cleanup);
}

export { cleanup };