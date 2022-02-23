# evernote-to-markdown

simple cli tool for downloading & converting evernote to markdown.

## Environments

`node v12.12.0`

## Usage

### Run

Download all notes included in the specified notebook:

```sh
$ ./bin/evernote-to-markdown.js -b {notebook_name} -n {note_num} -o {offset} -d {dist}
```

At the first running, you need to input developer token for Evernote.

#### File Structure

Converted markdown files are saved to `{dist}/{created_year}/{created_month}/{created_date}/]`. Attached resources (images) are saved to `imgs/`.

#### YAML-Front Matter (YFM)

YFM is automatically attached to each .md file like:

```markdown
---
title: { note_title }
category: { notebook_name }
created: { note_created }
updated: { note_updated }
guid: { note_guid }
---
```

### options

- `-b, --notebook [string]`: **required**. name of notebook to download
- `-n, --num [number]`: the number of notes to donwload. If not set, all notes included in specified notebook are donwloaded.
- `-o, --offset [number]`: offset to begin download. default value is 0 (from the latest note).
- `-d, --dist [string]`: where to save markdown files.
