import yaml from 'js-yaml'
import jsdom from 'jsdom'
import fs from 'fs'
import path from 'path'
import { ParsedFileEntry } from './parsed_file_entry'

const asciidoctor = require('asciidoctor')()
const { JSDOM } = jsdom

/**
 * Returns the main title of the Asciidoc document passed as parameter.
 * This is usually the first paragraph, with a `=` prefix.
 * @param asciidoc An asciidoc document
 */
function extractTitle(asciidoc: any): string {
	return asciidoc.getDocumentTitle({ partition: false })
}

/**
 * Builds the URL to a particular HTML file, following Antora's standards.
 * @param componentName The name of the Antora component
 * @param version The version of the Antora component
 * @param filename The filename of the AsciiDoc document
 */
function buildHref(componentName: string, version: string, filename: string): string {
	return path.join('/', componentName, version, filename.replace('adoc', 'html'))
}

/**
 * Extracts the first 20 words of the string passed as parameter.
 * It strips all whitespace and returns the first 20 words.
 * @param text The text to analyze
 */
function extractExcerpt(text: string): string {
	const sanitized: string = text.replace(/\n\n/g, ' ').replace(/\n/g, '')
	const tokens: string[] = sanitized.split(' ').slice(0, 20)
	const excerpt: string = tokens.join(' ') + '…'
	return excerpt
}

/**
 * Converts the Asciidoc document into HTML and later loads it into a DOM object,
 * so that only its visible text can be extracted later.
 * @param asciidoc An AsciiDoc document
 */
function extractText(asciidoc: any): string {
	const htmlString: string = asciidoc.convert()
	const htmlDoc: jsdom.JSDOM = new JSDOM(htmlString)
	const body: HTMLElement = htmlDoc.window.document.body
	const textContent: string = body.textContent || ''
	return textContent
}

/**
 * Parses Antora source AsciiDoc files in a particular location.
 * @param startPath The path to the documentation folder, where there must be an `antora.yml` file.
 */
export function parseFiles(startPath: string): ParsedFileEntry[] {
	// Start by loading the Antora module definition file
	// and gather some important contextual information
	const antoraPath: string = path.resolve(path.join(startPath, 'antora.yml'))

	if (!fs.existsSync(antoraPath)) {
		throw `The path "${antoraPath}" is invalid. Exiting.`
	}

	// Load YAML and read component information
	const antora: any = yaml.safeLoad(fs.readFileSync(antoraPath, 'utf8'))
	const componentName: string = antora.name
	let version: string = antora.version
	const startPage: string = antora.start_page
	const startPageComponents: string[] = startPage.split(':')
	const moduleName: string = startPageComponents[0]

	// For versionless components, Antora uses the 'master' value
	if (version == 'master') {
		version = ''
	}

	// The pages of an Antora module are always inside a particular path
	const pagesPath: string = path.resolve(path.join(startPath, 'modules', moduleName, 'pages'))
	const files: string[] = fs.readdirSync(pagesPath)

	// Read the contents of each file and build the index array
	const lunrIndex: ParsedFileEntry[] = []
	files.forEach(function (filename: string, index: number) {
		const filePath: string = path.join(pagesPath, filename)
		const asciidoc: any = asciidoctor.loadFile(filePath)
		const href: string = buildHref(componentName, version, filename)
		const name: string = extractTitle(asciidoc)
		const text: string = extractText(asciidoc)
		const excerpt: string = extractExcerpt(text)
		const obj: ParsedFileEntry = {
			name: name,
			text: text,
			href: href,
			excerpt: excerpt,
		}
		lunrIndex.push(obj)
	})
	return lunrIndex
}
