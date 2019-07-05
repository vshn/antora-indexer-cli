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
import { buildLunrIndex, buildFileList } from './lib/builder'

import path from 'path'
import fs from 'fs'
import program from 'commander';

// Parse command line options
program.version('1.0')
  .option('-w, --write <kind>', 'valid values: "index" or "files"', 'index')
  .option('-a, --antora <path>', '(mandatory) path of the Antora project to parse')
  .option('-o, --output <path>', '(optional) write to the specified path instead of stdout')
  .parse(process.argv)

// Entry point
try {
  // Get the base path for the script
  if (program.antora === undefined) {
    console.error('indexer.ts: This script requires a path as input. Exiting.')
    process.exit(1)
  }

  // Path where the project with documentation is located
  const antoraPath = path.join(__dirname, '..', program.antora)

  // Start parsing
  const documents: ParsedFileEntry[] = parseFiles(antoraPath)

  // Build final products
  let response : FileList | lunr.Index
  switch (program.write) {
    case 'files':
        response = buildFileList(documents)
        break

    case 'index':
        response = buildLunrIndex(documents)
        break

    default:
      throw `Invalid output option: "${program.write}" (valid options are "files" and "index")`
  }

  if (program.output) {
    fs.writeFileSync(program.output, JSON.stringify(response))
  } else {
    // Output to stdout
    process.stdout.write(JSON.stringify(response))
  }
}
catch (e) {
  console.error(`indexer.ts: Terminated with error: ${e}`)
  process.exit(1)
}
