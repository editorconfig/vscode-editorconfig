import * as editorconfig from 'editorconfig';
import { EndOfLine, TextEditor } from 'vscode';

/**
 * Transform the textdocument by setting the end of line sequence
 */
export async function transform(
	editorconfig: editorconfig.knownProps,
	editor: TextEditor
) {
	const eol = {
		lf: EndOfLine.LF,
		crlf: EndOfLine.CRLF
	}[(editorconfig.end_of_line || '').toLowerCase()];

	if (!eol) {
		return false;
	}

	return await editor.edit(edit => {
		edit.setEndOfLine(eol);
	});
}
