import "jasmine";
import { buildFileList } from '../src/lib/builder'
import { ParsedFileEntry } from '../src/lib/parsed_file_entry'
import { FileList } from '../src/lib/files_map_entry'

const input : ParsedFileEntry[] = [{
  'name': 'Document 1',
  'text': 'Elit Lorem nulla enim Lorem aliqua in sunt cillum sit ut culpa. Dolore ex culpa ad fugiat in fugiat nisi ea fugiat ut. Nulla labore officia esse enim commodo duis adipisicing.',
  'href': '/path/to/file1.html',
  'excerpt': 'Elit Lorem nulla enim Lorem aliqua in sunt cillum…'
}, {
  'name': 'Document 2',
  'text': 'Adipisicing excepteur quis aute est sit ad quis. Pariatur excepteur cillum minim incididunt. Ut non exercitation Lorem do tempor esse.',
  'href': '/path/to/file2.html',
  'excerpt': 'Adipisicing excepteur quis aute est sit…'
}]

describe('Index builder', () => {
  it('should create an index', () => {
    const list : FileList = buildFileList(input)
    expect(list).not.toBeNull()
  })

  it('should have the same number of items as the input', () => {
    const list : FileList = buildFileList(input)
    expect(Object.keys(list).length).toEqual(input.length)
  })

  it('should have keys with the same value as the "href" property', () => {
    const list : FileList = buildFileList(input)
    for (const entry in list) {
      expect(entry).toEqual(list[entry].href)
    }
  })
})
