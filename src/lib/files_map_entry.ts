/**
 * Represents an actual file referenced by a search result.
 */
export interface FilesMapEntry {
  name: string,
  href: string,
  excerpt: string,
  version: string
}

/**
 * Represents a map of filenames to FilesMapEntry objects.
 */
export type FileList = { [href: string]: FilesMapEntry }
