## 0.16.4

- **Fix:** don't set EOL when no EOL config
  ([`#299`](https://github.com/editorconfig/editorconfig-vscode/issues/299))

## 0.16.3

- Improve installation instructions in README.

## 0.16.2

- Defer to VSCode's built-in EOL sequence normalization, when appropriate.

## 0.16.1

- **Fix:** default template path RegExp.

## 0.16.0

- **New:** expose configuration settings for template generation
  ([`#277`](https://github.com/editorconfig/editorconfig-vscode/issues/277)).

## 0.15.5

- **Fix:** add comments to top of generated `.editorconfig` file
  ([`#271`](https://github.com/editorconfig/editorconfig-vscode/issues/271)).

## 0.15.4

- **Fix:** related all files with extension `.editorconfig` as EditorConfig
  ([`#281`](https://github.com/editorconfig/editorconfig-vscode/issues/281)).

## 0.15.3

- **Fix:** end_of_line rule no longer destroys redo history
  ([`#288`](https://github.com/editorconfig/editorconfig-vscode/issues/288)).

## 0.15.2

- Update dependencies.
- Remove dependency on `lodash`, `lodash.get`, `cash-cp`.

## 0.15.1

- **Fix:** Fixed code completion for .editorconfig file
  ([`#270`](https://github.com/editorconfig/editorconfig-vscode/pull/270)).

## 0.15.0

- **New:** Added grammar for .editorconfig file.
  ([`#269`](https://github.com/editorconfig/editorconfig-vscode/pull/269)).

## 0.14.4

- **Fix:** EditorConfig modifies selection incorrectly when the extension host
  is busy
  ([`#236`](https://github.com/editorconfig/editorconfig-vscode/issues/236)).

## 0.14.3

- **Fix:** unhandled error when generating `.editorconfig`
  ([`#255`](https://github.com/editorconfig/editorconfig-vscode/pull/255)).

## 0.14.2

- **Fix:** "File not found" issue when generating `.editorconfig` file
  ([`#252`](https://github.com/editorconfig/editorconfig-vscode/issues/252)).

## 0.14.1

- **Fix:** Don't cache editor configuration, as it can change at any time.

## 0.13.0

- **New:** Provide APIs to
  [other extensions](https://code.visualstudio.com/api/references/vscode-api#extensions).

## 0.12.8

- **Fix:** Prevent document watcher from trying to load a config for an
  undefined text document.
- **Fix:** Generate config with a final newline if it's enabled.
- Add missing changelog for v0.12.7.

## 0.12.7

- **Fix:** Respond to external `.editorconfig` edits.

## 0.12.6

- Fix support for `unset` by not overriding built-in "detect indentation"
  functionality
  [`#201`](https://github.com/editorconfig/editorconfig-vscode/pull/201). Thanks
  [`@slartibardfast`](https://github.com/slartibardfast)!

## 0.12.5

- Update dependencies.

## 0.12.4

- Use HTTPS links to EditorConfig.org
  [`#197`](https://github.com/editorconfig/editorconfig-vscode/pull/197).

## 0.12.3

- Fix "Generate .editorconfig" to specify `indent_size` instead of (invalid)
  `tab_size`
  [`#195`](https://github.com/editorconfig/editorconfig-vscode/issues/195).

## 0.12.2

- Fix multi-root warning
  [`#192`](https://github.com/editorconfig/editorconfig-vscode/issues/192).

## 0.12.1

- Provide fallback for workspace root directory when creating config file
  [`#188`](https://github.com/editorconfig/editorconfig-vscode/pull/188).

## 0.12.0

- Support multi-root workspaces
  [`#174`](https://github.com/editorconfig/editorconfig-vscode/issues/174).

## 0.11.1

- Update EditorConfig dependency.

## 0.11.0

- Support `unset` value.

## 0.10.1

- Rollback
  [`#166`](https://github.com/editorconfig/editorconfig-vscode/pull/166) until
  we can ensure final newlines are not removed by default.

## 0.10.0

- Remove final newlines when `insert_final_newline = false`
  [`#166`](https://github.com/editorconfig/editorconfig-vscode/pull/166).

## 0.9.4

- Fix `document` of `undefined` error.

## 0.9.3

- Fix workspace issue on Linux
  [`#145`](https://github.com/editorconfig/editorconfig-vscode/issues/145).

## 0.9.2

- Improve/simplify output channel messaging.

## 0.9.1

- Fix
  [issue 135](https://github.com/editorconfig/editorconfig-vscode/issues/135):
  extension does not load on Linux systems, due to case sensitivity.

## 0.9.0

- Improve output channel messaging.

## 0.8.0

- Use default language extension for untitled documents.

## 0.7.0

- Assume new/untitled docs are @ root path.

## 0.6.5

- Restore non-native trailing whitespace trims on inactive editor documents
  (save all).

## 0.6.4

- Use native `editor.action.trimTrailingWhitespace`.

## 0.6.3

- Use new `TextEdit.setEndOfLine` API.
- Preserve selections on file save.
- Demote warning message to output channel.

## 0.6.2

- Save/restore selections (cursors) during file save.

## 0.6.1

- Set EOL just before file save.

## 0.6.0

- Automatically display property values when editing `.editorconfig`
  ([#109](https://github.com/editorconfig/editorconfig-vscode/pull/109)).
- Add recommended extensions
  ([#110](https://github.com/editorconfig/editorconfig-vscode/pull/110)).

## 0.5.0

- Added auto-complete improvements
  ([#103](https://github.com/editorconfig/editorconfig-vscode/pull/103)).
- Lighten distribution package
  ([#104](https://github.com/editorconfig/editorconfig-vscode/pull/104)).

## 0.4.0

- Feature: Support `.editorconfig` auto-complete
  ([#99](https://github.com/editorconfig/editorconfig-vscode/pull/99)).

## 0.3.4

- [Use
  `onWillSaveTextDocument`]https://github.com/editorconfig/editorconfig-vscode/pull/80,
  fixes [`#76`](https://github.com/editorconfig/editorconfig-vscode/issues/76)
  and [`#79`](https://github.com/editorconfig/editorconfig-vscode/issues/79)
  (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.3.3

- Compile project before publish.

## 0.3.2

- [Take `detectIndentation` into account](https://github.com/editorconfig/editorconfig-vscode/pull/70),
  fixes [`#51`](https://github.com/editorconfig/editorconfig-vscode/issues/51)
  and [`#52`](https://github.com/editorconfig/editorconfig-vscode/issues/52)
  (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.3.1

- [Fix `indent_size`](https://github.com/editorconfig/editorconfig-vscode/issues/60)
  (thanks [`@jedmao`](https://github.com/jedmao))!

## 0.3.0

- [Support `end_of_line`](https://github.com/editorconfig/editorconfig-vscode/issues/26)
  (thanks [`@jedmao`](https://github.com/jedmao))!

## 0.2.3

- [Fix applying transformations to .editorconfig itself](https://github.com/editorconfig/editorconfig-vscode/issues/9)
  (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!
- [Fix marketplace icon](https://github.com/editorconfig/editorconfig-vscode/commits/master)
  (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.2.2

- [Fix defaults](https://github.com/editorconfig/editorconfig-vscode/issues/3)
  (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.2.1

- [Trim trailing whitespace before inserting final newline](https://github.com/editorconfig/editorconfig-vscode/issues/2)
  (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.2.0

- Support `trim_trailing_whitespace` (thanks
  [`@torarvid`](https://github.com/torarvid))!
- Fix text editor defaults (thanks
  [`@SamVerschueren`](https://github.com/SamVerschueren))!
- Fix multiple execution times (thanks
  [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.1.0

- Forked from
  [`Microsoft/vscode-editorconfig`](https://github.com/Microsoft/vscode-editorconfig).
