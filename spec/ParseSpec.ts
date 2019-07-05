import 'jasmine'
import path from 'path'
import { parseFiles } from '../src/lib/parser'
import { ParsedFileEntry } from '../src/lib/parsed_file_entry'

describe('Parser', () => {
  it('should read the antora.yml file', () => {
    const startPath = path.join(__dirname, 'antora', 'docs')
    const results: ParsedFileEntry[] = parseFiles(startPath)
    expect(results).not.toBeNull()
  })

  it('should return 3 items', () => {
    const startPath = path.join(__dirname, 'antora', 'docs')
    const results: ParsedFileEntry[] = parseFiles(startPath)
    expect(results.length).toBe(3)
  })

  it('should return meaningful items', () => {
    const startPath = path.join(__dirname, 'antora', 'docs')
    const results: ParsedFileEntry[] = parseFiles(startPath)
    const result = results[0]
    expect(result.excerpt).toBeDefined()
    expect(result.href).toBeDefined()
    expect(result.name).toBeDefined()
    expect(result.text).toBeDefined()
  })
})
