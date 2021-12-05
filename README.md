# Lazy - Never Build a TUI Again

Lazy is an helper tool allowing you to build an interactive UI for any command line app using a simple YAML config file.

Lazy integrate with multiple client and it is easy to write a new one one. Currently two are available:

- `FZF`:
- `Raycast` (Soon)

## Installation

[Node](https://nodejs.org/en/download/) must be installed on you device.
A NPM package will be created once the API will be stable.

```
git clone
cd
npm install -g
```

## Writing a config file

### Simple Example: file browser

```yaml
packageName: file-browser # unique identifier for your packages

steps:
  list-files:
    generator: ls -p1 {{ params.directory }} # Command generating the rows.
    type: filter # generator lines will be filtered using your query
    items:
      actions: #
        - condition: "{{ line.text.endsWith('/') }}" # This action will only be available if the condition is set to true
          title: Switch Directory
          type: ref # This action will redirect to another step
          target: list-files # The target can be recursive
          params:
            directory: "{{ params.directory }}{{ line.text }}"

        - title: Open
          type: run # This target will trigger a command
          command: open "{{ params.directory }}{{ line.text }}"

roots: # Define root actions, accessible from the root views of client integration
  - type: ref
    title: Browse Home Directory
    target: list-files
    params:
      directory: $HOME/
  - type: ref
    title: Browse Root Directory
    target: list-files
    params:
      directory: /
```

Demo:

## Advanced Example: Google Search

```yaml
packageName: googler

requirements: # List cli apps required for the workflow
  - googler
  - jq
  - curl

roots:
  - type: ref
    title: 👀 Search Google
    target: complete-query

steps:
  complete-query:
    params:
      default: Please input a query
    generator: |
      if [ -z "{{ query }}" ]; then
        echo "{{ params.default }}"
      else
        { echo {{ query }} & curl 'https://www.google.com/complete/search?client=chrome&q={{ query | urlencode }}' | jq -r .[1][]; }
      fi
    type: query # The results will be refreshed each time the input change
    items:
      actions:
        - type: run
          title: Open URL
          condition: "{{ line.text.startsWith('https') }}"
          command: open '{{ line.text }}'
        - type: ref
          title: List Results
          target: list-results # This action redirect to the list-result steps
          condition: "{{ line.text != params.default }}"
          params:
            search: "{{ line.text }}"
        - type: run
          title: Search in Google
          condition: "{{ line.text != params.default }}"
          command: open 'https://www.google.com/search?q={{ line.text | urlencode }}'

  list-results:
    type: filter
    generator: googler --json {{ params.search | dump}} | jq -c .[]
    items:
      title: "{{ line.json.title }}" # Here the row are in json format, but we can show a single field instead
      subtitle: "{{ line.json.url }}"
      preview: printf {{line.json.abstract | dump }} # The preview will be shown in a split pane if the client allow it
      actions:
        - title: "Open in browser"
          type: run
          command: open '{{ line.json.url }}'
        - title: "Copy URL"
          type: run
          command: echo '{{ line.json.url }}' | pbcopy
```

## Specifications
