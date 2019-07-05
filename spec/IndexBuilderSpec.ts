import "jasmine";
import lunr from 'lunr'
import { buildLunrIndex } from '../src/lib/builder'
import { ParsedFileEntry } from '../src/lib/parsed_file_entry'

const input : ParsedFileEntry[] = [{
  'name': 'Document 1',
  'text': 'Elit Lorem nulla enim Lorem aliqua in sunt cillum sit ut culpa. Dolore ex culpa ad fugiat in fugiat nisi ea fugiat ut. Nulla labore officia esse enim commodo duis adipisicing.',
  'href': '/path/to/file.html',
  'excerpt': 'Elit Lorem nulla enim Lorem aliqua in sunt cillum…'
}, {
  'name': 'Document 2',
  'text': 'Adipisicing excepteur quis aute est sit ad quis. Pariatur excepteur cillum minim incididunt. Ut non exercitation Lorem do tempor esse.',
  'href': '/path/to/file.html',
  'excerpt': 'Adipisicing excepteur quis aute est sit…'
}]

describe('Index builder', () => {
  it('should create an index', () => {
    const index : lunr.Index = buildLunrIndex(input)
    expect(index).not.toBeNull()
  })
})
