## 0.6.3
- Undo setting of EOL just before file save.
  - Wasn't working on background files.
  - Waiting for [March vscode API updates](https://github.com/Microsoft/vscode/issues/15510#issuecomment-286034612) to fix properly.

## 0.6.2
- Save/restore selections (cursors) during file save.

## 0.6.1
- Set EOL just before file save.

## 0.6.0
- Automatically display property values when editing `.editorconfig` ([#109](https://github.com/editorconfig/editorconfig-vscode/pull/109)).
- Add recommended extensions ([#110](https://github.com/editorconfig/editorconfig-vscode/pull/110)).

## 0.5.0
- Added auto-complete improvements ([#103](https://github.com/editorconfig/editorconfig-vscode/pull/103)).
- Lighten distribution package ([#104](https://github.com/editorconfig/editorconfig-vscode/pull/104)).

## 0.4.0
- Feature: Support `.editorconfig` auto-complete ([#99](https://github.com/editorconfig/editorconfig-vscode/pull/99)).

## 0.3.4
- [Use `onWillSaveTextDocument`]https://github.com/editorconfig/editorconfig-vscode/pull/80, fixes [`#76`](https://github.com/editorconfig/editorconfig-vscode/issues/76) and [`#79`](https://github.com/editorconfig/editorconfig-vscode/issues/79) (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.3.3
- Compile project before publish.

## 0.3.2
- [Take `detectIndentation` into account](https://github.com/editorconfig/editorconfig-vscode/pull/70), fixes [`#51`](https://github.com/editorconfig/editorconfig-vscode/issues/51) and [`#52`](https://github.com/editorconfig/editorconfig-vscode/issues/52) (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.3.1
- [Fix `indent_size`](https://github.com/editorconfig/editorconfig-vscode/issues/60) (thanks [`@jedmao`](https://github.com/jedmao))!

## 0.3.0
- [Support `end_of_line`](https://github.com/editorconfig/editorconfig-vscode/issues/26) (thanks [`@jedmao`](https://github.com/jedmao))!

## 0.2.3
- [Fix applying transformations to .editorconfig itself](https://github.com/editorconfig/editorconfig-vscode/issues/9) (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!
- [Fix marketplace icon](https://github.com/editorconfig/editorconfig-vscode/commits/master) (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.2.2
- [Fix defaults](https://github.com/editorconfig/editorconfig-vscode/issues/3) (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.2.1
- [Trim trailing whitespace before inserting final newline](https://github.com/editorconfig/editorconfig-vscode/issues/2) (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.2.0
- Support `trim_trailing_whitespace` (thanks [`@torarvid`](https://github.com/torarvid))!
- Fix text editor defaults (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!
- Fix multiple execution times (thanks [`@SamVerschueren`](https://github.com/SamVerschueren))!

## 0.1.0
- Forked from [`Microsoft/vscode-editorconfig`](https://github.com/Microsoft/vscode-editorconfig).
