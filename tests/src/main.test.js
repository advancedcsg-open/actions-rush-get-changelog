const process = require('process')
const { join } = require('path')

describe('test runs', () => {
  const OLD_ENV = process.env

  beforeEach(async () => {
    process.env = { ...OLD_ENV } // Make a copy
  })

  afterEach(async () => {
    jest.resetModules() // Most important - it clears the cache
    process.env = OLD_ENV // Restore old environment
  })

  it('test action as module executes - success', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(join(__dirname, '..', 'fixtures'))

    const actionsCore = require('@actions/core')
    jest.mock('@actions/core')
    
    // Mock the inputs
    actionsCore.getInput = jest.fn()
      .mockReturnValueOnce('0.8.13') // version
      .mockReturnValueOnce('@advanced/example-1') // project-name
      .mockReturnValueOnce('') // working-directory (empty, so it will use process.cwd)

    const action = require('../../src/main')
    await action()
    
    expect(actionsCore.setOutput).toHaveBeenCalledWith('markdown', expect.stringContaining('🐛 Fix'))
    expect(actionsCore.setOutput).toHaveBeenCalledWith('markdown', expect.not.stringContaining('# @advanced/example-1 v0.8.13'))
  })

  it('test action as module executes - failed with invalid project', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(join(__dirname, '..', 'fixtures'))

    const actionsCore = require('@actions/core')
    jest.mock('@actions/core')
    
    // Mock the inputs
    actionsCore.getInput = jest.fn()
      .mockReturnValueOnce('1.0.0') // version
      .mockReturnValueOnce('@advanced/non-existent') // project-name
      .mockReturnValueOnce('') // working-directory

    const action = require('../../src/main')
    await action()

    expect(actionsCore.setFailed).toHaveBeenCalledWith(expect.stringContaining('Project with name "@advanced/non-existent" not found'))
  })
  
  it('test action as module executes - failed with invalid version', async () => {
    jest.spyOn(process, 'cwd').mockReturnValue(join(__dirname, '..', 'fixtures'))

    const actionsCore = require('@actions/core')
    jest.mock('@actions/core')
    
    // Mock the inputs
    actionsCore.getInput = jest.fn()
      .mockReturnValueOnce('999.999.999') // version
      .mockReturnValueOnce('@advanced/example-1') // project-name
      .mockReturnValueOnce('') // working-directory

    const action = require('../../src/main')
    await action()

    expect(actionsCore.setFailed).toHaveBeenCalledWith(expect.stringContaining('Version "999.999.999" not found'))
  })
})
