import * as path from 'path'
import {
	Disposable,
	Selection,
	TextDocument,
	TextDocumentSaveReason,
	TextEditor,
	TextEditorOptions,
	window,
	workspace,
} from 'vscode'
import {
	InsertFinalNewline,
	PreSaveTransformation,
	SetEndOfLine,
	TrimTrailingWhitespace,
} from './transformations'

import {
	applyTextEditorOptions,
	resolveCoreConfig,
	resolveFile,
	resolveTextEditorOptions,
} from './api'

export default class DocumentWatcher {
	private disposable: Disposable
	private preSaveTransformations: PreSaveTransformation[] = [
		new SetEndOfLine(),
		new TrimTrailingWhitespace(),
		new InsertFinalNewline(),
	]
	private doc?: TextDocument

	public constructor(
		private outputChannel = window.createOutputChannel('EditorConfig'),
	) {
		this.log('Initializing document watcher...')

		const subscriptions: Disposable[] = []

		this.handleTextEditorChange(window.activeTextEditor)

		subscriptions.push(
			window.onDidChangeActiveTextEditor(async editor => {
				this.handleTextEditorChange(editor)
			}),
		)

		subscriptions.push(
			window.onDidChangeWindowState(async state => {
				if (state.focused && this.doc) {
					const newOptions = await resolveTextEditorOptions(this.doc, {
						onEmptyConfig: this.onEmptyConfig,
					})
					applyTextEditorOptions(newOptions, {
						onNoActiveTextEditor: this.onNoActiveTextEditor,
						onSuccess: this.onSuccess,
					})
				}
			}),
		)

		subscriptions.push(
			workspace.onDidSaveTextDocument(doc => {
				if (path.basename(doc.fileName) === '.editorconfig') {
					this.log('.editorconfig file saved.')
				}
			}),
		)

		subscriptions.push(
			workspace.onWillSaveTextDocument(async e => {
				let selections: Selection[] = []
				const activeEditor = window.activeTextEditor
				const activeDoc = activeEditor?.document
				if (activeDoc && activeDoc === e.document && activeEditor) {
					selections = activeEditor.selections
				}
				const transformations = this.calculatePreSaveTransformations(
					e.document,
					e.reason,
				)
				e.waitUntil(transformations)
				if (selections.length) {
					const edits = await transformations
					if (activeEditor && edits.length) {
						activeEditor.selections = selections
					}
				}
			}),
		)

		this.disposable = Disposable.from.apply(this, subscriptions)
		this.log('Document watcher initialized')
	}

	public onEmptyConfig = (relativePath: string) => {
		this.log(`${relativePath}: No configuration.`)
	}

	public onBeforeResolve = (relativePath: string) => {
		this.log(`${relativePath}: Using EditorConfig core...`)
	}

	public onNoActiveTextEditor = () => {
		this.log('No more open editors.')
	}

	public onSuccess = (newOptions: TextEditorOptions) => {
		if (!this.doc) {
			this.log(`[no file]: ${JSON.stringify(newOptions)}`)
			return
		}
		const { relativePath } = resolveFile(this.doc)
		this.log(`${relativePath}: ${JSON.stringify(newOptions)}`)
	}

	public log(...messages: string[]) {
		this.outputChannel.appendLine(messages.join(' '))
	}

	public dispose() {
		this.disposable.dispose()
	}

	private async calculatePreSaveTransformations(
		doc: TextDocument,
		reason: TextDocumentSaveReason,
	) {
		const editorconfigSettings = await resolveCoreConfig(doc, {
			onBeforeResolve: this.onBeforeResolve,
		})
		const relativePath = workspace.asRelativePath(doc.fileName)

		if (!editorconfigSettings) {
			this.log(`${relativePath}: No configuration found for pre-save.`)
			return []
		}

		return [
			...this.preSaveTransformations.flatMap(transformer => {
				const { edits, message } = transformer.transform(
					editorconfigSettings,
					doc,
					reason,
				)
				if (edits instanceof Error) {
					this.log(`${relativePath}: ${edits.message}`)
					return []
				}
				if (message) {
					this.log(`${relativePath}: ${message}`)
				}
				return edits
			}),
		]
	}

	private async handleTextEditorChange(editor?: TextEditor) {
		if (editor && editor.document) {
			const newOptions = await resolveTextEditorOptions(
				(this.doc = editor.document),
				{
					onEmptyConfig: this.onEmptyConfig,
				},
			)
			applyTextEditorOptions(newOptions, {
				onNoActiveTextEditor: this.onNoActiveTextEditor,
				onSuccess: this.onSuccess,
			})
		}
	}
}
