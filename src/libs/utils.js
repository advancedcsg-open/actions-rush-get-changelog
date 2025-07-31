const fs = require('fs')
const path = require('path')
const stripJsonComments = require('./strip-json-comments')

/**
 * Utility function to read and parse JSON files safely
 * @param {string} filePath - The absolute path to the JSON file
 * @returns {object|null} - Parsed JSON object or null if file doesn't exist or invalid
 */
function readJsonFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const cleanedContent = stripJsonComments(fileContent)
    return JSON.parse(cleanedContent)
  } catch (error) {
    return null
  }
}

/**
 * Utility function to check if a file exists
 * @param {string} filePath - The path to check
 * @returns {boolean} - True if file exists, false otherwise
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath)
  } catch (error) {
    return false
  }
}

/**
 * Utility function to find a project by name in rush.json
 * @param {object} rushJson - The parsed rush.json object
 * @param {string} projectName - The project name to find
 * @returns {object|null} - The project object or null if not found
 */
function findProjectByName(rushJson, projectName) {
  if (!rushJson || !rushJson.projects || !Array.isArray(rushJson.projects)) {
    return null
  }
  
  return rushJson.projects.find(project => project.packageName === projectName) || null
}

module.exports = {
  readJsonFile,
  fileExists,
  findProjectByName
}
