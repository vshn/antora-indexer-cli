import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

import path from 'path'
import { parseAntoraFile } from '../src/lib/parser'
import { ParsedFileEntry } from '../src/lib/parsed_file_entry'

describe('Parsing of versioned docs', () => {
  it('throws if antora.yml not found', async () => {
    const startPath = path.join(__dirname, 'antora', 'invalid')
    expect(() => parseAntoraFile(startPath)).to.throw()
  })

  it('should read the antora.yml file', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results).not.to.be.null
  })

  it('should return 4 items', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results.length).to.equal(4)
  })

  it('should return meaningful items', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.excerpt).not.to.be.undefined
    expect(result.href).not.to.be.undefined
    expect(result.name).not.to.be.undefined
    expect(result.text).not.to.be.undefined
    expect(result.version).to.equal('0.0.1')
  })

  it('should have an href with structure: /component/module/version/page.html', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[3]
    expect(result.href).to.equal('/versioned/another/0.0.1/index.html')
  })
})

describe('Parsing of NON versioned docs', () => {
  it('should read the antora.yml file', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results).not.to.be.null
  })

  it('should return 4 items', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results.length).to.equal(4)
  })

  it('should return meaningful items', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.excerpt).not.to.be.undefined
    expect(result.href).not.to.be.undefined
    expect(result.name).not.to.be.undefined
    expect(result.text).not.to.be.undefined
    expect(result.version).to.equal('')
  })

  it('should have an href with structure: /component/page.html', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[1]
    expect(result.href).to.equal('/non_versioned/index.html')
  })
})

describe('Parsing of subfolders', () => {
  it('should parse files in subfolders', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.href).to.equal('/non_versioned/subfolder/file_in_subfolder.html')
  })
})

describe('Support for components and modules', () => {
  it('should support ROOT components', () => {
    const startPath = path.join(__dirname, 'antora', 'root_component_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.href).to.equal('/index.html')
  })

  it('should support ROOT modules', () => {
    const startPath = path.join(__dirname, 'antora', 'multi_module_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.href).to.equal('/multi/2.5.7/index.html')
  })

  it('should support components with many modules', () => {
    const startPath = path.join(__dirname, 'antora', 'multi_module_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[3]
    expect(result.href).to.equal('/multi/another/2.5.7/index.html')
  })
})

describe('Support for Antora attributes', () => {
  it('should replace global attributes', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[1]
    expect(result.name).to.equal('SOME GLOBAL VALUE HERE VSHN Knowledge Base Home')
    expect(result.text).to.contain('This is the entry page of SOME GLOBAL VALUE HERE the Customer Knowledge Base.')
  })
})
