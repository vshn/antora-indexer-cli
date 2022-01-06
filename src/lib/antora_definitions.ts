/**
 * Represents a list of content sources in an Antora playbook.yml file.
 */
export type AntoraSource = {
  url: string
  branches: string | string[]
  start_path: string
}

/**
 * Represents a list of attributes in an antora.yml file.
 */
export type AntoraAttributes = {
  attributes: { [key: string]: string }
}

/**
 * Represents the structure of an antora.yml file.
 */
export type Antora = {
  name: string
  version: string
  asciidoc?: AntoraAttributes
}

/**
 * Represents the structure of an Antora playbook.yml file.
 */
export type AntoraPlaybook = {
  content: {
    sources: AntoraSource[]
  }
}
