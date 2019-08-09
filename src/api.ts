import * as editorconfig from 'editorconfig'
import compact = require('lodash.compact')
import get = require('lodash.get')
import * as path from 'path'
import { window, workspace, TextDocument, TextEditorOptions } from 'vscode'

import languageExtensionMap from './languageExtensionMap'

/**
 * Resolves `TextEditorOptions` for a `TextDocument`, combining the editor's
 * default configuration with that of EditorConfig's configuration.
 */
export async function resolveTextEditorOptions(
	doc: TextDocument,
	{
		defaults = pickWorkspaceDefaults(),
		onBeforeResolve,
		onEmptyConfig,
	}: {
		defaults?: TextEditorOptions
		onBeforeResolve?: (relativePath: string) => void
		onEmptyConfig?: (relativePath?: string) => void
	} = {},
) {
	const editorconfigSettings = await resolveCoreConfig(doc, { onBeforeResolve })
	if (editorconfigSettings) {
		return fromEditorConfig(editorconfigSettings, defaults)
	}
	if (onEmptyConfig) {
		onEmptyConfig(resolveFile(doc).relativePath)
	}
	return {}
}

/**
 * Applies new `TextEditorOptions` to the active text editor.
 */
export async function applyTextEditorOptions(
	newOptions: TextEditorOptions,
	{
		onNoActiveTextEditor,
		onSuccess,
	}: {
		onNoActiveTextEditor?: () => void
		onSuccess?: (newOptions: TextEditorOptions) => void
	} = {},
) {
	const editor = window.activeTextEditor
	if (!editor) {
		if (onNoActiveTextEditor) {
			onNoActiveTextEditor()
		}
		return
	}

	editor.options = newOptions

	if (onSuccess) {
		onSuccess(newOptions)
	}
}

/**
 * Picks EditorConfig-relevant props from the editor's default configuration.
 */
export function pickWorkspaceDefaults(): {
	/**
	 * The number of spaces a tab is equal to. When `editor.detectIndentation`
	 * is on, this property value will be `undefined`.
	 */
	tabSize?: number
	/**
	 * Insert spaces when pressing `Tab`. When `editor.detectIndentation` is on,
	 * this property value will be `undefined`.
	 */
	insertSpaces?: boolean
} {
	const workspaceConfig = workspace.getConfiguration('editor', null)
	const detectIndentation = workspaceConfig.get<boolean>('detectIndentation')

	return detectIndentation
		? {}
		: {
				tabSize: workspaceConfig.get<number>('tabSize'),
				insertSpaces: workspaceConfig.get<boolean>('insertSpaces'),
		  }
}

export interface ResolvedCoreConfig extends editorconfig.KnownProps {
	[rule: string]: string | number | boolean
}

/**
 * Resolves an EditorConfig configuration for the file related to a
 * `TextDocument`.
 */
export async function resolveCoreConfig(
	doc: TextDocument,
	{
		onBeforeResolve,
	}: {
		onBeforeResolve?: (relativePath: string) => void
	} = {},
): Promise<ResolvedCoreConfig> {
	const { fileName, relativePath } = resolveFile(doc)
	if (!fileName) {
		return {}
	}
	if (onBeforeResolve) {
		onBeforeResolve(relativePath)
	}
	const config = await editorconfig.parse(fileName)
	if (config.indent_size === 'tab') {
		config.indent_size = config.tab_width
	}
	return config as ResolvedCoreConfig
}

export function resolveFile(
	doc: TextDocument,
): {
	fileName?: string
	relativePath?: string
} {
	if (doc.languageId === 'Log') {
		return {}
	}
	const fileName = getFileName()
	return {
		fileName,
		relativePath: workspace.asRelativePath(fileName, true),
	}

	function getFileName() {
		if (!doc.isUntitled) {
			return doc.fileName
		}
		const ext = languageExtensionMap[doc.languageId] || doc.languageId
		return path.join(
			...compact([
				workspace.getWorkspaceFolder(doc.uri) as unknown,
				`${doc.fileName}.${ext}`,
			]),
		)
	}
}

/**
 * Convert .editorconfig values to vscode editor options
 */
export function fromEditorConfig(
	config: editorconfig.KnownProps = {},
	defaults: TextEditorOptions = pickWorkspaceDefaults(),
): TextEditorOptions {
	const resolved: TextEditorOptions = {
		tabSize:
			config.indent_style === 'tab'
				? get(config, 'tab_width', config.indent_size)
				: get(config, 'indent_size', config.tab_width),
	}
	if (get(resolved, 'tabSize') === 'tab') {
		resolved.tabSize = config.tab_width
	}
	return {
		...(config.indent_style === 'tab' ||
		config.indent_size === 'tab' ||
		config.indent_style === 'space'
			? {
					insertSpaces: config.indent_style === 'space',
			  }
			: {}),
		tabSize: resolved.tabSize >= 0 ? resolved.tabSize : defaults.tabSize,
	}
}

/**
 * Convert vscode editor options to .editorconfig values
 */
export function toEditorConfig(options: TextEditorOptions) {
	const result: editorconfig.KnownProps = {}

	switch (options.insertSpaces) {
		case true:
			result.indent_style = 'space'
			result.indent_size = resolveTabSize(options.tabSize)
			break
		case false:
		case 'auto':
			result.indent_style = 'tab'
			result.tab_width = resolveTabSize(options.tabSize)
			break
	}

	return result

	/**
	 * Convert vscode tabSize option into numeric value
	 */
	function resolveTabSize(tabSize: number | string) {
		return tabSize === 'auto' ? 4 : parseInt(String(tabSize), 10)
	}
}
