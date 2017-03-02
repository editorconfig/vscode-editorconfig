'use strict';

import * as get from 'lodash.get';
import * as editorconfig from 'editorconfig';
import {
	TextDocument,
	Position,
	TextEdit
} from 'vscode';

const lineEndings = {
	cr: '\r',
	crlf: '\r\n',
	lf: '\n'
};

/**
 * Returns an array of `TextEdit` objects that will insert
 * a final newline.
 */
export function transform(
	editorconfig: editorconfig.knownProps,
	textDocument: TextDocument
): TextEdit[] {
	const lineCount = textDocument.lineCount;
	const lastLine = textDocument.lineAt(lineCount - 1);

	if (!editorconfig.insert_final_newline
		|| lineCount === 0
		|| lastLine.isEmptyOrWhitespace) {
		return [];
	}

	const position = new Position(lastLine.lineNumber, lastLine.text.length);

	return [
		TextEdit.insert(position, newline(editorconfig))
	];
}

function newline(editorconfig: editorconfig.knownProps) {
	return lineEndings[
		get(editorconfig, 'end_of_line', 'lf').toLowerCase()
	];
}
