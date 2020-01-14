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
import { parseAntoraFile, parsePlaybookFile } from './lib/parser'
import { buildLunrIndex, buildFileList } from './lib/builder'

import path from 'path'
import fs from 'fs'
import program from 'commander'

// Parse command line options
program.version('1.0')
  .option('-p, --playbook <path>', '(mandatory) path of the Antora project to parse')
  .option('-a, --antora <path>', '(mandatory) path of the Antora project to parse')
  .option('-w, --write <kind>', 'valid values: "index" or "files"', 'index')
  .option('-o, --output <path>', '(optional) write to the specified path instead of stdout')
  .parse(process.argv)

// Entry point
async function main() {
  // Get the base path for the script
  if (!program.antora && !program.playbook) {
    console.error('This script requires the path of an Antora project or playbook as input (--antora or --playbook parameters)')
    program.outputHelp()
    process.exit(1)
  }

  // Start parsing
  let documents: ParsedFileEntry[] = []

  if (program.playbook) {
    // Path where the project with documentation is located
    const playbookPath = path.join(program.playbook)
    documents = await parsePlaybookFile(playbookPath)
  }

  if (program.antora) {
    // Path where the project with documentation is located
    const antoraPath = path.join(program.antora)
    documents = parseAntoraFile(antoraPath)
  }

  // Build final products
  let response: FileList | lunr.Index
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

try {
  main()
}
catch (e) {
  console.error(`indexer.ts: Terminated with error: ${e}`)
  console.error(e.stack)
  process.exit(1)
}
