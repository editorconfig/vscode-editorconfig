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

		/**
		 * VSCode normalizes line endings on every file-save operation
		 * according to whichever EOL sequence is dominant. If the file already
		 * has the appropriate dominant EOL sequence, there is nothing more to do,
		 * so we defer to VSCode's built-in functionality by applying no edits.
		 */
		return doc.eol === eol
			? { edits: [] }
			: {
					edits: [TextEdit.setEndOfLine(eol)],
					message: `setEndOfLine(${eolKey})`,
			  }
	}
}
