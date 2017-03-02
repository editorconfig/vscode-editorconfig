import * as editorconfig from 'editorconfig';
import {
	workspace,
	window,
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
	const editorTrimsWhitespace = workspace
		.getConfiguration('files')
		.get('trimTrailingWhitespace', false);

	if (editorTrimsWhitespace) {
		if (editorconfig.trim_trailing_whitespace === false) {
			window.showWarningMessage([
				'The trimTrailingWhitespace workspace or user setting is',
				'overriding the EditorConfig setting for this file.'
			].join(' '));
		}
		return [];
	}

	if (!editorconfig.trim_trailing_whitespace) {
		return [];
	}

	const trimmingOperations: TextEdit[] = [];

	for (let i = 0; i < textDocument.lineCount; i++) {
		const edit = trimLineTrailingWhitespace(textDocument.lineAt(i));

		if (edit) {
			trimmingOperations.push(edit);
		}
	}

	return trimmingOperations;
}

function trimLineTrailingWhitespace(line: TextLine): TextEdit | void {
	const trimmedLine = trimTrailingWhitespace(line.text);

	if (trimmedLine === line.text) {
		return;
	}

	const whitespaceBegin = new Position(
		line.lineNumber,
		trimmedLine.length
	);
	const whitespaceEnd = new Position(
		line.lineNumber,
		line.text.length
	);
	const whitespace = new Range(
		whitespaceBegin,
		whitespaceEnd
	);

	return TextEdit.delete(whitespace);
}

function trimTrailingWhitespace(input: string) {
	return input.replace(/[\s\uFEFF\xA0]+$/g, '');
}
