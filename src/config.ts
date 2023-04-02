import dotenv from 'dotenv';

interface IConfig {
  DB_DATABASE?: string;
  DB_HOST?: string;
  DB_PORT?: string;
  DB_PASSWORD?: string;
  DB_USER?: string;
  DISCORD_TOKEN?: string;
  DISCORD_TOKEN_DEV?: string;
  API_CLIENT_ID?: string;
  API_CLIENT_ID_DEV?: string;
  DEV?: string;
  LOG_LEVEL?: string;
  TOPGG_KEY?: string;
  SMOKEYBOT_API_TOKEN?: string;
  API_URL?: string;
}

const config = dotenv.config({
  debug: process.env.NODE_ENV !== 'production',
});

/**
 * Returns the Config value for the specified key.
 *
 * @param key Config key to receive the value for.
 */
export function getConfigValue<K extends keyof IConfig>(key: K): IConfig[K] {
  return config.parsed?.[key];
}
