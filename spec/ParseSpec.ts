import { expect } from 'chai'
import path from 'path'
import { parseAntoraFile } from '../src/lib/parser'
import { ParsedFileEntry } from '../src/lib/parsed_file_entry'

describe('Parsing of versioned docs', () => {
  it('should read the antora.yml file', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results).not.to.be.null
  })

  it('should return 3 items', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results.length).to.equal(3)
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

  it('should have an href with structure: /component/version/page.html', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.href).to.equal('/kb/0.0.1/index.html')
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
    expect(result.href).to.equal('/nv/index.html')
  })
})

describe('Parsing of subfolders', () => {
  it('should parse files in subfolders', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.href).to.equal('/nv/subfolder/file_in_subfolder.html')
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
