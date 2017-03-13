import * as editorconfig from 'editorconfig';
import * as path from 'path';
import {
	window,
	workspace,
	Disposable,
	Selection,
	TextDocument,
	TextDocumentWillSaveEvent,
	TextEditor,
	TextEditorOptions,
	TextEdit
} from 'vscode';
import * as Utils from './Utils';
import {
	endOfLineTransform,
	trimTrailingWhitespaceTransform,
	insertFinalNewlineTransform
} from './transformations';
import {
	EditorConfigProvider
} from './interfaces/editorConfigProvider';

/**
 * Listens to vscode document open and maintains a map
 * (Document => editor config settings)
 */
class DocumentWatcher implements EditorConfigProvider {

	private documentToConfigMap: { [uri: string]: editorconfig.knownProps };
	private disposable: Disposable;
	private defaults: TextEditorOptions;

	constructor() {
		const subscriptions: Disposable[] = [];

		window.onDidChangeActiveTextEditor(
			this.onDidChangeActiveTextEditor, this, subscriptions
		);

		workspace.onDidChangeConfiguration(
			this.onDidChangeConfiguration, this, subscriptions
		);

		workspace.onWillSaveTextDocument(
			this.onWillSaveTextDocument, this, subscriptions
		);

		workspace.onDidSaveTextDocument(
			this.onDidSaveTextDocument, this, subscriptions
		);

		this.disposable = Disposable.from(...subscriptions);

		this.rebuildConfigMap();

		this.onDidChangeConfiguration();
	}

	public dispose() {
		this.disposable.dispose();
	}

	private onDidChangeActiveTextEditor(editor: TextEditor) {
		if (editor && editor.document) {
			this.onDidOpenDocument(editor.document);
		}
	}

	private onDidOpenDocument(doc: TextDocument) {
		if (doc.isUntitled) {
			return Promise.resolve();
		}
		const path = doc.fileName;

		if (this.documentToConfigMap[path]) {
			this.applyEditorConfigToTextEditor();
			return Promise.resolve();
		}

		return editorconfig.parse(path)
			.then((config: editorconfig.knownProps) => {
				if (config.indent_size === 'tab') {
					config.indent_size = config.tab_width;
				}

				this.documentToConfigMap[path] = config;

				this.applyEditorConfigToTextEditor();
			});
	}

	private applyEditorConfigToTextEditor() {
		const editor = window.activeTextEditor;
		if (!editor) {
			// No more open editors
			return false;
		}

		const doc = editor.document;
		const editorconfig = this.getSettingsForDocument(doc);

		if (!editorconfig) {
			// no configuration found for this file
			return false;
		}

		const newOptions = Utils.fromEditorConfig(
			editorconfig,
			this.getDefaultSettings()
		);

		// tslint:disable-next-line:no-any
		editor.options = newOptions as any;

		return endOfLineTransform(editorconfig, editor);
	}

	public getSettingsForDocument(document: TextDocument) {
		return this.documentToConfigMap[document.fileName];
	}

	public getDefaultSettings() {
		return this.defaults;
	}

	private onDidChangeConfiguration() {
		const workspaceConfig = workspace.getConfiguration('editor');
		const detectIndentation = workspaceConfig.get<boolean>(
			'detectIndentation'
		);

		this.defaults = (detectIndentation) ? {} : {
			tabSize: workspaceConfig.get<string | number>('tabSize'),
			insertSpaces: workspaceConfig.get<string | boolean>('insertSpaces')
		};
	}

	private onWillSaveTextDocument(e: TextDocumentWillSaveEvent) {
		let selections: Selection[];
		if (window.activeTextEditor.document === e.document) {
			selections = window.activeTextEditor.selections;
		}
		const transformations = this.calculatePreSaveTransformations(e.document);
		e.waitUntil(transformations);
		if (selections) {
			window.activeTextEditor.selections = selections;
		}
	}

	private async calculatePreSaveTransformations(
		textDocument: TextDocument
	): Promise<TextEdit[]> {
		const editorconfig = this.getSettingsForDocument(textDocument);

		if (!editorconfig) {
			// no configuration found for this file
			return [];
		}

		return [
			...insertFinalNewlineTransform(editorconfig, textDocument),
			...trimTrailingWhitespaceTransform(editorconfig, textDocument)
		];
	}

	/**
	 * Listen for saves to ".editorconfig" files and rebuild the map.
	 */
	private async onDidSaveTextDocument(doc: TextDocument) {
		if (path.basename(doc.fileName) === '.editorconfig') {
			await this.rebuildConfigMap();
		}
	}

	/**
	 * Build the map (cover the case that documents were opened before
	 * my activation)
	 */
	private rebuildConfigMap() {
		this.documentToConfigMap = {};
		return Promise.all(workspace.textDocuments.map(
			document => this.onDidOpenDocument(document)
		));
	}
}

export default DocumentWatcher;
