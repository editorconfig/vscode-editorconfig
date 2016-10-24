'use strict';

import * as editorconfig from 'editorconfig';
import {
	TextDocument,
	TextLine,
	Position,
	Range,
	TextEdit
} from 'vscode';

/**
 * Returns an array of `TextEdit` objects that will trim the
 * trailing whitespace of each line.
 */
export function transform(
	editorconfig: editorconfig.knownProps,
	textDocument: TextDocument
): TextEdit[] {
	if (! editorconfig.indent_style || ! editorconfig.indent_size) {
		return [];
	}

	const indentOperations: TextEdit[] = [];

	for (let i = 0; i < textDocument.lineCount; i++) {
		const edit = convertIndentation(
			textDocument.lineAt(i),
			editorconfig.indent_style,
			editorconfig.indent_size
		);

		if (edit) {
			indentOperations.push(edit);
		}
	}

	return indentOperations;
}

function convertIndentation(
	line: TextLine,
	indentStyle: string,
	indentSize: number
): TextEdit {
	let indentRegex;

	if (indentStyle === 'space') {
		indentRegex = /^(\t+)/;
	} else if (indentStyle === 'tab') {
		indentRegex = new RegExp('^( {' + indentSize + '})+');
	} else {
		return;
	}

	const indentMatch = line.text.match(indentRegex);

	if (! indentMatch) {
		return;
	}

	let newIndent;

	if (indentStyle === 'space') {
		const tabCount = indentMatch[0].length;
		newIndent = ' '.repeat(tabCount * indentSize);
	} else if (indentStyle === 'tab') {
		const spaceCount = indentMatch[0].length / indentSize;
		newIndent = '\t'.repeat(spaceCount);

	}

	const indentBegin = new Position(
		line.lineNumber,
		0
	);
	const indentEnd = new Position(
		line.lineNumber,
		indentMatch[0].length
	);
	const indent = new Range(
		indentBegin,
		indentEnd
	);

	return TextEdit.replace(indent, newIndent);
}
