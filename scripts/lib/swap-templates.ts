import fs from 'fs/promises';
import path from 'path';
import { FileMapping } from '../config/file-mappings';

export async function swapFiles(
  lessonId: string,
  mappings: FileMapping[],
  toOptimized: boolean
) {
  const stateDir = toOptimized ? 'optimized' : 'unoptimized';
  console.log(`🔄 Swapping files to ${stateDir} state...\n`);

  for (const mapping of mappings) {
    const targetPath = path.join(process.cwd(), mapping.target);

    // Handle optimizedOnly files (only exist in optimized state)
    if (mapping.optimizedOnly) {
      if (toOptimized) {
        // Copy optimized-only file
        const templatePath = path.join('templates', lessonId, stateDir, mapping.template);
        try {
          const content = await fs.readFile(templatePath, 'utf-8');
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
          await fs.writeFile(targetPath, content);
          console.log(`✅ ${mapping.target} (created)`);
        } catch (error) {
          console.error(`❌ Failed: ${mapping.template}`, error);
          throw error;
        }
      } else {
        // Remove optimized-only file when switching to unoptimized
        try {
          await fs.unlink(targetPath);
          console.log(`🗑️  ${mapping.target} (removed)`);
        } catch {
          // File might not exist, that's ok
        }
      }
      continue;
    }

    // Handle unoptimizedOnly files (only exist in unoptimized state)
    if (mapping.unoptimizedOnly) {
      if (!toOptimized) {
        // Copy unoptimized-only file
        const templatePath = path.join('templates', lessonId, stateDir, mapping.template);
        try {
          const content = await fs.readFile(templatePath, 'utf-8');
          await fs.mkdir(path.dirname(targetPath), { recursive: true });
          await fs.writeFile(targetPath, content);
          console.log(`✅ ${mapping.target} (created)`);
        } catch (error) {
          console.error(`❌ Failed: ${mapping.template}`, error);
          throw error;
        }
      } else {
        // Remove unoptimized-only file when switching to optimized
        try {
          await fs.unlink(targetPath);
          console.log(`🗑️  ${mapping.target} (removed)`);
        } catch {
          // File might not exist, that's ok
        }
      }
      continue;
    }

    // Regular file swap (exists in both states)
    const templatePath = path.join('templates', lessonId, stateDir, mapping.template);
    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, content);
      console.log(`✅ ${mapping.target}`);
    } catch (error) {
      console.error(`❌ Failed: ${mapping.template}`, error);
      throw error;
    }
  }

  console.log('\n✅ File swap complete');
}

