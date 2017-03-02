import * as fs from 'fs';
import * as path from 'path';
import {
	workspace,
	window
} from 'vscode';
import * as Utils from '../Utils';

const propsToGenerate = [
	'indent_style',
	'indent_size',
	'tab_width'
];

/**
 * Generate a .editorconfig file in the root of the workspace based on the
 * current vscode settings.
 */
export function generateEditorConfig() {
	if (!workspace.rootPath) {
		window.showInformationMessage(
			'Please open a folder before generating an .editorconfig file'
		);
		return;
	}

	const editorConfigFile = path.join(workspace.rootPath, '.editorconfig');

	fs.stat(editorConfigFile, (err, stats) => {

		if (err) {
			if (err.code === 'ENOENT') {
				writeFile();
			} else {
				window.showErrorMessage(err.message);
			}
			return;
		}

		if (stats.isFile()) {
			window.showErrorMessage(
				'A .editorconfig file already exists in your workspace.'
			);
		}
	});

	function writeFile() {
		const contents = ['root = true', '', '[*]'];
		const editorConfigurationNode = workspace.getConfiguration('editor');
		const settings = Utils.toEditorConfig({
			insertSpaces: editorConfigurationNode
				.get<string | boolean>('insertSpaces'),
			tabSize: editorConfigurationNode
				.get<string | number>('tabSize')
		});

		for (const setting of propsToGenerate) {
			if (settings.hasOwnProperty(setting)) {
				contents.push(`${setting} = ${settings[setting]}`);
			}
		}

		fs.writeFile(editorConfigFile, contents.join('\n'), err => {
			if (err) {
				window.showErrorMessage(err.message);
				return;
			}
		});
	}
}
