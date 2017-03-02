import * as editorconfig from 'editorconfig';
import {
	TextDocument
} from 'vscode';

export interface EditorConfigProvider {
	getSettingsForDocument(document: TextDocument): editorconfig.knownProps;
	getDefaultSettings();
}
