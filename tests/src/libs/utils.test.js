const { readJsonFile, fileExists, findProjectByName } = require('../../../src/libs/utils')
const path = require('path')
const fs = require('fs')

describe('utils', () => {
  const fixturesPath = path.join(__dirname, '..', '..', 'fixtures')
  
  describe('readJsonFile', () => {
    it('should read and parse valid JSON file', () => {
      const rushJsonPath = path.join(fixturesPath, 'rush.json')
      const result = readJsonFile(rushJsonPath)
      
      expect(result).toBeTruthy()
      expect(result.projects).toBeDefined()
      expect(Array.isArray(result.projects)).toBe(true)
    })
    
    it('should return null for non-existent file', () => {
      const result = readJsonFile('/path/to/non-existent.json')
      expect(result).toBeNull()
    })
    
    it('should return null for invalid JSON', () => {
      // Create a temporary invalid JSON file
      const tempPath = path.join(__dirname, 'temp-invalid.json')
      fs.writeFileSync(tempPath, '{ invalid json }')
      
      const result = readJsonFile(tempPath)
      expect(result).toBeNull()
      
      // Clean up
      fs.unlinkSync(tempPath)
    })
  })
  
  describe('fileExists', () => {
    it('should return true for existing file', () => {
      const rushJsonPath = path.join(fixturesPath, 'rush.json')
      expect(fileExists(rushJsonPath)).toBe(true)
    })
    
    it('should return false for non-existent file', () => {
      expect(fileExists('/path/to/non-existent.json')).toBe(false)
    })
  })
  
  describe('findProjectByName', () => {
    const mockRushJson = {
      projects: [
        { packageName: '@advanced/example-1', projectFolder: 'packages/example1' },
        { packageName: '@advanced/example-2', projectFolder: 'packages/example2' }
      ]
    }
    
    it('should find existing project', () => {
      const result = findProjectByName(mockRushJson, '@advanced/example-1')
      expect(result).toBeTruthy()
      expect(result.packageName).toBe('@advanced/example-1')
      expect(result.projectFolder).toBe('packages/example1')
    })
    
    it('should return null for non-existent project', () => {
      const result = findProjectByName(mockRushJson, '@advanced/non-existent')
      expect(result).toBeNull()
    })
    
    it('should handle invalid rushJson', () => {
      expect(findProjectByName(null, '@advanced/example-1')).toBeNull()
      expect(findProjectByName({}, '@advanced/example-1')).toBeNull()
      expect(findProjectByName({ projects: null }, '@advanced/example-1')).toBeNull()
      expect(findProjectByName({ projects: 'not-array' }, '@advanced/example-1')).toBeNull()
    })
  })
})
