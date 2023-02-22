const DbClient = require("./utils/DbClient")

/**
 * Retrieves the AWS ARN string that points to the given dynamodb table.
 * If this file is executed in the context of a lambda function the requisite
 * environment variables are supplied through serverless and serverless-dotenv.
 *
 * If the file is executed as part of a node script (e.g. migration) environment
 * variables must be loaded through a custom script.
 */
function getDynamoTableARN() {
  // if (process.env.DYNAMO_TABLE_KEY) {
  //   return process.env[process.env.DYNAMO_TABLE_KEY]
  // } else {
  //   if (!process.env.STAGE) throw new Error("Must specify a stage to run script.")
  //   /* load env variables if not provided by serverless */
  //   require("../utils/serverlessDotEnv").config({ stage: process.env.STAGE })
  //   return process.env[process.argv[2]]
  // }
}

const tableArn = getDynamoTableARN()

const dbModule = (module.exports = new DbClient(tableArn, {
  region: "us-east-2",
  secretAccessKey: process.env.AWS_KEY,
  accessKeyId: process.env.AWS_KEY_ID,
}))

dbModule.tableName = tableArn
