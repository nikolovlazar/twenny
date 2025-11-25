import { Worker } from "bullmq";
import Redis from "ioredis";
import type { ReleaseReservationJob } from "./queue";

// Create Redis connection for worker
const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

// Create the worker
const worker = new Worker(
  "tickets",
  async (job) => {
    console.log(`Processing job ${job.id} of type ${job.name}`);

    switch (job.name) {
      case "release-reservation":
        await handleReleaseReservation(job.data as ReleaseReservationJob);
        break;
      default:
        console.warn(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

// Job handlers
async function handleReleaseReservation(data: ReleaseReservationJob) {
  console.log(`Releasing reservation ${data.reservationId} for event ${data.eventId}`);
  // TODO: Implement the actual reservation release logic
  // This will call a use case that updates the database
}

// Worker event handlers
worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err);
});

worker.on("error", (err) => {
  console.error("Worker error:", err);
});

console.log("Worker started and waiting for jobs...");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, closing worker...");
  await worker.close();
  process.exit(0);
});

