/**
 * Represents a file that has been parsed and
 * is ready to be fed to Lunr.js for indexing
 */
export interface ParsedFileEntry {
	name: string,
	text: string,
	href: string,
	excerpt: string,
	version: string
}
