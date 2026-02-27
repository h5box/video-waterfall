
class TaskScheduler {
  constructor(concurrency = 2) {
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject })
      this.process()
    })
  }

  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) return

    this.running++
    const { task, resolve, reject } = this.queue.shift()

    try {
      const result = await task()
      resolve(result)
    } catch (err) {
      reject(err)
    } finally {
      this.running--
      this.process()
    }
  }
}

export const thumbnailScheduler = new TaskScheduler(2)
