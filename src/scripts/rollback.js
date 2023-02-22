const Script = require("../../utils/Script")

module.exports = new Script(
  { enabledStages: ["dev", "production"] },
  async () => {
    const Migrator = require("../utils/Migrator")
    const dbClient = require("../index")

    const migrator = await Migrator.initialize({
      migrationsPath: "../migrations",
      dbClient,
    })
    await migrator.rollback()
  }
)
