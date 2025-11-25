import { Queue } from "bullmq";
import Redis from "ioredis";

// Create Redis connection for BullMQ
const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// Create the main queue
export const ticketQueue = new Queue("tickets", {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
      age: 3600, // Keep completed jobs for 1 hour
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});

// Job types
export type ReleaseReservationJob = {
  reservationId: string;
  eventId: string;
};

// Add jobs to queue
export async function scheduleReservationRelease(
  reservationId: string,
  eventId: string,
  delayMs: number = 15 * 60 * 1000 // 15 minutes default
) {
  await ticketQueue.add(
    "release-reservation",
    { reservationId, eventId } as ReleaseReservationJob,
    { delay: delayMs }
  );
}

