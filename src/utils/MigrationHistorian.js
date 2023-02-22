class MigrationHistorian {
  constructor(history, dbClient) {
    /** An array of unix times for completed database migrations */
    this.history = history
    /**
     * A client for a database. Expects the client to define async methods
     * "getMigrationHistory", "createMigrationHistory", and "updateMigrationHistory"
     */
    this.dbClient = dbClient
  }

  /**
   * The external facing constructor for the class.
   *
   * Finds the Dynamodb "migrations" item on the requested table to determine
   * which migrations have already run. If no such item exists, create it.
   */
  static async initialize(dbClient) {
    let history = await this.getHistory(dbClient)
    if (!history) {
      history = await this.createHistory(dbClient)
    }
    return new MigrationHistorian(history, dbClient)
  }

  /**
   * Get the dynamodb item on this table that serves as a history of completed migrations.
   */
  static async getHistory(dbClient) {
    console.log("Finding migration history.")
    try {
      const history = await dbClient.getMigrationHistory()
      return history
    } catch (error) {
      console.log("Error retrieving migrations history.")
      console.error(error)
    }
  }

  static async createHistory(dbClient) {
    console.log("Creating migration history.")
    try {
      await dbClient.createMigrationHistory()
      return []
    } catch (error) {
      console.log("Failed to create migrations history.")
      console.error(error)
    }
  }

  /**
   * Create a dynamodb item on this table that serves as a history of completed migrations.
   */
  async updateHistory() {
    try {
      await this.dbClient.updateMigrationHistory(this.history)
      console.log("Updated migration history.")
    } catch (error) {
      console.log("Failed to update migration history.")
      console.error(error)
    }
  }

  async recordMigration(time) {
    this.history = [...this.history, time].sort(
      (a, b) => a - b
    )
    await this.updateHistory()
  }

  async recordRollback(time) {
    this.history = this.history.filter(
      (t) => t !== time
    )
    await this.updateHistory()
  }

  /** Get times (not including descriptions) of completed migrations */
  get completed() {
    return this.history
  }
}

module.exports = MigrationHistorian
