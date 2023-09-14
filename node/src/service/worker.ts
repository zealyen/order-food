import _ from 'lodash'
import { createLoggerByFilename } from '@/lib/logger'
import { Queue, Worker, type Job } from 'bullmq'
import { redisBullmq, isReady as isBullmqRedisReady } from '@/lib/redis'
import { orderService } from '@/service/orderService'

const logger = createLoggerByFilename(__filename)

export interface QueueContext {
  queue: Queue
  worker?: Worker
  // is will run when worker consume queue
  handlers: Map<string, (job: Job) => Promise<unknown>>
}

let queueCtx: Record<string, QueueContext> | null = null
const queueInitFuncs: Array<(ctx: Record<string, QueueContext>) => Promise<void>> = []

export const start = async (): Promise<Record<string, QueueContext>> => {
  const fnLogger = (json: object): void => {
    logger({ fn: 'worker.executeWorker', ...json })
  }

  await isBullmqRedisReady

  if (_.isNil(queueCtx)) {
    queueCtx = {
      cron: {
        queue: new Queue('cronQueue', { connection: redisBullmq }),
        handlers: new Map(),
      },
      delay: {
        queue: new Queue('delayQueue', { connection: redisBullmq }),
        handlers: new Map(),
      },
    }

    queueInitFuncs.push(
      async (ctx) => { if (_.isNil(queueCtx)) return; await orderService.registerQueueFuncs() },
    )

    try {
      // clear repeated jobs
      const oldRepeats = await queueCtx.cron.queue.getRepeatableJobs()
      await Promise.all(_.map(oldRepeats, async job => await queueCtx?.cron.queue.removeRepeatableByKey(job.key)))

      // init queue (register repeats jobs)
      for (const func of queueInitFuncs) {
        try {
          await func(queueCtx)
        } catch (err) {
          logger(err)
        }
      }

      queueCtx.cron.worker = new Worker(queueCtx.cron.queue.name, async (job: Job) => {
        try {
          const jobName = job.name
          const handler = queueCtx?.cron.handlers.get(jobName)
          if (_.isNil(handler)) throw new Error(`cronQueue handler for JobName ${jobName} not found`)
          await handler(job)
        } catch (err) {
          fnLogger({ errMsg: err.message, jobId: job.id, jobName: job.name })
          throw err
        }
      }, {
        autorun: true,
        connection: redisBullmq,
        removeOnComplete: { age: 3600, count: 100 }, // 1 hour or 100 jobs
        removeOnFail: { age: 3600 * 24 }, // 1 day
      })

      queueCtx.delay.worker = new Worker(queueCtx.delay.queue.name, async (job: Job) => {
        try {
          const jobName = job.name
          const handler = queueCtx?.delay.handlers.get(jobName)
          if (_.isNil(handler)) throw new Error(`delayQueue handler for JobName ${jobName} not found`)
          await handler(job)
        } catch (err) {
          fnLogger({ errMsg: err.message, jobId: job.id, jobName: job.name })
          throw err
        }
      }, {
        connection: redisBullmq,
        removeOnComplete: { age: 3600, count: 1000 }, // 1 hour or 100 jobs
        removeOnFail: { age: 3600 * 24 }, // 1 day
      })
    } catch (err) {
      throw _.update(err, 'data', data => _.extend(data, { fn: 'executeWorker' }))
    }
  }

  return queueCtx
}

export const close = async (): Promise<void> => {
  if (_.isNil(queueCtx)) return
  await queueCtx?.cron.worker?.close()
  await queueCtx?.delay.worker?.close()

  logger({ msg: 'close worker done' })
}
