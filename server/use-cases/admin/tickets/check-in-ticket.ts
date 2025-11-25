import { db } from "@/server/db";
import { tickets } from "@/server/schema";
import { eq } from "drizzle-orm";

export async function checkInTicket(id: string, checkedInBy: string) {
  const [ticket] = await db
    .update(tickets)
    .set({
      isCheckedIn: 1,
      checkedInAt: new Date(),
      checkedInBy,
      status: "used",
      updatedAt: new Date(),
    })
    .where(eq(tickets.id, id))
    .returning();
  return ticket;
}

