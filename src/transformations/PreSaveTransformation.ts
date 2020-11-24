import { KnownProps } from 'editorconfig'
import { TextDocument, TextDocumentSaveReason, TextEdit } from 'vscode'

export abstract class PreSaveTransformation {
	public abstract transform(
		editorconfig: KnownProps,
		doc?: TextDocument,
		reason?: TextDocumentSaveReason,
	): {
		edits: TextEdit[] | Error
		message?: string
	}
}
