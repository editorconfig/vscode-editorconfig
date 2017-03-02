'use strict';

import * as editorconfig from 'editorconfig';
import {
	EndOfLine,
	TextEditor
} from 'vscode';

/**
 * Transform the textdocument by setting the end of line sequence
 */
export function transform(
	editorconfig: editorconfig.knownProps,
	editor: TextEditor
): Thenable<boolean|void> {
	const eol = {
		lf: EndOfLine.LF,
		crlf: EndOfLine.CRLF
	}[(editorconfig.end_of_line || '').toLowerCase()];

	if (!eol) {
		return Promise.resolve();
	}

	return editor.edit(edit => {
		edit.setEndOfLine(eol);
	});
}
