class BatchTransactor {
  constructor(Items) {
    this.Items = Items
  }
  /**
   * Create batches with max length of 100 items to pass to
   * Dynamo transactions
   */
  makeTransactionBatches(Items) {
    let batches = [[]]
    Items.forEach((item) => {
      /* Transactions are limited to 100 item batches */
      if (batches[0].length === 100) {
        batches.unshift([])
      }
      batches[0].push(item)
    })
    console.log(`Created ${batches.length} transaction batches.`)
    return batches
  }

  async forEachBatch(transactionCallback) {
    let batches = this.makeTransactionBatches(this.Items)
    while (batches.length > 0) {
      await transactionCallback(batches[0])
      batches.shift()
    }
  }
}

module.exports = BatchTransactor
