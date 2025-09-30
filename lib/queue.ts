interface QueueJob {
  id: string
  type: string
  data: any
  attempts: number
  maxAttempts: number
  createdAt: Date
  processAt: Date
}

class SimpleQueue {
  private jobs: Map<string, QueueJob> = new Map()
  private processors: Map<string, (data: any) => Promise<void>> = new Map()
  private isProcessing = false

  addJob(type: string, data: any, delay = 0): string {
    const id = crypto.randomUUID()
    const job: QueueJob = {
      id,
      type,
      data,
      attempts: 0,
      maxAttempts: 3,
      createdAt: new Date(),
      processAt: new Date(Date.now() + delay),
    }

    this.jobs.set(id, job)
    this.processJobs()
    return id
  }

  registerProcessor(type: string, processor: (data: any) => Promise<void>) {
    this.processors.set(type, processor)
  }

  private async processJobs() {
    if (this.isProcessing) return
    this.isProcessing = true

    const now = new Date()
    const readyJobs = Array.from(this.jobs.values()).filter((job) => job.processAt <= now)

    for (const job of readyJobs) {
      try {
        const processor = this.processors.get(job.type)
        if (processor) {
          await processor(job.data)
          this.jobs.delete(job.id)
        }
      } catch (error) {
        job.attempts++
        if (job.attempts >= job.maxAttempts) {
          console.error(`Job ${job.id} failed after ${job.maxAttempts} attempts:`, error)
          this.jobs.delete(job.id)
        } else {
          job.processAt = new Date(Date.now() + Math.pow(2, job.attempts) * 1000) // Exponential backoff
        }
      }
    }

    this.isProcessing = false

    // Schedule next processing
    if (this.jobs.size > 0) {
      setTimeout(() => this.processJobs(), 5000)
    }
  }
}

export const queue = new SimpleQueue()

// Register processors
queue.registerProcessor("send-email", async (data) => {
  // Email sending logic
  console.log("Sending email:", data)
})

queue.registerProcessor("verify-medicine", async (data) => {
  // Medicine verification logic
  console.log("Verifying medicine:", data)
})
