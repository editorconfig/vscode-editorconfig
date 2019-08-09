import get = require('lodash.get')
import { KnownProps } from 'editorconfig'
import { TextDocument, Position, TextEdit } from 'vscode'

import PreSaveTransformation from './PreSaveTransformation'

export default class InsertFinalNewline extends PreSaveTransformation {
	private lineEndings = {
		CR: '\r',
		CRLF: '\r\n',
		LF: '\n',
	}

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

		const eol = get(editorconfigProperties, 'end_of_line', 'lf').toUpperCase()

		return {
			edits: [TextEdit.insert(position, this.lineEndings[eol])],
			message: `insertFinalNewline(${eol})`,
		}

		function shouldIgnoreSetting(value) {
			return !value || value === 'unset'
		}
	}
}
