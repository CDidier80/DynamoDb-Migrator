const execSync = require("child_process").execSync
const fs = require("fs")

/* provided via CLI */
const migrationDescription = process.argv[2]

if (!migrationDescription) {
  throw new Error("Missing CLI argument. Must provide a migration description")
}

const time = new Date().getTime()

const migrationFile = `db/migrations/${time}_${migrationDescription}.js`

// an obvious injection vulnerability that needs to get addressed..
execSync(`touch ${migrationFile}`, { stdio: [0, 1, 2] })

const template = `const dbClient = require("../index")

module.exports = {
  async up() {
    /* your code here */
  },
  async down() {
    /* your code here */
  }
}
`
const writeStream = fs.createWriteStream(migrationFile)
writeStream.write(template)
writeStream.end()
