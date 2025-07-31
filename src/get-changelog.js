const path = require('path')
const { readJsonFile, fileExists, findProjectByName } = require('./libs/utils')

/**
 * Metadata for different types of changes
 */
const changeTypeMeta = [
  { type: 'feat', emoji: '🆕' },
  { type: 'fix', emoji: '🐛' },
  { type: 'refactor', emoji: '🔨' },
  { type: 'perf', emoji: '⚡' },
  { type: 'test', emoji: '✅' },
  { type: 'chore', emoji: '🔧' },
  { type: 'revert', emoji: '🔙' },
  { type: 'docs', emoji: '📖' },
  { type: 'style', emoji: '💄' },
  { type: 'other', emoji: '🔖' }
]

/**
 * Finds the rush.json file and parses it
 * @param {string} workingDirectory - The path to search for rush.json (defaults to current directory)
 * @returns {RushJson|null} - The parsed rush.json or null if not found
 */
function findRushJson(workingDirectory) {
  const rushJsonPath = path.resolve(workingDirectory, 'rush.json')

  if (!fileExists(rushJsonPath)) {
    throw new Error(`Cannot detect rush.json file at ${rushJsonPath}. Please ensure the working-directory input points to the directory containing rush.json, or that rush.json exists in the repository root.`)
  }
  
  const rushJson = readJsonFile(rushJsonPath)
  if (!rushJson) {
    throw new Error(`Failed to parse rush.json at ${rushJsonPath}`)
  }
  
  return rushJson
}

/**
 * Finds a project's folder path by its package name
 * @param {string} projectName - The package name to search for
 * @param {string} workingDirectory - The path containing rush.json
 * @returns {string} - The absolute path to the project folder
 */
function findProjectFolder(projectName, workingDirectory) {
  const rushJson = findRushJson(workingDirectory)
  const project = findProjectByName(rushJson, projectName)
  
  if (!project) {
    throw new Error(`Project with name "${projectName}" not found in rush.json`)
  }
  
  return path.resolve(workingDirectory, project.projectFolder)
}

/**
 * Reads and parses the CHANGELOG.json file for a project
 * @param {string} projectFolder - The absolute path to the project folder
 * @returns {ChangelogJson|null} - The parsed changelog or null if not found
 */
function readChangelogJson(projectFolder) {
  const changelogPath = path.join(projectFolder, 'CHANGELOG.json')
  
  if (!fileExists(changelogPath)) {
    throw new Error(`CHANGELOG.json not found at ${changelogPath}`)
  }
  
  const changelog = readJsonFile(changelogPath)
  if (!changelog) {
    throw new Error(`Failed to parse CHANGELOG.json at ${changelogPath}`)
  }
  
  return changelog
}

/**
 * Extracts changelog entry for a specific version
 * @param {ChangelogJson} changelog - The changelog object
 * @param {string} version - The version to extract
 * @returns {ChangelogEntry|null} - The changelog entry or null if version not found
 */
function extractVersionChangelog(changelog, version) {
  if (!changelog.entries || !Array.isArray(changelog.entries)) {
    throw new Error('Invalid changelog format: missing or invalid entries array')
  }
  
  const entry = changelog.entries.find(entry => entry.version === version)
  
  if (!entry) {
    throw new Error(`Version "${version}" not found in changelog for ${changelog.name}`)
  }
  
  return entry
}

/**
 * Converts changelog comments to markdown format
 * @param {ChangelogEntry} changelogEntry - The changelog entry
 * @param {string} projectName - The project name
 * @returns {string} - The markdown formatted changelog
 */
function convertToMarkdown(changelogEntry, projectName) {
  let markdown = `# ${projectName} v${changelogEntry.version}\n\n`
  markdown += `*Released: ${changelogEntry.date}*\n\n`
  
  const changesByType = {}
  
  // Collect all comments by type
  const allComments = [
    ...(changelogEntry.comments?.major || []),
    ...(changelogEntry.comments?.minor || []),
    ...(changelogEntry.comments?.patch || []),
    ...(changelogEntry.comments?.none || [])
  ]
  
  // Regular expression to parse conventional commit format
  const conventionalCommitRegex = /^(feat|fix|docs|style|refactor|perf|test|chore|revert)(\((.+)\))?(!)?: (.+)$/i
  
  allComments.forEach(commentObj => {
    const comment = commentObj.comment.trim()
    const matches = conventionalCommitRegex.exec(comment)
    
    let type = 'other'
    let subject = comment
    let isBreaking = false
    
    if (matches) {
      type = matches[1].toLowerCase()
      isBreaking = !!matches[4]
      subject = matches[5]
    }
    
    if (!changesByType[type]) {
      changesByType[type] = []
    }
    
    changesByType[type].push({
      subject,
      isBreaking
    })
  })
  
  // Generate markdown sections for each type
  changeTypeMeta.forEach(meta => {
    const changes = changesByType[meta.type]
    if (changes && changes.length > 0) {
      markdown += `## ${meta.emoji} ${meta.type.charAt(0).toUpperCase() + meta.type.slice(1)}\n\n`
      changes.forEach(change => {
        const breakingPrefix = change.isBreaking ? '**BREAKING**: ' : ''
        markdown += `- ${breakingPrefix}${change.subject}\n`
      })
      markdown += '\n'
    }
  })
  
  // Add 'other' changes if any
  const otherChanges = changesByType.other
  if (otherChanges && otherChanges.length > 0) {
    markdown += `## ${changeTypeMeta.find(m => m.type === 'other').emoji} Other\n\n`
    otherChanges.forEach(change => {
      markdown += `- ${change.subject}\n`
    })
    markdown += '\n'
  }
  
  return markdown.trim()
}

/**
 * Main function to get changelog for a specific project and version
 * @param {Object} options - The options object
 * @param {string} options.projectName - The name of the project
 * @param {string} options.version - The version to get changelog for
 * @param {string} [options.workingDirectory] - The path to rush.json (defaults to current directory)
 * @returns {Promise<string>} - The markdown formatted changelog
 */
async function getChangelog(options) {
  try {
    const { projectName, version, workingDirectory = './' } = options
    
    if (!projectName) {
      throw new Error('Project name is required')
    }
    
    if (!version) {
      throw new Error('Version is required')
    }
    
    // Find the project folder
    const projectFolder = findProjectFolder(projectName, workingDirectory)
    
    // Read the CHANGELOG.json
    const changelog = readChangelogJson(projectFolder)
    
    // Extract the specific version
    const versionEntry = extractVersionChangelog(changelog, version)
    
    // Convert to markdown
    const markdown = convertToMarkdown(versionEntry, projectName)
    
    return markdown
  } catch (error) {
    throw new Error(`Failed to get changelog: ${error.message}`)
  }
}

module.exports = getChangelog
