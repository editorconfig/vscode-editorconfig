'use strict';

import { ExtensionContext, DocumentSelector, commands, languages } from 'vscode';
import EditorConfigCompletionProvider from './EditorConfigCompletionProvider';
import DocumentWatcher from './DocumentWatcher';
import { generateEditorConfig } from './commands/generateEditorConfig';

/**
 * Main entry
 */
export function activate(ctx: ExtensionContext): void {
	ctx.subscriptions.push(new DocumentWatcher());

	// register .editorconfig file completion provider
	let editorConfigFileSelector: DocumentSelector = ["properties", { pattern: '.editorconfig' }];
	languages.registerCompletionItemProvider(editorConfigFileSelector, new EditorConfigCompletionProvider());

	// register a command handler to generate a .editorconfig file
	commands.registerCommand(
		'vscode.generateeditorconfig',
		generateEditorConfig
	);
}
