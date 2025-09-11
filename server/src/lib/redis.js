// redis.js - Make sure this is correctly set up in your lib directory
import { createClient } from 'redis';

// Initialize Redis client
const client = createClient({
  url: 'rediss://default:AVUzAAIncDFmMjgyMjE4NGJhMzE0YzhiYjMxZjEwNzQ4OWFiM2FlZnAxMjE4MTE@diverse-bonefish-21811.upstash.io:6379',
   socket: {
    tls: true,
    rejectUnauthorized: false, // sometimes needed if certs fail
  }
});

// Handle Redis errors
client.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis only if not already connected
async function initializeRedis() {
  if (!client.isOpen) {
    try {
      await client.connect();
      console.log('Redis client connected');
    } catch (err) {
      console.error('Failed to connect to Redis:', err);
      throw err;
    }
  }
}

// Disconnect Redis client (useful for graceful shutdown)
async function disconnectRedis() {
  if (client.isOpen) {
    try {
      await client.quit();
      console.log('Redis client disconnected');
    } catch (err) {
      console.error('Error disconnecting Redis:', err);
    }
  }
}

// Initialize Redis on module load
initializeRedis().catch((err) => {
  console.error('Redis initialization failed:', err);
});

// Handle process termination to disconnect Redis
process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
  process.exit(0);
});

export default { disconnectRedis, client };
