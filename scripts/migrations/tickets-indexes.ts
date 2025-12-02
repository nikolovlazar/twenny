import { pgClient } from '@/server/db';

const TICKETS_INDEXES = [
  // Composite index for efficient cursor pagination
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_created_at_id_idx ON tickets (created_at DESC, id DESC)',

  // Filter indexes
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_status_idx ON tickets (status)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_order_id_idx ON tickets (order_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_event_id_idx ON tickets (event_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_customer_id_idx ON tickets (customer_id)',
  'CREATE INDEX CONCURRENTLY IF NOT EXISTS tickets_attendee_email_idx ON tickets (attendee_email)',
];

export async function applyTicketsIndexes() {
  console.log('📊 Creating indexes on tickets table...\n');
  console.log('⏳ This may take 30-60 seconds for 13M rows...\n');

  for (const [i, sql] of TICKETS_INDEXES.entries()) {
    const indexName = sql.match(/INDEX (?:CONCURRENTLY )?(?:IF NOT EXISTS )?(\w+)/)?.[1];
    const startTime = Date.now();

    try {
      await pgClient.unsafe(sql);
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ [${i + 1}/${TICKETS_INDEXES.length}] ${indexName} (${duration}s)`);
    } catch (error: any) {
      if (error.code === '42P07') {
        console.log(`⏭️  [${i + 1}/${TICKETS_INDEXES.length}] ${indexName} (already exists)`);
      } else {
        throw error;
      }
    }
  }

  console.log('\n✅ All tickets indexes created');
}

export async function removeTicketsIndexes() {
  const indexes = [
    'tickets_created_at_id_idx',
    'tickets_status_idx',
    'tickets_order_id_idx',
    'tickets_event_id_idx',
    'tickets_customer_id_idx',
    'tickets_attendee_email_idx',
  ];

  console.log('🗑️  Dropping indexes from tickets table...\n');

  for (const [i, indexName] of indexes.entries()) {
    try {
      await pgClient.unsafe(`DROP INDEX CONCURRENTLY IF EXISTS ${indexName}`);
      console.log(`✅ [${i + 1}/${indexes.length}] Dropped ${indexName}`);
    } catch (error) {
      console.log(`⚠️  [${i + 1}/${indexes.length}] Failed: ${indexName}`);
    }
  }

  console.log('\n✅ All tickets indexes removed');
}

