import * as editorconfig from 'editorconfig';
import * as compact from 'lodash.compact';
import * as path from 'path';
import {
	window,
	workspace,
	Disposable,
	Selection,
	TextDocument,
	TextEditor,
	TextEditorOptions,
	TextEdit
} from 'vscode';
import languageExtensionMap from './languageExtensionMap';
import { fromEditorConfig } from './Utils';
import {
	InsertFinalNewline,
	PreSaveTransformation,
	SetEndOfLine,
	TrimTrailingWhitespace
} from './transformations';
import {
	EditorConfigProvider
} from './interfaces/editorConfigProvider';

class DocumentWatcher implements EditorConfigProvider {

	private docToConfigMap: { [fileName: string]: editorconfig.knownProps };
	private disposable: Disposable;
	private defaults: TextEditorOptions;
	private preSaveTransformations: PreSaveTransformation[] = [
		new SetEndOfLine(),
		new TrimTrailingWhitespace(),
		new InsertFinalNewline()
	];

	constructor(
		private outputChannel = window.createOutputChannel('EditorConfig')
	) {
		this.log('Initializing document watcher...');

		const subscriptions: Disposable[] = [];

		subscriptions.push(window.onDidChangeActiveTextEditor(editor => {
			if (editor && editor.document) {
				this.onDidOpenDocument(editor.document);
			}
		}));

		subscriptions.push(workspace.onDidChangeConfiguration(
			this.onConfigChanged.bind(this)
		));

		subscriptions.push(workspace.onDidSaveTextDocument(async doc => {
			if (path.basename(doc.fileName) === '.editorconfig') {
				this.log('.editorconfig file saved.');
				await this.rebuildConfigMap();
			}
		}));

		subscriptions.push(workspace.onWillSaveTextDocument(async e => {
			let selections: Selection[];
			const activeTextEditor = window.activeTextEditor;
			if (activeTextEditor && activeTextEditor.document === e.document) {
				selections = activeTextEditor.selections;
			}
			const transformations = this.calculatePreSaveTransformations(e.document);
			e.waitUntil(transformations);
			if (selections) {
				transformations.then(() => {
					activeTextEditor.selections = selections;
				});
			}
		}));

		this.disposable = Disposable.from.apply(this, subscriptions);
		this.rebuildConfigMap();
		this.onConfigChanged();
	}

	private log(...messages: string[]) {
		this.outputChannel.appendLine(messages.join(' '));
	}

	public dispose() {
		this.disposable.dispose();
	}

	public getSettingsForDocument(doc: TextDocument) {
		return this.docToConfigMap[this.getFileName(doc)];
	}

	private getFileName(doc: TextDocument) {
		if (!doc.isUntitled) {
			return doc.fileName;
		}
		const ext = languageExtensionMap[doc.languageId] || doc.languageId;
		return path.join(
			...compact([
				workspace.rootPath,
				`${doc.fileName}.${ext}`
			])
		);
	}

	public getDefaultSettings() {
		return this.defaults;
	}

	private async rebuildConfigMap() {
		this.log('Rebuilding config map...');
		this.docToConfigMap = {};
		return await Promise.all(workspace.textDocuments.map(
			doc => this.onDidOpenDocument(doc)
		));
	}

	private async onDidOpenDocument(doc: TextDocument) {
		if (doc.languageId === 'Log') {
			return;
		}
		const fileName = this.getFileName(doc);
		const relativePath = workspace.asRelativePath(fileName);

		if (this.docToConfigMap[fileName]) {
			this.log(`${relativePath}: Applying configuration map...`);
			await this.applyEditorConfigToTextEditor(window.activeTextEditor);
			return;
		}

		this.log(`${relativePath}: Using EditorConfig core...`);
		return editorconfig.parse(fileName)
			.then(async (config: editorconfig.knownProps) => {
				if (config.indent_size === 'tab') {
					config.indent_size = config.tab_width;
				}

				this.docToConfigMap[fileName] = config;

				await this.applyEditorConfigToTextEditor(window.activeTextEditor);
			});
	}

	private async applyEditorConfigToTextEditor(
		editor: TextEditor,
	) {
		if (!editor) {
			this.log('No more open editors.');
			return Promise.resolve();
		}

		const doc = editor.document;
		const relativePath = workspace.asRelativePath(doc.fileName);
		const editorconfig = this.getSettingsForDocument(doc);

		if (!editorconfig) {
			this.log(`${relativePath}: No configuration.`);
			return Promise.resolve();
		}

		const newOptions = fromEditorConfig(
			editorconfig,
			this.getDefaultSettings()
		);

		// tslint:disable-next-line:no-any
		editor.options = newOptions as any;

		this.log(`${relativePath}: ${JSON.stringify(newOptions)}`);
	}

	private onConfigChanged() {
		const workspaceConfig = workspace.getConfiguration('editor');
		const detectIndentation = workspaceConfig.get<boolean>('detectIndentation');

		this.defaults = (detectIndentation) ? {} : {
			tabSize: workspaceConfig.get<string | number>('tabSize'),
			insertSpaces: workspaceConfig.get<string | boolean>('insertSpaces')
		};
		this.log(
			'Detected change in configuration:',
			JSON.stringify(this.defaults)
		);
	}

	private async calculatePreSaveTransformations(
		doc: TextDocument
	): Promise<TextEdit[]> {
		const editorconfig = this.getSettingsForDocument(doc);
		const relativePath = workspace.asRelativePath(doc.fileName);

		if (!editorconfig) {
			this.log(`${relativePath}: No configuration found for pre-save.`);
			return [];
		}

		return Array.prototype.concat.call([],
			...this.preSaveTransformations.map(
				transformer => {
					const { edits, message } = transformer.transform(
						editorconfig,
						doc
					);
					if (edits instanceof Error) {
						this.log(`${relativePath}: ${edits.message}`);
					}
					if (message) {
						this.log(`${relativePath}: ${message}`);
					}
					return edits;
				}
			)
		);
	}
}

export default DocumentWatcher;
