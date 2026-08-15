/**
 * Typed view of the environment. Everything reads config through this object
 * rather than touching process.env directly, so there is exactly one place
 * where an env var name is spelled out.
 */
export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigins: string[];
}

export default (): AppConfig => ({
  nodeEnv: (process.env.NODE_ENV as AppConfig['nodeEnv']) ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  mongodbUri: process.env.MONGODB_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
});
