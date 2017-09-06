import * as get from 'lodash.get';
import * as editorconfig from 'editorconfig';
import {
	TextDocument,
	Position,
	Range,
	TextEdit
} from 'vscode';

import PreSaveTransformation from './PreSaveTransformation';

export default class InsertFinalNewline extends PreSaveTransformation {

	private lineEndings = {
		CR: '\r',
		CRLF: '\r\n',
		LF: '\n'
	};

	private deleteFinalNewlines = (doc, lineCount, lastLine) => {
		let realLastLine = lastLine;
		let realLastLineDetected = false;
		let lineCounter = 1;

		while (!realLastLineDetected) {
			if (!realLastLine.isEmptyOrWhitespace) {
				realLastLineDetected = true;
			} else {
				lineCounter++;
				realLastLine = doc.lineAt(lineCount - lineCounter);
			}
		}

		const rangeStart = realLastLine.range;
		const rangeEnd = lastLine.range;

		const positionStart = rangeStart[Object.keys(rangeStart)[1]];
		const positionEnd = rangeEnd[Object.keys(rangeEnd)[1]];

		const range = new Range(
			positionStart,
			positionEnd
		);

		return {
			edits: [ TextEdit.delete(range) ],
			message: `deleteRange(${range})`
		};
	}

	private doNothing = () => {
		return { edits: [] };
	}

	private insertFinalNewline = (editorconfigProperties, lastLine) => {
		const position = new Position(
			lastLine.lineNumber,
			lastLine.text.length
		);

		const eol = get(editorconfigProperties, 'end_of_line', 'lf').toUpperCase();

		return {
			edits: [ TextEdit.insert(position, this.lineEndings[eol]) ],
			message: `insertFinalNewline(${eol})`
		};
	}

	transform(
		editorconfigProperties: editorconfig.knownProps,
		doc: TextDocument
	) {
		const lineCount = doc.lineCount;
		const lastLine = doc.lineAt(lineCount - 1);

		if (lineCount === 0
			|| editorconfigProperties.insert_final_newline === undefined) {
			return this.doNothing();
		}

		if (editorconfigProperties.insert_final_newline
			&& !lastLine.isEmptyOrWhitespace) {
				return this.insertFinalNewline(editorconfigProperties, lastLine);
		}

		if (!editorconfigProperties.insert_final_newline
			&& lastLine.isEmptyOrWhitespace) {
			return this.deleteFinalNewlines(doc, lineCount, lastLine);
		}

		return this.doNothing();
	}
}
