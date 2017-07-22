import * as editorconfig from 'editorconfig';
import {
	commands,
	workspace,
	TextDocument,
	TextLine,
	Position,
	Range,
	TextEdit,
	window
} from 'vscode';

import PreSaveTransformation from './PreSaveTransformation';

class TrimTrailingWhitespace extends PreSaveTransformation {
	transform(
		editorconfigProperties: editorconfig.knownProps,
		doc: TextDocument
	) {
		const editorTrimsWhitespace = workspace
			.getConfiguration('files')
			.get('trimTrailingWhitespace', false);

		if (editorTrimsWhitespace) {
			if (editorconfigProperties.trim_trailing_whitespace === false) {
				const message = [
					'The trimTrailingWhitespace workspace or user setting',
					'is overriding the EditorConfig setting for this file.'
				].join(' ');
				return {
					edits: new Error(message),
					message
				};
			}
		}

		if (!editorconfigProperties.trim_trailing_whitespace) {
			return { edits: [] };
		}

		if (window.activeTextEditor.document === doc) {
			commands.executeCommand('editor.action.trimTrailingWhitespace');
			return {
				edits: [],
				message: 'editor.action.trimTrailingWhitespace'
			};
		}

		const edits: TextEdit[] = [];
		for (let i = 0; i < doc.lineCount; i++) {
			const edit = this.trimLineTrailingWhitespace(doc.lineAt(i));

			if (edit) {
				edits.push(edit);
			}
		}

		return {
			edits,
			message: 'trimTrailingWhitespace()'
		};
	}

	private trimLineTrailingWhitespace(line: TextLine): TextEdit | void {
		const trimmedLine = this.trimTrailingWhitespace(line.text);

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

	private trimTrailingWhitespace(input: string) {
		return input.replace(/[\s\uFEFF\xA0]+$/g, '');
	}
}

export default TrimTrailingWhitespace;
