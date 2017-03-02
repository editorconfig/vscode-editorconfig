import { CompletionItemProvider, CompletionItem, CompletionItemKind, CancellationToken } from 'vscode'
import { TextDocument, Range, Position } from 'vscode'

class EditorConfigCompletionProvider implements CompletionItemProvider {

	private readonly properties: Property[] = [
		new Property('root', ['true', 'false', 'unset'], 'Special property that should be specified at the top of the file outside of any sections. Set to true to stop .editorconfig files search on current file.'),
		new Property('charset', ['utf-8', 'utf-8-bom', 'utf-16be', 'utf-16le', 'latin1', 'unset'], 'Set to latin1, utf-8, utf-8-bom, utf-16be or utf-16le to control the character set. Use of utf-8-bom is discouraged.'),
		new Property('end_of_line', ['lf', 'cr', 'crlf', 'unset'], 'Set to lf, cr, or crlf to control how line breaks are represented.'),
		new Property('indent_style', ['tab', 'space', 'unset'], 'Set to tab or space to use hard tabs or soft tabs respectively.'),
		new Property('indent_size', ['1', '2', '3', '4', '5', '6', '7', '8', 'unset'], ' A whole number defining the number of columns used for each indentation level and the width of soft tabs (when supported). When set to tab, the value of tab_width (if specified) will be used.'),
		new Property('insert_final_newline', ['true', 'false', 'unset'], 'Set to true to ensure file ends with a newline when saving and false to ensure it doesn\'t.'),
		new Property('tab_width', ['1', '2', '3', '4', '5', '6', '7', '8', 'unset'], 'A whole number defining the number of columns used to represent a tab character. This defaults to the value of indent_size and doesn\'t usually need to be specified.'),
		new Property('trim_trailing_whitespace', ['true', 'false', 'unset'], 'Set to true to remove any whitespace characters preceding newline characters and false to ensure it doesn\'t.')
	];

	// =========================================================================
	// PUBLIC INTERFACE
	// =========================================================================
	public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): CompletionItem[] {
		// get text where code completion was activated
		let rangeFromLineStart = new Range(new Position(position.line, 0), position);
		let lineText = document.getText(rangeFromLineStart);

		// check if checking for property names or values
		let lineTextHasPropertyName = lineText.indexOf('=') >= 0;

		if (lineTextHasPropertyName) {
			return this.autoCompletePropertyValues(lineText);
		} else {
			return this.autoCompletePropertyNames();
		}
	}

	public resolveCompletionItem(item: CompletionItem, token: CancellationToken): CompletionItem {
		return item;
	}

	// =========================================================================
	// AUTO COMPLETE
	// =========================================================================
	private autoCompletePropertyValues(lineText: string): CompletionItem[] {
		let propertyName = this.extractPropertyName(lineText);
		let propertyValues = this.filterPropertyValues(propertyName);
		return this.convertPropertyValuesToCompletionItems(propertyValues);
	}

	private autoCompletePropertyNames(): CompletionItem[] {
		return this.convertPropertyNamesToCompletionItems(this.properties);
	}

	// =========================================================================
	// PARSER
	// =========================================================================
	private extractPropertyName(lineText: string): string {
		let lineTextParts = lineText.split('=');
		if (lineTextParts.length == 0) {
			return '';
		}
		let propertyName = lineTextParts[0].trim().toLowerCase();
		return propertyName;
	}

	// =========================================================================
	// FILTERS
	// =========================================================================
	private filterPropertyValues(propertyName: string): string[] {
		// filter
		let matchingProperty = this.properties.find(property => property.name == propertyName);

		// if not found anything, there are no values to display
		if (matchingProperty == undefined) {
			return [];
		}

		// return values of the property
		return matchingProperty.values;
	}

	// =========================================================================
	// CONVERTERS
	// =========================================================================
	private convertPropertyNamesToCompletionItems(properties: Property[]): CompletionItem[] {
		return properties.map(property => {
			let completionItem = new CompletionItem(property.name, CompletionItemKind.Property);
			completionItem.documentation = property.description;
			return completionItem;
		});
	}

	private convertPropertyValuesToCompletionItems(values: string[]): CompletionItem[] {
		return values.map(value => new CompletionItem(value, CompletionItemKind.Value));
	}
}

class Property {
	name: string;
	values: string[];
	description: string;

	constructor(name: string, values: string[], description: string) {
		this.name = name;
		this.values = values;
		this.description = description;
	}
}

export default EditorConfigCompletionProvider;
