const Script = require("../../utils/Script")

module.exports = new Script(
  { enabledStages: ["dev"] },
  async () => {
  const dbClient = require("../index")
  try {
    const allItems = await dbClient.scan()
    await dbClient.batchDelete(allItems)
  } catch (error) {
    console.error(error)
  }
})
