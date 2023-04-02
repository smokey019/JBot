import { SlashCommandBuilder } from '@discordjs/builders';
import { runEvent } from '..';

/**
 * This is ran when the command is triggered.
 * @param e
 * @returns
 */
export async function run(e: runEvent) {
  // const channel_name = (e.interaction.channel as TextChannel).name;

  if (e.interaction.user.id == '90514165138989056') {
    await e.interaction.reply({ content: '👍', ephemeral: true });
  } else {
    await e.interaction.reply({ content: '😠 nt', ephemeral: true });
  }
}

/**
 * Command name. Can be multiple in an array.
 */
export const names = ['test'];


/**
 * Command Name and Description used by Discord in the / menu.
 */
export const SlashCommandData = new SlashCommandBuilder()
  .setName('test')
  .setDescription('This is a test command.');
