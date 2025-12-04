import fs from "fs/promises";

interface OptimizationState {
  optimized: boolean;
  lesson: string;
  lastChanged: string;
}

export async function getOptimizationState(): Promise<OptimizationState | null> {
  try {
    const content = await fs.readFile(".optimization-state.json", "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

