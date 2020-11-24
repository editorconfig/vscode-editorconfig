import { KnownProps } from 'editorconfig'
import { EndOfLine, TextEdit } from 'vscode'

import { PreSaveTransformation } from './PreSaveTransformation'

const eolMap = {
	LF: EndOfLine.LF,
	CRLF: EndOfLine.CRLF,
}

export class SetEndOfLine extends PreSaveTransformation {
	private eolMap = eolMap

	public transform(editorconfigProperties: KnownProps) {
		const eolKey = (editorconfigProperties.end_of_line || '').toUpperCase()
		const eol = this.eolMap[eolKey as keyof typeof eolMap]

		return eol
			? {
					edits: [TextEdit.setEndOfLine(eol)],
					message: `setEndOfLine(${eolKey})`,
			  }
			: { edits: [] }
	}
}
