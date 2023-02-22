const Script = require("../../utils/Script")

/** Copies the content of one Dynamo database into another compatible Dynamo database */
module.exports = new Script({ enabledStages: ["dev", "production"] }, async () => {
  const DbClient = require("../utils/DbClient")
  const fs = require('fs')
  const path = require('path')
  const targetEnvDbClient = require("../../db/index")

  const prodEnvFile = (fs.readFileSync(path.resolve(__dirname, "../../.env.production"))).toString()

  let arn = prodEnvFile.split("AWS_ARN_BIDS_TABLE=")[1]
  arn = arn.split(" ")[0]
  arn = arn.split("\n")[0]
  arn = arn.replace("AWS_ARN_BIDS_TABLE=", "")

  if (arn) {
    const options = {
      region: "us-east-2",
      secretAccessKey: process.env.AWS_KEY,
      accessKeyId: process.env.AWS_KEY_ID,
    }

    const prodDbClient = new DbClient(arn, options)
    const prodData = await prodDbClient.scan()
    if (prodData) {
      const data = await targetEnvDbClient.scan()
      await targetEnvDbClient.batchDelete(data)
      await targetEnvDbClient.batchPut(prodData)
    }
  }
})
