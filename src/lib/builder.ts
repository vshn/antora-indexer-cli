import lunr from 'lunr'
import { ParsedFileEntry } from './parsed_file_entry'
import { FilesMapEntry, FileList } from './files_map_entry'

/**
* Builds a list of files used to map Lunr.js results to actual file names.
* @param documents A list of parsed file entries
*/
export function buildFileList(documents: ParsedFileEntry[]) {
  const fileList: FileList = {}
  documents.forEach((doc: ParsedFileEntry, index: number) => {
      const entry: FilesMapEntry = {
          name: doc.name,
          href: doc.href,
          excerpt: doc.excerpt,
      }
      fileList[doc.href] = entry
  })
  return fileList
}

/**
 * Builds an index ready to be used by Lunr.js.
 * @param documents A list of parsed file entries
 */
export function buildLunrIndex(documents: ParsedFileEntry[]): lunr.Index {
  const index: lunr.Index = lunr(function () {
      this.ref('href')
      this.field('name')
      this.field('text')

      documents.forEach((doc: ParsedFileEntry) => {
          this.add(doc)
      }, this)
  })
  return index
}
