const MigrationHistorian = require("./MigrationHistorian")
const MigrationLoader = require("./MigrationLoader")

class Migrator {
  constructor(dbClient, historian, loader) {
    /** The ARN that points to a DynamoDB table's AWS resource */
    this.tableName = dbClient.tableName
    /* A pre-configured DbClient instance */
    this.dbClient = dbClient
    this.historian = historian
    this.loader = loader
  }

  /** The external-facing contstructor for the class */
  static async initialize({ dbClient, migrationsPath }) {
    const historian = await MigrationHistorian.initialize(dbClient)
    const loader = new MigrationLoader(migrationsPath, historian)
    return new Migrator(dbClient, historian, loader)
  }

  async forEachMigration(migrations, callback) {
    if (!migrations.length) {
      console.log(`There are no migrations.`)
      return
    }

    console.log("Found: ")
    migrations.forEach((m) => {
      console.log(`\t${m.fileName}`)
    })

    for (const migration of migrations) {
      await callback(migration)
      await this.historian.recordMigration(migration.time)
    }
  }

  /** Run the "up" method of each pending migration */
  async migrate() {
    console.log("Preparing to migrate")
    this.forEachMigration(this.loader.pending, async (migration) => {
      console.log("Migrating: ", migration.fileName)
      await migration.up()
    })
  }

  /** Run the "down" method of each completed migration */
  async rollback() {
    console.log("Preparing to rollback")
    this.forEachMigration(
      this.loader.completed.reverse(),
      async (migration) => {
        console.log("Rolling back: ", migration.fileName)
        await migration.down()
      }
    )
  }
}

module.exports = Migrator
