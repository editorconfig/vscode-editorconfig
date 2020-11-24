import { FileType, Uri, window, workspace } from 'vscode'

/**
 * Generate a .editorconfig file in the root of the workspace based on the
 * current vscode settings.
 */
export async function generateEditorConfig(uri: Uri) {
	const workspaceUri =
		workspace.workspaceFolders && workspace.workspaceFolders[0].uri
	const currentUri = uri || workspaceUri
	if (!currentUri) {
		window.showErrorMessage("Workspace doesn't contain any folders.")
		return
	}

	const editorConfigUri = Uri.parse(`${currentUri.toString()}/.editorconfig`)

	try {
		const stats = await workspace.fs.stat(editorConfigUri)
		if (stats.type === FileType.File) {
			window.showErrorMessage(
				'An .editorconfig file already exists in this workspace.',
			)
			return
		}
	} catch (err) {
		if (err) {
			if (err.name === 'EntryNotFound (FileSystemError)') {
				writeFile()
			} else {
				window.showErrorMessage(err.message)
			}
			return
		}
	}

	async function writeFile() {
		const editor = workspace.getConfiguration('editor', currentUri)
		const files = workspace.getConfiguration('files', currentUri)

		const settingsLines = [
			'# EditorConfig is awesome: https://EditorConfig.org',
			'',
			'# top-most EditorConfig file',
			'root = true',
			'',
			'[*]',
		]
		function addSetting(key: string, value?: string | number | boolean): void {
			if (value !== undefined) {
				settingsLines.push(`${key} = ${value}`)
			}
		}

		const insertSpaces = editor.get<boolean>('insertSpaces')

		addSetting('indent_style', insertSpaces ? 'space' : 'tab')

		addSetting('indent_size', editor.get<number>('tabSize'))

		const eolMap = {
			'\r\n': 'crlf',
			'\n': 'lf',
		}
		addSetting(
			'end_of_line',
			eolMap[files.get<string>('eol') as keyof typeof eolMap],
		)

		const encodingMap = {
			iso88591: 'latin1',
			utf8: 'utf-8',
			utf8bom: 'utf-8-bom',
			utf16be: 'utf-16-be',
			utf16le: 'utf-16-le',
		}
		addSetting(
			'charset',
			encodingMap[files.get<string>('encoding') as keyof typeof encodingMap],
		)

		addSetting(
			'trim_trailing_whitespace',
			files.get<boolean>('trimTrailingWhitespace'),
		)

		const insertFinalNewline = files.get<boolean>('insertFinalNewline')
		addSetting('insert_final_newline', insertFinalNewline)

		if (insertFinalNewline) {
			settingsLines.push('')
		}

		try {
			await workspace.fs.writeFile(
				editorConfigUri,
				Buffer.from(settingsLines.join('\n')),
			)
		} catch (err) {
			if (err) {
				window.showErrorMessage(err.message)
				return
			}
		}
	}
}
