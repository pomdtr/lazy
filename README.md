# Lazy - Never Build a TUI Again

Lazy is an helper tool allowing you to build an interactive UI for any command line app using a simple YAML config file.

Lazy integrate with multiple client and it is easy to write a new one one. Currently two are available:

- [fzf](./clients/fzf/README.md)
- [raycast](./client/raycast/README.md)

## Installation

[Node](https://nodejs.org/en/download/) must be installed on you device.
A NPM package will be created once the API will be stable.

```txt
git clone https://github.com/pomdtr/lazy.git
cd lazy
npm run build
npm install -g
```

## Writing a config file

Lazy parse all config files stored in `~/.config/lazy/scripts/` directory.

### Simple Example: file browser

```yaml
packageName: file-browser

rootActions:
  - type: push
    title: Browse Lazy Config Directory
    target: list-files
    params:
      directory: $HOME/.config/lazy/
  - type: push
    title: Browse Home Directory
    target: list-files
    params:
      directory: $HOME/
  - type: push
    title: Browse Root Directory
    target: list-files
    params:
      directory: /

steps:
  list-files:
    generator: ls -p1 '{{ params.directory }}'
    items:
      preview: ls -l '{{params.directory}}{{ row.text }}'
      actions:
        - condition: "{{ row.text.endsWith('/') }}"
          title: Switch Directory
          type: push
          target: list-files
          params:
            directory: "{{ params.directory }}{{ row.text }}"

        - title: Open
          type: run
          command: open "{{ params.directory }}{{ row.text }}"
```


https://user-images.githubusercontent.com/17577332/146687351-1189d136-d52b-4462-a706-b54ad0c2ffde.mp4


## Advanced Example: Github Workflow

```yaml
packageName: github

preferences:
  user: pomdtr

requirements:
  - gh
  - bkt
  - jq

rootActions:
  - title: 🔎 Search Dailymotion Repositories
    type: push
    target: "repo-filter"
    params:
      filter: org:dailymotion
      duration: 7d

  - title: 🔎 Search My Repositories
    type: push
    target: "repo-filter"
    params:
      filter: user:pomdtr

  - title: 🅿️ My Work Pull Requests
    type: push
    target: "pr-search"
    params:
      filter: "author:{{ preferences.user }} org:dailymotion state:open"

steps:
  repo-filter:
    generator: |
      bkt --ttl "7 days" -- gh api -X GET search/repositories \
        --paginate --field "q={{params.filter}}" --jq '.items[]'
    items:
      title: "{{ row.json.name }}"
      subtitle: "{{ row.json.description or '' }}"
      preview: |
        cat << EOF
        {{ row.json | dump(2) }}
        EOF
      actions:
        - title: Open in Browser
          type: open
          target: "{{ row.json.html_url }}"
        - title: Open in Github.dev
          type: open
          target: '{{ row.json.html_url.replace("github.com", "github.dev") }}'
        - title: Open in VSCode
          type: open
          target: 'vscode://github.remotehub/open?url={{ row.json.html_url | urlencode }}'
        - title: List Pull Requests
          type: push
          target: pr-search
          params:
            filter: "repo:{{ row.json.full_name }} state:open"
        - title: Copy Url
          type: copy
          content: "{{ row.json.html_url }}"

  pr-search:
    generator:
      gh api -X GET search/issues \
        -F q="{{ params.filter }} type:pr" | jq -c .items[]
    items:
      title: "{{ row.json.title }}"
      subtitle: "{{ row.json.state }} - {{ row.json.repository_url.split('/') | last }}"
      actions:
        - type: run
          title: Open in browser
          command: open {{row.json.html_url}}
```

https://user-images.githubusercontent.com/17577332/146687417-29301610-3477-457b-ad91-c023f8de657d.mp4

