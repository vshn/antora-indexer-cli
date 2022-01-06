export type AntoraSource = {
  url: string
  branches: string | string[]
  start_path: string
}

export type AntoraAttributes = {
  attributes: { [key: string]: string }
}

export type Antora = {
  name: string
  version: string
  asciidoc?: AntoraAttributes
}

export type AntoraPlaybook = {
  content: {
    sources: AntoraSource[]
  }
}
