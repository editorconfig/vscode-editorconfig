import { KnownProps } from 'editorconfig'
import { Position, TextDocument, TextEdit } from 'vscode'

import { PreSaveTransformation } from './PreSaveTransformation'

const lineEndings = {
	CR: '\r',
	CRLF: '\r\n',
	LF: '\n',
}

export class InsertFinalNewline extends PreSaveTransformation {
	private lineEndings = lineEndings

	public transform(editorconfigProperties: KnownProps, doc: TextDocument) {
		const lineCount = doc.lineCount
		const lastLine = doc.lineAt(lineCount - 1)

		if (
			shouldIgnoreSetting(editorconfigProperties.insert_final_newline) ||
			lineCount === 0 ||
			lastLine.isEmptyOrWhitespace
		) {
			return { edits: [] }
		}

		const position = new Position(lastLine.lineNumber, lastLine.text.length)

		const eol = (editorconfigProperties.end_of_line ?? 'lf').toUpperCase()

		return {
			edits: [
				TextEdit.insert(
					position,
					this.lineEndings[eol as keyof typeof lineEndings],
				),
			],
			message: `insertFinalNewline(${eol})`,
		}

		function shouldIgnoreSetting(
			value?: typeof editorconfigProperties.insert_final_newline,
		) {
			return !value || value === 'unset'
		}
	}
}
