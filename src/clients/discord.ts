import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, CommandInteraction, Guild, Intents } from 'discord.js';
import { getConfigValue } from '../config';
import {
  commands,
  loadCommands,
  registerSlashCommands,
  slashCommands
} from '../plugins/commands';
import { format_number, getCurrentTime } from '../utils';
import { ICache, getCache, getGCD } from './cache';
import { IGuildSettings, getGuildSettings } from './database';
import { getLogger } from './logger';
import { last_message } from './queue';
import { enableAP } from './top.gg';

const logger = getLogger('DiscordClient');
export let rateLimited = false;
export let initializing = true;

export const discordClient = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGES /*
    Intents.FLAGS.GUILD_PRESENCES*/,
  ],
  shards: 'auto',
});

discordClient.on('ready', async () => {
  logger.info('Fully initialized.');
  initializing = false;
  await enableAP();
  await loadCommands();

  setTimeout(async () => {
    await registerSlashCommands();
  }, 15 * 1000);
});

discordClient.on(
  'interactionCreate',
  async (interaction: CommandInteraction) => {
    const GCD = await getGCD(interaction.guild.id);
    const timestamp = getCurrentTime();
    const settings: IGuildSettings = await getGuildSettings(interaction.guild);
    const cache: ICache = await getCache(interaction.guild, settings);

    //logger.debug('\n', interaction);

    if (!interaction.isCommand()) return;

    if (timestamp - GCD < 2) return;

    const command = interaction.commandName;
    const args = [interaction.options.getString('input')];
    const commandFile = commands.find((_r, n) => n.includes(command));

    if (!commandFile) return;
    else
      commandFile({
        interaction,
        args,
        client: discordClient,
        dev: true,
        settings: settings,
        cache: cache,
      });
  },
);

/**
 * Register Slash commands for new servers so they can use the commands ASAP. Do I have to do this?
 */
discordClient.on('guildCreate', async (guild: Guild) => {
  logger.debug(
    `\nRegistered commands in new guild '${guild.name}' ID: '${guild.id}'\n`,
  );

  let token = undefined;
  let api = undefined;

  if (JSON.parse(getConfigValue('DEV'))) {
    token = getConfigValue('DISCORD_TOKEN_DEV');
    api = getConfigValue('API_CLIENT_ID_DEV');
  } else {
    token = getConfigValue('DISCORD_TOKEN');
    api = getConfigValue('API_CLIENT_ID');
  }

  const rest = new REST({ version: '9' }).setToken(token);

  await rest.put(Routes.applicationGuildCommands(api, guild.id), {
    body: slashCommands,
  });
});

discordClient.on('rateLimit', (error) => {
  const timeoutStr = error.timeout / 1000;
  logger.warn(
    `Rate Limited.. waiting ${format_number(
      Math.round(timeoutStr / 60),
    )} minutes.`,
  );
  console.log(`Last Message:`, last_message);

  rateLimited = true;

  setTimeout(() => {
    logger.warn('Rate limit timeout elapsed.');
    rateLimited = false;
  }, error.timeout);
});

discordClient.on('shardError', (error) => {
  console.error('A websocket connection encountered an error:', error);
});

discordClient.on('error', (error) => {
  console.error('Discord Client Error:', error);
});

discordClient.on('shardReady', (id: number) => {
  console.error(`Shard ${id} is ready.`);
});
