import { KnownProps } from 'editorconfig'
import { EndOfLine, TextDocument, TextEdit } from 'vscode'

import { PreSaveTransformation } from './PreSaveTransformation'

const eolMap = {
	LF: EndOfLine.LF,
	CRLF: EndOfLine.CRLF,
}

/**
 * Sets the end of line, but only when there is a reason to do so.
 * This is to preserve redo history when possible.
 */
export class SetEndOfLine extends PreSaveTransformation {
	private eolMap = eolMap

	public transform(editorconfigProperties: KnownProps, doc: TextDocument) {
		const eolKey = (editorconfigProperties.end_of_line || '').toUpperCase()
		const eol = this.eolMap[eolKey as keyof typeof eolMap]

		if (!eol) {
			return noEdits()
		}

		const text = doc.getText()
		switch (eol) {
			case EndOfLine.LF:
				if (/\r\n/.test(text)) {
					return createEdits()
				}
				break
			case EndOfLine.CRLF:
				// if there is an LF not preceded by a CR
				if (/(?<!\r)\n/.test(text)) {
					return createEdits()
				}
				break
		}

		return noEdits()

		function noEdits() {
			return { edits: [] }
		}

		/**
		 * @warning destroys redo history
		 */
		function createEdits() {
			return {
				edits: [TextEdit.setEndOfLine(eol)],
				message: `setEndOfLine(${eolKey})`,
			}
		}
	}
}
