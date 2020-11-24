import { KnownProps } from 'editorconfig'
import {
	TextDocument,
	TextDocumentSaveReason,
	TextEdit,
	TextEditor,
} from 'vscode'

export abstract class PreSaveTransformation {
	public abstract transform(
		editorconfig: KnownProps,
		doc?: TextDocument,
		reason?: TextDocumentSaveReason,
	): {
		condition?(editor: TextEditor): boolean
		edits: TextEdit[] | Error
		message?: string
	}
}
