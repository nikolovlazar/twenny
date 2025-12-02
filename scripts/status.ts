import chalk from 'chalk';
import { getState } from './lib/state-manager';

async function main() {
  console.log(chalk.bold.cyan('\n📊 Current Optimization State\n'));
  console.log(chalk.cyan('━'.repeat(30)) + '\n');

  const state = await getState();

  if (!state) {
    console.log(chalk.yellow('⚠️  No state found'));
    console.log(chalk.gray('Run "npm run lesson" to get started\n'));
    return;
  }

  const stateLabel = state.optimized
    ? chalk.green.bold('✅ Optimized')
    : chalk.yellow.bold('❌ Unoptimized');

  console.log(`State: ${stateLabel}`);
  console.log(`Lesson: ${chalk.cyan(state.lesson)}`);
  console.log(`Last changed: ${chalk.gray(new Date(state.lastChanged).toLocaleString())}`);

  console.log('\n' + chalk.cyan('What this means:\n'));

  if (state.lesson === 'lesson-1') {
    if (state.optimized) {
      console.log(chalk.green('  ✓ Cursor-based pagination'));
      console.log(chalk.green('  ✓ Database indexes on tickets table'));
      console.log(chalk.green('  ✓ Fast queries (~500ms) at any page'));
    } else {
      console.log(chalk.red('  × Offset-based pagination'));
      console.log(chalk.red('  × No database indexes'));
      console.log(chalk.red('  × Slow queries at high page numbers'));
    }
  }

  console.log('\n' + chalk.cyan('To change state:'));
  console.log(chalk.white('  npm run lesson\n'));
}

main().catch(console.error);

