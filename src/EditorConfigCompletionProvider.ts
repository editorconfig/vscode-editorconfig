import { CompletionItemProvider, CompletionItem, CompletionItemKind, CancellationToken } from 'vscode'
import { TextDocument, Range, Position } from 'vscode'

class EditorConfigCompletionProvider implements CompletionItemProvider {

	private properties: Property[] = [
		new Property("root", ["true", "false"]),
		new Property("charset", ["utf-8", "utf-8-bom", "utf-16be", "utf-16le", "latin1"]),
		new Property("end_of_line", ["lf", "cr", "crlf"]),
		new Property("indent_style", ["tab", "space"]),
		new Property("indent_size", ["1", "2", "3", "4", "5", "6", "7", "8"]),
		new Property("insert_final_newline", ["true", "false"]),
		new Property("tab_width", ["1", "2", "3", "4", "5", "6", "7", "8"]),
		new Property("trim_trailing_whitespace", ["true", "false"])
	];

	// =========================================================================
	// PUBLIC INTERFACE
	public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken): CompletionItem[] {
		// get text where code completion was activated
		let rangeFromLineStart = new Range(new Position(position.line, 0), position);
		let lineText = document.getText(rangeFromLineStart);

		// check if checking for property names or values
		if (lineText.indexOf("=") >= 0) {
			let propertyName = this.extractPropertyName(lineText);
			let propertyValues = this.filterPropertyValues(propertyName);
			return this.convertPropertyValuesToCompletionItems(propertyValues);
		} else {
			return this.convertPropertyNamesToCompletionItems(this.properties);
		}
	}

	// =========================================================================
	// PARSING
	private extractPropertyName(lineText: string): string {
		let lineTextParts = lineText.split("=");
		if (lineTextParts.length == 0) {
			return "";
		}
		let propertyName = lineTextParts[0].trim().toLowerCase();
		return propertyName;
	}

	// =========================================================================
	// FILTERING
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
	private convertPropertyNamesToCompletionItems(properties: Property[]): CompletionItem[] {
		return properties.map(property => new CompletionItem(property.name, CompletionItemKind.Property));
	}

	private convertPropertyValuesToCompletionItems(values: string[]): CompletionItem[] {
		return values.map(value => new CompletionItem(value, CompletionItemKind.Value));
	}
}
class Property {
	name: string;
	values: string[];

	constructor(name: string, values: string[]) {
		this.name = name;
		this.values = values;
	}
}

export default EditorConfigCompletionProvider;
