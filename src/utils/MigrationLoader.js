const fs = require("fs")
const path = require("path")

class MigrationLoader {
  constructor(migrationsRelativePath, historian) {
    if (!migrationsRelativePath) {
      throw new Error(
        "Missing argument 'migrationsRelativePath' in MigrationLoader constructor."
      )
    }

    if (!historian) {
      throw new Error("Missing argument 'historian' in MigrationLoader constructor.")
    }

    this.historian = historian

    const migrationsDirectory = path.resolve(__dirname, migrationsRelativePath)
    const migrationFiles = fs.readdirSync(migrationsDirectory)

    this.migrations = migrationFiles
      .map((fileName) => {
        const migration = require(`${migrationsDirectory}/${fileName}`)
        const time = Number(fileName.split("_")[0])
        return {
          fileName,
          time,
          ...migration,
        }
      })
      .sort((a, b) => a.time - b.time)
  }

  /**
   * Check each migration file against the history of completed migrations.
   * Migrations loaded from the directory which are already recorded by the
   * historian are "Completed", making them candidates for rollback.
   */
  get completed() {
    console.log("Finding completed migrations.")
    return this.migrations.filter(
      (m) =>
        this.historian.completed.find((time) => time === m.time) !==
        undefined
    )
  }

  /**
   * Check each migration file against the history of completed migrations.
   * Migrations loaded from the directory with no history of completion in the
   * historian are "Pending"
   */
  get pending() {
    console.log("Finding pending migrations.")
    return this.migrations.filter(
      (m) =>
        this.historian.completed.find((time) => time === m.time) ===
        undefined
    )
  }
}

module.exports = MigrationLoader
