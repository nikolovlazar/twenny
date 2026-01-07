import { LESSON_MAPPINGS } from '../config/file-mappings';
import { swapFiles } from './swap-templates';
import { applyTicketsIndexes, removeTicketsIndexes } from '../migrations/tickets-indexes';

interface ApplyLessonParams {
  lessonId: string;
  optimized: boolean;
}

export async function applyLesson({ lessonId, optimized }: ApplyLessonParams) {
  switch (lessonId) {
    case 'lesson-1':
      await applyLesson1(optimized);
      break;
    case 'lesson-2':
      await applyLesson2(optimized);
      break;
    default:
      throw new Error(`Unknown lesson: ${lessonId}`);
  }
}

async function applyLesson1(optimized: boolean) {
  const mappings = LESSON_MAPPINGS['lesson-1'];

  if (optimized) {
    // Apply optimizations
    await applyTicketsIndexes();
    console.log('');
    await swapFiles('lesson-1', mappings, true);
  } else {
    // Remove optimizations
    await removeTicketsIndexes();
    console.log('');
    await swapFiles('lesson-1', mappings, false);
  }
}

async function applyLesson2(optimized: boolean) {
  const mappings = LESSON_MAPPINGS['lesson-2'];

  // Lesson 2 only swaps files - no database migrations needed
  await swapFiles('lesson-2', mappings, optimized);
}

