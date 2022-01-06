import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

import path from 'path'
import { parsePlaybookFile } from '../src/lib/parser'
import { ParsedFileEntry } from '../src/lib/parsed_file_entry'

describe('Parsing of playbooks', () => {
  it('throws if playbook.yml not found', async () => {
    const startPath = path.join(__dirname, 'antora', 'invalid')
    const promise = parsePlaybookFile(startPath)
    expect(promise).to.be.rejected
  })

  it('should read the playbook.yml file', async () => {
    const startPath = path.join(__dirname, 'antora', 'playbook_docs')
    const results: ParsedFileEntry[] = await parsePlaybookFile(startPath)
    expect(results).not.to.be.null
  })

  it('should return 4 items', async () => {
    const startPath = path.join(__dirname, 'antora', 'playbook_docs')
    const results: ParsedFileEntry[] = await parsePlaybookFile(startPath)
    expect(results.length).to.equal(4)
  })

  it('should return meaningful items', async () => {
    const startPath = path.join(__dirname, 'antora', 'playbook_docs')
    const results: ParsedFileEntry[] = await parsePlaybookFile(startPath)
    const result = results[0]
    expect(result.excerpt).not.to.be.undefined
    expect(result.href).not.to.be.undefined
    expect(result.name).not.to.be.undefined
    expect(result.text).not.to.be.undefined
    expect(result.version).to.equal('0.0.1')
  })

  it('should have an href with structure: /component/module/version/page.html', async () => {
    const startPath = path.join(__dirname, 'antora', 'playbook_docs')
    const results: ParsedFileEntry[] = await parsePlaybookFile(startPath)
    const result = results[3]
    expect(result.href).to.equal('/versioned/another/0.0.1/index.html')
  })
})
