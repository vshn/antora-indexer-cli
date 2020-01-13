import 'jasmine'
import path from 'path'
import { parseAntoraFile } from '../src/lib/parser'
import { ParsedFileEntry } from '../src/lib/parsed_file_entry'

describe('Parser of versioned docs', () => {
  it('should read the antora.yml file', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results).not.toBeNull()
  })

  it('should return 3 items', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results.length).toBe(3)
  })

  it('should return meaningful items', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.excerpt).toBeDefined()
    expect(result.href).toBeDefined()
    expect(result.name).toBeDefined()
    expect(result.text).toBeDefined()
  })

  it('should have an href with structure: /component/version/page.html', () => {
    const startPath = path.join(__dirname, 'antora', 'versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.href).toEqual('/kb/0.0.1/index.html')
  })
})

describe('Parser of NON versioned docs', () => {
  it('should read the antora.yml file', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results).not.toBeNull()
  })

  it('should return 3 items', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    expect(results.length).toBe(3)
  })

  it('should return meaningful items', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.excerpt).toBeDefined()
    expect(result.href).toBeDefined()
    expect(result.name).toBeDefined()
    expect(result.text).toBeDefined()
  })

  it('should have an href with structure: /component/page.html', () => {
    const startPath = path.join(__dirname, 'antora', 'non_versioned_docs')
    const results: ParsedFileEntry[] = parseAntoraFile(startPath)
    const result = results[0]
    expect(result.href).toEqual('/nv/index.html')
  })
})
