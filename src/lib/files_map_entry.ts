/**
 * Represents an actual file referenced by a search result.
 */
export interface FilesMapEntry {
  name: string,
  href: string,
  excerpt: string,
  version: string
}

export type FileList = { [href: string]: FilesMapEntry }
