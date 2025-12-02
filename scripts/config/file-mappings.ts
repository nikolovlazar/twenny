export interface FileMapping {
  template: string; // Path within templates/[lesson]/[state]/
  target: string; // Path in actual codebase
  optimizedOnly?: boolean; // Only exists in optimized state
  unoptimizedOnly?: boolean; // Only exists in unoptimized state
}

// Lesson 1: Tickets Pagination Optimization
export const LESSON_1_MAPPINGS: FileMapping[] = [
  // Use case
  {
    template: 'server/use-cases/admin/tickets/list-tickets-admin.ts',
    target: 'server/use-cases/admin/tickets/list-tickets-admin.ts',
  },
  // Page component
  {
    template: 'app/admin/tickets/page.tsx',
    target: 'app/admin/tickets/page.tsx',
  },
  // Table component (different imports for each state)
  {
    template: 'app/admin/tickets/tickets-table.tsx',
    target: 'app/admin/tickets/tickets-table.tsx',
  },
  // Pagination components (different for each state)
  {
    template: 'components/admin/pagination.tsx',
    target: 'components/admin/pagination.tsx',
    unoptimizedOnly: true, // Only in unoptimized, removed in optimized
  },
  {
    template: 'components/admin/cursor-pagination.tsx',
    target: 'components/admin/cursor-pagination.tsx',
    optimizedOnly: true, // Only in optimized
  },
  // Cursor helpers (only in optimized)
  {
    template: 'server/lib/cursor-helpers.ts',
    target: 'server/lib/cursor-helpers.ts',
    optimizedOnly: true,
  },
];

// Export all lesson mappings for easy lookup
export const LESSON_MAPPINGS: Record<string, FileMapping[]> = {
  'lesson-1': LESSON_1_MAPPINGS,
};

