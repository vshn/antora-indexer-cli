import yaml from 'js-yaml'
import jsdom from 'jsdom'
import fs from 'fs'
import path from 'path'
import { ParsedFileEntry } from './parsed_file_entry'
import { Antora, AntoraSource, AntoraPlaybook } from './antora_definitions'

import Processor, { Asciidoctor } from 'asciidoctor'
const processor = Processor()

const { JSDOM } = jsdom

// Configure git
import * as git from 'isomorphic-git'
import http from "isomorphic-git/http/node"

/**
 * Removes HTML comments from the string passed as parameter.
 * Source:
 * https://stackoverflow.com/a/5654032
 * @param source The string to remove comments from
 */
function removeHtmlComments(source: string): string {
	if (!source) return ''
	const regexp = new RegExp(
		'<!--[\\s\\S]*?(?:-->)?'
		+ '<!---+>?'  // A comment with no body
		+ '|<!(?![dD][oO][cC][tT][yY][pP][eE]|\\[CDATA\\[)[^>]*>?'
		+ '|<[?][^>]*>?',  // A pseudo-comment
		'g')
	return source.replace(regexp, '')
}

/**
 * Returns the main title of the Asciidoc document passed as parameter.
 * This is usually the first paragraph, with a `=` prefix.
 * @param asciidoc An asciidoc document
 */
function extractTitle(asciidoc: Asciidoctor.Document): string {
	const title = asciidoc.getDocumentTitle({ partition: false }) as string
	return removeHtmlComments(title).trim()
}

/**
 * Builds the URL to a particular HTML file, following Antora's standards.
 * @param componentName The name of the Antora component (not used if "ROOT")
 * @param version The version of the Antora component
 * @param filename The filename of the AsciiDoc document
 * @param moduleName The module name (not used if "ROOT")
 */
function buildHref(componentName: string, moduleName: string, version: string, filename: string): string {
	if (componentName === 'ROOT') {
		return path.join('/', version, filename.replace('adoc', 'html'))
	}
	if (moduleName === 'ROOT') {
		return path.join('/', componentName, version, filename.replace('adoc', 'html'))
	}
	return path.join('/', componentName, moduleName, version, filename.replace('adoc', 'html'))
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
	return excerpt.trim()
}

/**
 * Converts the Asciidoc document into HTML and later loads it into a DOM object,
 * so that only its visible text can be extracted later.
 * @param asciidoc An AsciiDoc document
 */
function extractText(asciidoc: Asciidoctor.Document): string {
	const htmlString: string = asciidoc.convert()
	const htmlDoc: jsdom.JSDOM = new JSDOM(htmlString)
	const body: HTMLElement = htmlDoc.window.document.body
	const textContent: string = body.textContent || ''
	return textContent.replace('partial$meta-info-table.adoc', '')
}

/**
 * Asynchronous-friendly for-each loop.
 *
 * Adapted from
 * https://codeburst.io/javascript-async-await-with-foreach-b6ba62bbf404
 * @param array Array of items being iterated upon
 * @param callback The function to call for each item
 */
async function asyncForEach<T>(array: T[], callback: (arg0: T, arg1: number, arg2: T[]) => Promise<void>) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array)
	}
}

/**
 * Returns the names of subdirectories in the specified source location.
 * @param source An array of strings with the name of subdirectory names
 */
function getDirectories(source: fs.PathLike): string[] {
	return fs.readdirSync(source, { withFileTypes: true })
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)
}

/**
 * Returns the list of Asciidoc files, including those in subfolders.
 * @param pagesPath Path to the `/modules/$MODULE/pages` folder with documentation.
 * @param pathToAppend The path to append to the file, relative to `pagesPath` above.
 * @param result An array of strings filled recursively by each call to this function.
 */
function getAllAdocFilesRecursively(pagesPath: string, pathToAppend: string, result: string[]) {
	const dirs = getDirectories(pagesPath)
	dirs.forEach(dir => {
		const subPagesPath = path.join(pagesPath, dir)
		getAllAdocFilesRecursively(subPagesPath, path.join(pathToAppend, dir), result)
	})
	const currentResults = fs.readdirSync(pagesPath).filter(value => value.endsWith('.adoc')).map(value => path.join(pathToAppend, value))
	result.push(...currentResults)
}

/**
 * Parses Antora source AsciiDoc files in a particular location.
 * @param startPath The path to the documentation folder, where there must be an `antora.yml` file.
 */
export function parseAntoraFile(startPath: string): ParsedFileEntry[] {
	// Start by loading the Antora module definition file
	// and gather some important contextual information
	const antoraPath: string = path.resolve(path.join(startPath, 'antora.yml'))

	if (!fs.existsSync(antoraPath)) {
		throw `The path "${antoraPath}" does not contain a file named 'antora.yml'. Exiting.`
	}

	// Load YAML and read component information
	const antora = yaml.load(fs.readFileSync(antoraPath, 'utf8')) as Antora
	const componentName: string = antora.name
	let version: string = antora.version

	// For versionless components, Antora uses the 'master' value (in versions 1 and 2)
	// and '~' (in version 3). The tilde evaluates in YAML to 'null'.
	if (version === 'master' || version === undefined || version === null) {
		version = ''
	}

	// Get global attributes defined, if any
	const attributes = antora.asciidoc?.attributes

	// Get all module names
	const moduleNames: string[] = getDirectories(path.resolve(path.join(startPath, 'modules')))
	const lunrIndex: ParsedFileEntry[] = []

	moduleNames.forEach(moduleName => {
		// The pages of an Antora module are always inside a particular path
		const pagesPath: string = path.resolve(path.join(startPath, 'modules', moduleName, 'pages'))

		// Only parse files that have the `*.adoc` extension
		const files: string[] = []
		getAllAdocFilesRecursively(pagesPath, '', files)

		// Read the contents of each file and build the index array
		files.forEach(function (filename: string) {
			const filePath: string = path.join(pagesPath, filename)
			const asciidoc: Asciidoctor.Document = processor.loadFile(filePath, { 'attributes': attributes })
			const href: string = buildHref(componentName, moduleName, version, filename)
			const name: string = extractTitle(asciidoc)
			const text: string = extractText(asciidoc)
			const excerpt: string = extractExcerpt(text)
			const obj: ParsedFileEntry = {
				name: name,
				text: text,
				href: href,
				excerpt: excerpt,
				version: version
			}
			lunrIndex.push(obj)
		})
	})
	return lunrIndex
}

/**
 * Parses an Antora playbook.yml file, iterating through all the
 * content sources, and indexes the contents of each.
 * @param startPath The folder where the playbook.yml file is located
 */
export async function parsePlaybookFile(startPath: string): Promise<ParsedFileEntry[]> {
	const playbookPath: string = path.resolve(path.join(startPath, 'playbook.yml'))

	if (!fs.existsSync(playbookPath)) {
		throw `The path "${playbookPath}" does not contain a file named 'playbook.yml'. Exiting.`
	}

	// Output variable
	const lunrIndex: ParsedFileEntry[] = []

	// Load YAML and read playbook information
	const playbook = yaml.load(fs.readFileSync(playbookPath, 'utf8')) as AntoraPlaybook
	const sources: AntoraSource[] = playbook.content.sources

	// For each entry in the playbook, git clone the repo and index it
	await asyncForEach(sources, async function (source: AntoraSource) {
		const url = source.url
		let yamlBranches: string[]
		// source.branches can contain a single string, or an array thereof
		if (typeof source.branches === 'string') {
			yamlBranches = [source.branches]
		} else {
			yamlBranches = source.branches
		}

		const clonesPath = path.join('.', '.repos', `d${Math.floor(Math.random() * 1000001)}`)
		fs.mkdirSync(clonesPath, { recursive: true })

		// Clone the repo
		if (url === '.') {
			// If the URL is a dot, it means that the current folder contains
			// the required items to be indexed; no need to clone, just parse
			const initialPath = path.resolve(startPath)
			const antoraPath = path.join(initialPath, source.start_path)
			const result = parseAntoraFile(antoraPath)

			// Append the results
			lunrIndex.push(...result)
		} else {
			// This is a remote URL, clone and index
			await git.clone({
				fs,
				http,
				dir: clonesPath,
				url: url,
				depth: 1,
			})

			// If any of the branches contains a "*" wildcard, get the actual list
			// of branches to work with, as isomorphic-git cannot deal with a wildcard
			// (this is actually used, for example in the k8up repository)
			const branchesToIndex : string[] = []
			const remoteBranches = await git.listBranches({ fs, dir: clonesPath, remote: 'origin' })
			yamlBranches.forEach(branch => {
				if (branch.includes('*')) {
					remoteBranches.forEach(remoteBranch => {
						if (remoteBranch.match(branch)) {
							branchesToIndex.push(remoteBranch)
						}
					})
				} else {
					branchesToIndex.push(branch)
				}
			})

			// For each branch, checkout and index
			await asyncForEach(branchesToIndex, async function (branch: string) {
				await git.checkout({
					fs,
					dir: clonesPath,
					ref: branch
				})
				// Index that particular project with the existing function
				const antoraPath = path.join(clonesPath, source.start_path)
				const result = parseAntoraFile(antoraPath)

				// Append the results
				lunrIndex.push(...result)
			})
		}
	})
	return lunrIndex
}
