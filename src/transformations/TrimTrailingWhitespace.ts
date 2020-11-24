import { KnownProps } from 'editorconfig'
import {
	commands,
	Position,
	Range,
	TextDocument,
	TextDocumentSaveReason,
	TextEdit,
	TextLine,
	window,
	workspace,
} from 'vscode'

import { PreSaveTransformation } from './PreSaveTransformation'

export class TrimTrailingWhitespace extends PreSaveTransformation {
	public transform(
		editorconfigProperties: KnownProps,
		doc: TextDocument,
		reason: TextDocumentSaveReason,
	) {
		const editorTrimsWhitespace = workspace
			.getConfiguration('files', doc.uri)
			.get('trimTrailingWhitespace', false)

		if (editorTrimsWhitespace) {
			if (editorconfigProperties.trim_trailing_whitespace === false) {
				const message = [
					'The trimTrailingWhitespace workspace or user setting',
					'is overriding the EditorConfig setting for this file.',
				].join(' ')
				return {
					edits: new Error(message),
					message,
				}
			}
		}

		if (shouldIgnoreSetting(editorconfigProperties.trim_trailing_whitespace)) {
			return { edits: [] }
		}

		if (window.activeTextEditor && window.activeTextEditor.document === doc) {
			const trimReason =
				reason !== TextDocumentSaveReason.Manual ? 'auto-save' : null
			commands.executeCommand('editor.action.trimTrailingWhitespace', {
				reason: trimReason,
			})
			return {
				edits: [],
				message: 'editor.action.trimTrailingWhitespace',
			}
		}

		const edits: TextEdit[] = []
		for (let i = 0; i < doc.lineCount; i++) {
			const edit = this.trimLineTrailingWhitespace(doc.lineAt(i))

			if (edit) {
				edits.push(edit)
			}
		}

		return {
			edits,
			message: 'trimTrailingWhitespace()',
		}

		function shouldIgnoreSetting(
			value: typeof editorconfigProperties.trim_trailing_whitespace,
		) {
			return !value || value === 'unset'
		}
	}

	private trimLineTrailingWhitespace(line: TextLine): TextEdit | void {
		const trimmedLine = this.trimTrailingWhitespace(line.text)

		if (trimmedLine === line.text) {
			return
		}

		const whitespaceBegin = new Position(line.lineNumber, trimmedLine.length)
		const whitespaceEnd = new Position(line.lineNumber, line.text.length)
		const whitespace = new Range(whitespaceBegin, whitespaceEnd)

		return TextEdit.delete(whitespace)
	}

	private trimTrailingWhitespace(input: string) {
		return input.replace(/[\s\uFEFF\xA0]+$/g, '')
	}
}
