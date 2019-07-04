/*
This script processes the contents of the local Antora folder
and builds both a Lunr.js optimized index, or a list of files
to use when building the search results for the user.

The processing of the index starts in the antora.yml file.

Given that Antora projects always have the same structure, we
can assume several characteristics from the very beginning.
*/
import { ParsedFileEntry } from './lib/parsed_file_entry'
import { FileList } from './lib/files_map_entry'
import { parseFiles } from './lib/parser'
import { buildLunrIndex } from './lib/builder'
import { buildFileList } from './lib/builder'

import * as path from 'path'

// Parse command line options
const program = require('commander')
program.version('1.0')
  .option('-o, --output <kind>', 'valid values: "index" (default) or "files"', 'index')
  .option('-p, --path <path>', '(mandatory) path to the Antora project to parse')
  .parse(process.argv)

// Entry point
try {
  // Get the base path for the script
  if (program.path === undefined) {
    console.error('indexer.ts: This script requires a path as input. Exiting.')
    process.exit(1)
  }

  // Path where the project with documentation is located
  const antoraPath = path.join(__dirname, program.path)

  // Start parsing
  const documents: ParsedFileEntry[] = parseFiles(antoraPath)

  // Build final products
  let response : FileList | lunr.Index
  switch (program.output) {
    case 'files':
        response = buildFileList(documents)
        break

    case 'index':
        response = buildLunrIndex(documents)
        break

    default:
      throw `Invalid output option: "${program.output}" (valid options are "files" and "index")`
      break
  }

  // Output to stdout
  process.stdout.write(JSON.stringify(response))
}
catch (e) {
  console.error(`indexer.ts: Terminated with error: ${e}`)
  process.exit(1)
}
