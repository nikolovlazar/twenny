import fs from 'fs/promises';

const STATE_FILE = '.optimization-state.json';

export interface OptimizationState {
  optimized: boolean;
  lesson: string;
  lastChanged: string;
}

export async function getState(): Promise<OptimizationState | null> {
  try {
    const content = await fs.readFile(STATE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function setState(optimized: boolean, lesson: string = 'lesson-1') {
  const state: OptimizationState = {
    optimized,
    lesson,
    lastChanged: new Date().toISOString(),
  };
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

