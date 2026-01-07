import prompts from 'prompts';
import chalk from 'chalk';
import { getState, setState } from './lib/state-manager';
import { applyLesson } from './lib/apply-lesson';

interface Lesson {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

const LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    name: 'Lesson 1: Tickets Pagination',
    description: 'offset → cursor pagination + database indexes',
    available: true,
  },
  {
    id: 'lesson-2',
    name: 'Lesson 2: Order Items Caching',
    description: 'Redis caching with Sentry instrumentation',
    available: true,
  },
];

async function main() {
  console.log(chalk.bold.cyan('\n🎓 Twenny Performance Lessons'));
  console.log(chalk.cyan('━'.repeat(30)) + '\n');

  // Show current state
  const currentState = await getState();
  if (currentState) {
    const stateLabel = currentState.optimized
      ? chalk.green('Optimized')
      : chalk.yellow('Unoptimized');
    console.log(`Current state: ${stateLabel} (${currentState.lesson})`);
    console.log(`Last changed: ${new Date(currentState.lastChanged).toLocaleString()}\n`);
  } else {
    console.log(chalk.gray('No state found - first time setup\n'));
  }

  // Parse command line arguments
  const args = process.argv.slice(2);
  let selectedLesson: string | undefined;
  let selectedOptimized: boolean | undefined;

  // Support formats:
  // --lesson=lesson-1 --optimized
  // --lesson=lesson-1 --unoptimized
  // lesson-1 optimized
  // lesson-1 unoptimized
  if (args.length > 0) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.startsWith('--lesson=')) {
        selectedLesson = arg.split('=')[1];
      } else if (arg === '--optimized') {
        selectedOptimized = true;
      } else if (arg === '--unoptimized') {
        selectedOptimized = false;
      } else if (!selectedLesson && arg.startsWith('lesson-')) {
        selectedLesson = arg;
      } else if (!selectedLesson && LESSONS.some(l => l.id === arg)) {
        selectedLesson = arg;
      } else if (selectedLesson !== undefined && selectedOptimized === undefined) {
        if (arg === 'optimized' || arg === 'opt' || arg === 'o') {
          selectedOptimized = true;
        } else if (arg === 'unoptimized' || arg === 'unopt' || arg === 'u') {
          selectedOptimized = false;
        }
      }
    }
  }

  // Select lesson (use CLI arg or prompt)
  let lessonResponse: { lesson?: string } = {};
  if (selectedLesson) {
    const lesson = LESSONS.find(l => l.id === selectedLesson);
    if (!lesson) {
      console.log(chalk.red(`\n❌ Unknown lesson: ${selectedLesson}\n`));
      console.log(chalk.gray('Available lessons:'));
      LESSONS.forEach(l => {
        console.log(chalk.gray(`  - ${l.id}: ${l.name}`));
      });
      return;
    }
    if (!lesson.available) {
      console.log(chalk.red(`\n❌ Lesson not available: ${selectedLesson}\n`));
      return;
    }
    lessonResponse.lesson = selectedLesson;
    console.log(chalk.cyan(`Lesson: ${lesson.name}\n`));
  } else {
    lessonResponse = await prompts({
      type: 'select',
      name: 'lesson',
      message: 'Select a lesson:',
      choices: LESSONS.map(l => ({
        title: l.name,
        description: l.description,
        value: l.id,
        disabled: !l.available,
      })),
    });

    if (!lessonResponse.lesson) {
      console.log(chalk.gray('\nCancelled\n'));
      return;
    }
  }

  // Select optimization state (use CLI arg or prompt)
  let stateResponse: { optimized?: boolean } = {};
  if (selectedOptimized !== undefined) {
    stateResponse.optimized = selectedOptimized;
    const stateLabel = selectedOptimized ? chalk.green('Optimized') : chalk.yellow('Unoptimized');
    console.log(`State: ${stateLabel}\n`);
  } else {
    stateResponse = await prompts({
      type: 'select',
      name: 'optimized',
      message: 'Select optimization state:',
      choices: [
        {
          title: 'Unoptimized',
          description: 'Show the problem (slow performance)',
          value: false,
        },
        {
          title: 'Optimized',
          description: 'Show the solution (fast performance)',
          value: true,
        },
      ],
    });

    if (stateResponse.optimized === undefined) {
      console.log(chalk.gray('\nCancelled\n'));
      return;
    }
  }

  // Confirm if same as current state
  if (
    currentState &&
    currentState.lesson === lessonResponse.lesson &&
    currentState.optimized === stateResponse.optimized
  ) {
    console.log(chalk.yellow('\nℹ️  Already in this state!\n'));
    return;
  }

  // Apply the changes
  console.log(chalk.cyan('\n⏳ Applying changes...\n'));

  await applyLesson({
    lessonId: lessonResponse.lesson,
    optimized: stateResponse.optimized,
  });

  await setState(stateResponse.optimized, lessonResponse.lesson);

  // Success message
  console.log(chalk.green.bold('\n✨ Done!'));
  console.log(chalk.cyan('\n🔄 Restart your dev server:'));
  console.log(chalk.white('   npm run dev\n'));

  if (lessonResponse.lesson === 'lesson-1') {
    if (stateResponse.optimized) {
      console.log(chalk.cyan('🧪 Test the optimization:'));
      console.log(chalk.white('   http://localhost:3000/admin/tickets'));
      console.log(chalk.gray('   Navigate through pages - notice the consistent speed!\n'));
    } else {
      console.log(chalk.cyan('🧪 Test the problem:'));
      console.log(chalk.white('   http://localhost:3000/admin/tickets?page=10000'));
      console.log(chalk.gray('   Notice the slowdown at high page numbers!\n'));
    }
  } else if (lessonResponse.lesson === 'lesson-2') {
    if (stateResponse.optimized) {
      console.log(chalk.cyan('🧪 Test the optimization:'));
      console.log(chalk.white('   http://localhost:3000/admin/order-items'));
      console.log(chalk.gray('   First load ~1s (cache miss), refresh for ~50ms (cache hit)!\n'));
    } else {
      console.log(chalk.cyan('🧪 Test the problem:'));
      console.log(chalk.white('   http://localhost:3000/admin/order-items'));
      console.log(chalk.gray('   Notice the ~1s load time on every request!\n'));
    }
  }
}

main().catch((error) => {
  console.error(chalk.red('\n❌ Error:'), error.message);
  process.exit(1);
});

