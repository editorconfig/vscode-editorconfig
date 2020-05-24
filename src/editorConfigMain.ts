import { commands, DocumentSelector, ExtensionContext, languages } from 'vscode'
import {
	applyTextEditorOptions,
	fromEditorConfig,
	resolveCoreConfig,
	resolveTextEditorOptions,
	toEditorConfig,
} from './api'
import { generateEditorConfig } from './commands/generateEditorConfig'
import DocumentWatcher from './DocumentWatcher'
import EditorConfigCompletionProvider from './EditorConfigCompletionProvider'

/**
 * Main entry
 */
export function activate(ctx: ExtensionContext) {
	ctx.subscriptions.push(new DocumentWatcher())

	// register .editorconfig file completion provider
	const editorConfigFileSelector: DocumentSelector = {
		language: 'editorconfig',
		pattern: '**/.editorconfig',
		scheme: 'file',
	}
	languages.registerCompletionItemProvider(
		editorConfigFileSelector,
		new EditorConfigCompletionProvider(),
	)

	// register an internal command used to automatically display IntelliSense
	// when editing a .editorconfig file
	commands.registerCommand('editorconfig._triggerSuggestAfterDelay', () => {
		setTimeout(() => {
			commands.executeCommand('editor.action.triggerSuggest')
		}, 100)
	})

	// register a command handler to generate a .editorconfig file
	commands.registerCommand('EditorConfig.generate', generateEditorConfig)

	return {
		applyTextEditorOptions,
		fromEditorConfig,
		resolveCoreConfig,
		resolveTextEditorOptions,
		toEditorConfig,
	}
}
