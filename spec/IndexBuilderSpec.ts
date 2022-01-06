import { expect } from 'chai'
import lunr from 'lunr'
import { buildLunrIndex } from '../src/lib/builder'
import { ParsedFileEntry } from '../src/lib/parsed_file_entry'

const input : ParsedFileEntry[] = [{
  'name': 'Document 1',
  'text': 'Elit Lorem nulla enim Lorem aliqua in sunt cillum sit ut culpa. Dolore ex culpa ad fugiat in fugiat nisi ea fugiat ut. Nulla labore officia esse enim commodo duis adipisicing.',
  'href': '/path/to/doc1.html',
  'excerpt': 'Elit Lorem nulla enim Lorem aliqua in sunt cillum…',
  'version': '1.0'
}, {
  'name': 'Document 2',
  'text': 'Adipisicing excepteur quis aute est sit ad quis. Pariatur excepteur cillum minim incididunt. Ut non exercitation Lorem do tempor esse.',
  'href': '/path/to/doc2.html',
  'excerpt': 'Adipisicing excepteur quis aute est sit…',
  'version': '1.2'
}]

describe('Index builder', () => {
  it('should create a working index', () => {
    const index : lunr.Index = buildLunrIndex(input)
    expect(index).not.to.be.null

    // Test search
    const results1 = index.search('excepteur')
    expect(results1.length).to.equal(1)
    const results2 = index.search('adipisicing')
    expect(results2.length).to.equal(2)
  })
})
