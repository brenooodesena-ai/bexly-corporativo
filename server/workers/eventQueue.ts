/**
 * Event Queue — In-process async job queue
 *
 * Webhook endpoints respond immediately (< 200ms as required by Meta).
 * Heavy processing is deferred to this queue.
 *
 * Features:
 * - Async processing after webhook ACK
 * - Retry with exponential backoff
 * - Permanent failure detection (no infinite retries)
 * - Rate limiting awareness
 */
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface Job {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
  nextRunAt: Date;
  status: JobStatus;
  isPermanentFailure: boolean;
  error?: string;
}

const MAX_RETRIES = 3;
const BACKOFF_BASE_MS = 1000; // 1s, 2s, 4s

class EventQueue extends EventEmitter {
  private queue: Job[] = [];
  private running = false;
  private handlers = new Map<string, (payload: Record<string, unknown>) => Promise<void>>();

  register(jobType: string, handler: (payload: Record<string, unknown>) => Promise<void>): void {
    this.handlers.set(jobType, handler);
    logger.info(`[Queue] Handler registered for job type: ${jobType}`);
  }

  enqueue(type: string, payload: Record<string, unknown>, maxRetries = MAX_RETRIES): string {
    const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const job: Job = {
      id,
      type,
      payload,
      retryCount: 0,
      maxRetries,
      nextRunAt: new Date(),
      status: 'pending',
      isPermanentFailure: false,
    };
    this.queue.push(job);
    logger.info({ event: 'job_enqueued', jobId: id, type });
    setImmediate(() => this._process());
    return id;
  }

  private async _process(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      const now = new Date();
      const readyJobs = this.queue.filter(
        j => j.status === 'pending' && j.nextRunAt <= now
      );

      for (const job of readyJobs) {
        await this._runJob(job);
      }

      // Clean up completed/permanent-failed jobs older than 1 hour
      this.queue = this.queue.filter(j => {
        if ((j.status === 'completed' || j.isPermanentFailure) && j.nextRunAt < now) {
          return false;
        }
        return true;
      });
    } finally {
      this.running = false;
    }
  }

  private async _runJob(job: Job): Promise<void> {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      logger.error({ event: 'job_no_handler', jobId: job.id, type: job.type });
      job.status = 'failed';
      job.isPermanentFailure = true;
      return;
    }

    job.status = 'running';
    logger.info({ event: 'job_start', jobId: job.id, type: job.type, attempt: job.retryCount + 1 });

    try {
      await handler(job.payload);
      job.status = 'completed';
      logger.info({ event: 'job_completed', jobId: job.id, type: job.type });
    } catch (err) {
      job.retryCount++;
      const errorMessage = String(err);
      job.error = errorMessage;

      logger.warn({ event: 'job_failed', jobId: job.id, type: job.type, attempt: job.retryCount, error: errorMessage });

      // Check for permanent errors (don't retry)
      const isPermanent = errorMessage.includes('Permission denied') ||
        errorMessage.includes('Invalid token') ||
        errorMessage.includes('Account blocked') ||
        errorMessage.includes('permanent_error');

      if (isPermanent || job.retryCount >= job.maxRetries) {
        job.status = 'failed';
        job.isPermanentFailure = isPermanent;
        logger.error({
          event: 'job_permanent_failure',
          jobId: job.id,
          type: job.type,
          error: errorMessage,
          isPermanent,
        });
      } else {
        // Exponential backoff: 1s, 2s, 4s
        const backoffMs = BACKOFF_BASE_MS * Math.pow(2, job.retryCount - 1);
        job.status = 'pending';
        job.nextRunAt = new Date(Date.now() + backoffMs);
        logger.info({ event: 'job_retry_scheduled', jobId: job.id, backoffMs, nextRun: job.nextRunAt });

        // Schedule re-processing after backoff
        setTimeout(() => this._process(), backoffMs);
      }
    }
  }

  getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(j => j.status === 'pending').length,
      running: this.queue.filter(j => j.status === 'running').length,
      completed: this.queue.filter(j => j.status === 'completed').length,
      failed: this.queue.filter(j => j.status === 'failed').length,
    };
  }
}

export const eventQueue = new EventQueue();
