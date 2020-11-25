# [EditorConfig][] for [Visual Studio Code][]

[![GitHub Actions][actions-img]][actions] [![Gitter][chat-img]][chat]

[actions-img]:
  https://img.shields.io/endpoint.png?url=https%3A%2F%2Factions-badge.atrox.dev%2Feditorconfig%2Feditorconfig-vscode%2Fbadge&style=flat-square
[actions]: https://github.com/editorconfig/editorconfig-vscode/actions
[chat-img]:
  https://img.shields.io/badge/Gitter-Join_the_EditorConfig_VSCode_chat-brightgreen.png?style=flat-square
[chat]: https://gitter.im/editorconfig/editorconfig-vscode

This plugin [attempts](#known-issues) to override user/workspace settings with
settings found in `.editorconfig` files. No additional or vscode-specific files
are required. As with any EditorConfig plugin, if `root=true` is not specified,
EditorConfig [will continue to look](https://editorconfig.org/#file-location)
for an `.editorconfig` file outside of the project.

### This repository is specific to the [EditorConfig Extension for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig). Internally, it uses the [`editorconfig` npm package](https://www.npmjs.com/package/editorconfig), which is one of a few [EditorConfig](https://editorconfig.org) cores available.

See also:

- [Visual Studio Code](https://code.visualstudio.com/)
- [EditorConfig Site](https://editorconfig.org)
- [EditorConfig Issue Tracker](https://github.com/editorconfig/editorconfig/issues)
- [EditorConfig Wiki](https://github.com/editorconfig/editorconfig/wiki)

Feel free to submit any issues you may have via the
[issue tracker](https://github.com/editorconfig/editorconfig-vscode/issues).

## Installation

When identifying an extension, provide the full name of the form
`publisher.extension`. For this extension, that's `editorconfig.editorconfig`.

See
[Extension Marketplace](https://code.visualstudio.com/docs/editor/extension-gallery)
for more information on the multiple ways of installing VSCode extensions.

## Supported Properties

- `indent_style`
- `indent_size`
- `tab_width`
- `end_of_line` (on save)
- `insert_final_newline` (on save)
- `trim_trailing_whitespace` (on save)

## On the backlog

- `charset`

## How it works

This extension is activated whenever you open a new text editor, switch tabs
into an existing one or focus into the editor you already have open. When
activated, it uses [`editorconfig`](https://www.npmjs.com/package/editorconfig)
to resolve the configuration for that particular file and applies any relevant
editor settings.

_Note: some settings can only be applied on file save, as indicated above._

A new `.editorconfig` file can be created via the Explorer sidebar's context
menu by right-clicking in the folder where you'd like it to be and selecting
`Generate .editorconfig`.

## Known Issues

- [`trim_trailing_whitespace = false` is not applied when user/workspace setting of `files.trimTrailingWhitespace` is set to `true`.](https://github.com/editorconfig/editorconfig-vscode/issues/153)

[visual studio code]: https://code.visualstudio.com/
[editorconfig]: https://editorconfig.org/
