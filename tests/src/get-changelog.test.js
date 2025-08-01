const path = require('path')

describe('get-changelog', () => {
  const fixturesPath = path.join(__dirname, '..', 'fixtures')
  
  beforeEach(async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(fixturesPath)
  })
  afterEach(async () => {
    jest.resetAllMocks()
    jest.resetModules() // Most important - it clears the cache
  })

  it('should get changelog for a specific project and version', async () => {
    const options = {
      projectName: '@advanced/example-1',
      version: '0.8.13',
      workingDirectory: '.'
    }
    
    const getChangelog = require('../../src/get-changelog')
    const markdown = await getChangelog(options)
    
    expect(markdown).toContain('🐛 Fix')
    expect(markdown).toContain('Updated component to handle edge cases better')
    expect(markdown).toContain('Fixed memory leak in event listeners')
    expect(markdown).not.toContain('# @advanced/example-1 v0.8.13')
    expect(markdown).not.toContain('Wed, 08 Dec 2021 08:44:31 GMT')
  })
  
  it('should get changelog for a different version', async () => {
    const options = {
      projectName: '@advanced/example-1',
      version: '0.8.12',
      workingDirectory: '.'
    }
    
    const getChangelog = require('../../src/get-changelog')
    const markdown = await getChangelog(options)
    
    expect(markdown).toContain('🆕 Feat')
    expect(markdown).toContain('Added new validation feature')
    expect(markdown).toContain('🐛 Fix')
    expect(markdown).toContain('Resolved issue with undefined values')
    expect(markdown).not.toContain('# @advanced/example-1 v0.8.12')
  })
  
  it('should handle breaking changes', async () => {
    const options = {
      projectName: '@advanced/example-1',
      version: '0.8.11',
      workingDirectory: '.'
    }
    
    const getChangelog = require('../../src/get-changelog')
    const markdown = await getChangelog(options)
    
    expect(markdown).toContain('🆕 Feat')
    expect(markdown).toContain('**BREAKING**: Breaking change - restructured API')
    expect(markdown).not.toContain('# @advanced/example-1 v0.8.11')
  })
  
  it('should work with different project', async () => {
    const options = {
      projectName: '@advanced/example-2',
      version: '1.2.0',
      workingDirectory: '.'
    }
    
    const getChangelog = require('../../src/get-changelog')
    const markdown = await getChangelog(options)
    
    expect(markdown).toContain('🆕 Feat')
    expect(markdown).toContain('Added support for custom themes')
    expect(markdown).toContain('📖 Docs')
    expect(markdown).toContain('Updated README with examples')
    expect(markdown).not.toContain('# @advanced/example-2 v1.2.0')
  })
  
  it('should throw error for non-existent project', async () => {
    const options = {
      projectName: '@advanced/non-existent',
      version: '1.0.0',
      workingDirectory: '.'
    }
    
    const getChangelog = require('../../src/get-changelog')
    await expect(getChangelog(options)).rejects.toThrow('Project with name "@advanced/non-existent" not found in rush.json')
  })
  
  it('should throw error for non-existent version', async () => {
    const options = {
      projectName: '@advanced/example-1',
      version: '999.999.999',
      workingDirectory: '.'
    }
    
    const getChangelog = require('../../src/get-changelog')
    await expect(getChangelog(options)).rejects.toThrow('Version "999.999.999" not found in changelog')
  })
  
  it('should throw error for missing project name', async () => {
    const options = {
      version: '1.0.0',
      workingDirectory: '.'
    }
    
    const getChangelog = require('../../src/get-changelog')
    await expect(getChangelog(options)).rejects.toThrow('Project name is required')
  })
  
  it('should throw error for missing version', async () => {
    const options = {
      projectName: '@advanced/example-1',
      workingDirectory: '.'
    }
    
    const getChangelog = require('../../src/get-changelog')
    await expect(getChangelog(options)).rejects.toThrow('Version is required')
  })
  
  it('should throw error for invalid rush path', async () => {
    const options = {
      projectName: '@advanced/example-1',
      version: '1.0.0',
      workingDirectory: '/invalid/path'
    }
    
    const getChangelog = require('../../src/get-changelog')
    await expect(getChangelog(options)).rejects.toThrow('Cannot detect rush.json file')
  })
})
