const redis = require('redis');

const retryStrategy = (options) => {
  if (options.error && options.error.code === 'ECONNREFUSED') {
    // Try reconnecting after 2 seconds
    return 2000;
  }
  return undefined;
};

// Create a Redis client
const client = redis.createClient({
  host: 'redis',   // Use your Redis service name here
  port: 6379,      // Default Redis port
  retry_strategy: retryStrategy
});

const redisConnection = async () => {
  try {
    await client.connect();
    console.log(`Connected to Redis at ${client.options.host}:${client.options.port}`);
  } catch (error) {
    console.error('Redis Client Error', error);
  }
};
global.client = client

module.exports = redisConnection;
