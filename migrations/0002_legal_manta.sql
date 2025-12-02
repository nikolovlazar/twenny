-- Migration: Add ticket_inventory table and link tickets to inventory slots
-- This enables the pre-allocated inventory pattern for race condition detection

-- 1. Create the ticket_inventory table
CREATE TABLE "ticket_inventory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ticket_type_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- 2. Add foreign key constraint for ticket_inventory -> ticket_types
ALTER TABLE "ticket_inventory" ADD CONSTRAINT "ticket_inventory_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- 3. Create index on ticket_type_id for efficient lookups
CREATE INDEX "ticket_inventory_ticket_type_id_idx" ON "ticket_inventory" USING btree ("ticket_type_id");
--> statement-breakpoint

-- 4. Backfill: Create inventory slots for existing ticket types based on quantity
INSERT INTO "ticket_inventory" ("ticket_type_id", "created_at")
SELECT
    tt.id as ticket_type_id,
    now() as created_at
FROM "ticket_types" tt
CROSS JOIN LATERAL generate_series(1, tt.quantity) AS slot_number;
--> statement-breakpoint

-- 5. Add inventory_slot_id column to tickets table (NULLABLE first for migration)
ALTER TABLE "tickets" ADD COLUMN "inventory_slot_id" uuid;
--> statement-breakpoint

-- 6. Backfill: Link existing tickets to inventory slots
-- Assign each existing ticket to an available inventory slot of the same ticket type
WITH ranked_tickets AS (
    SELECT
        t.id as ticket_id,
        t.ticket_type_id,
        ROW_NUMBER() OVER (PARTITION BY t.ticket_type_id ORDER BY t.created_at) as rn
    FROM tickets t
    WHERE t.inventory_slot_id IS NULL
),
ranked_slots AS (
    SELECT
        ti.id as slot_id,
        ti.ticket_type_id,
        ROW_NUMBER() OVER (PARTITION BY ti.ticket_type_id ORDER BY ti.created_at) as rn
    FROM ticket_inventory ti
)
UPDATE tickets
SET inventory_slot_id = rs.slot_id
FROM ranked_tickets rt
JOIN ranked_slots rs ON rt.ticket_type_id = rs.ticket_type_id AND rt.rn = rs.rn
WHERE tickets.id = rt.ticket_id;
--> statement-breakpoint

-- 7. Now make inventory_slot_id NOT NULL
ALTER TABLE "tickets" ALTER COLUMN "inventory_slot_id" SET NOT NULL;
--> statement-breakpoint

-- 8. Add foreign key constraint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_inventory_slot_id_ticket_inventory_id_fk" FOREIGN KEY ("inventory_slot_id") REFERENCES "public"."ticket_inventory"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint

-- 9. Create UNIQUE index on inventory_slot_id - THIS CATCHES THE RACE CONDITION!
CREATE UNIQUE INDEX "tickets_inventory_slot_idx" ON "tickets" USING btree ("inventory_slot_id");
--> statement-breakpoint

-- 10. Drop the now-redundant quantity_sold column from ticket_types
ALTER TABLE "ticket_types" DROP COLUMN "quantity_sold";