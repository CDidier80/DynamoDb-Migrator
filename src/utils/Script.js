/**
 * A convenience and stage-control wrapper for Node scripts in the project
 * New Script instances are instantiated with an options argument specifying enabled
 * stages and a callback function acting as the script.
*/
class Script {
  constructor(options /* { enabledStages: string[] } */, scriptCallback) {
    if (!options.enabledStages) {
      throw new Error("This script does not define any enabled stages.")
    }

    if (!Array.isArray(options.enabledStages)) {
      throw new Error("Scripts must include an array of enabled stages in their constructor options.")
    }

    this.enabledStages = options.enabledStages
    this.scriptCallback = scriptCallback
  }

  /**
   * Run the script. In usage this method is called by package.json scripts rather than
   * the javascript file in which the "Script" instance is instantiated and exported.
   */
  run() {
    if (!process.env.STAGE) {
      throw new Error("Must specify a stage to run a script.")
    }

    if (!this.enabledStages.includes(process.env.STAGE)) {
      throw new Error(`This script is not enabled for stage "${process.env.STAGE}"`)
    }

    /* Load the .env variables for the stage */
    require("../utils/serverlessDotEnv").config({ stage: process.env.STAGE })

    this.scriptCallback()
  }
}

module.exports = Script
