const core = require('@actions/core')

const getChangeLog = require('./get-changelog')

async function run() {
  try {
    const options = {
      version: core.getInput('version'),
      projectName: core.getInput('project-name'),
      workingDirectory: core.getInput('working-directory') || process.cwd()
    }
    const markdown = await getChangeLog(options)

    core.setOutput('markdown', markdown)
  } catch (error) {
    core.setFailed(error.message)
  }
}

module.exports = run

if (require.main === module) {
  run()
}
