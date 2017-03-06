import {
	Command,
	CompletionItemProvider,
	CompletionItem,
	CompletionItemKind,
	Position,
	TextDocument
} from 'vscode';

class EditorConfigCompletionProvider implements CompletionItemProvider {

	private readonly properties: Property[] = [
		new Property(
			'root',
			[
				'true',
				'false',
				'unset'
			],
			[
				'Special property that should be specified at the top of the file',
				'outside of any sections. Set to true to stop .editorconfig files',
				'search on current file.'
			].join(' ')
		),
		new Property(
			'charset',
			[
				'utf-8',
				'utf-8-bom',
				'utf-16be',
				'utf-16le',
				'latin1',
				'unset'
			],
			[
				'Set to latin1, utf-8, utf-8-bom, utf-16be or utf-16le to control',
				'the character set. Use of utf-8-bom is discouraged.'
			].join(' ')
		),
		new Property(
			'end_of_line',
			[
				'lf',
				'cr',
				'crlf',
				'unset'
			],
			'Set to lf, cr, or crlf to control how line breaks are represented.'
		),
		new Property(
			'indent_style',
			[
				'tab',
				'space',
				'unset'
			],
			'Set to tab or space to use hard tabs or soft tabs respectively.'
		),
		new Property(
			'indent_size',
			[
				'1',
				'2',
				'3',
				'4',
				'5',
				'6',
				'7',
				'8',
				'unset'
			],
			[
				'A whole number defining the number of columns used for each',
				'indentation level and the width of soft tabs (when supported).',
				'When set to tab, the value of tab_width (if specified) will be',
				'used.'
			].join(' ')
		),
		new Property(
			'insert_final_newline',
			[
				'true',
				'false',
				'unset'
			],
			[
				'Set to true to ensure file ends with a newline when saving and',
				'false to ensure it doesn\'t.'
			].join(' ')
		),
		new Property(
			'tab_width',
			[
				'1',
				'2',
				'3',
				'4',
				'5',
				'6',
				'7',
				'8',
				'unset'
			],
			[
				'A whole number defining the number of columns used to represent a',
				'tab character. This defaults to the value of indent_size and',
				'doesn\'t usually need to be specified.'
			].join(' ')
		),
		new Property(
			'trim_trailing_whitespace',
			[
				'true',
				'false',
				'unset'
			],
			[
				'Set to true to remove any whitespace characters preceding newline',
				'characters and false to ensure it doesn\'t.'
			].join(' ')
		)
	];

	// =========================================================================
	// PUBLIC INTERFACE
	// =========================================================================
	public provideCompletionItems(
		document: TextDocument,
		position: Position
	): CompletionItem[] {
		// get text where code completion was activated
		// used to determine if autocompleting a key or a value
		const textOfEntireLine = document.getText(
			document.lineAt(position.line).range
		);
		const textOfLineUpToCursor = textOfEntireLine.substring(
			0, position.character
		);

		// conditionally generate autocomplete for property names or values
		if (this.hasPropertyKey(textOfLineUpToCursor)) {
			return this.autoCompletePropertyValues(textOfLineUpToCursor);
		} else {
			return this.autoCompletePropertyNames(textOfEntireLine);
		}
	}

	public resolveCompletionItem(
		item: CompletionItem
	): CompletionItem {
		// return the item itself because it already constains all the info
		// necessary to display the details
		return item;
	}

	// =========================================================================
	// AUTO COMPLETE
	// =========================================================================
	private autoCompletePropertyValues(
		textOfLineUpToCursor: string
	): CompletionItem[] {
		const propertyName = this.extractPropertyName(textOfLineUpToCursor);
		const propertyValues = this.filterPropertyValues(propertyName);
		return this.convertPropertyValuesToCompletionItems(propertyValues);
	}

	private autoCompletePropertyNames(
		textOfEntireLine: string
	): CompletionItem[] {
		return this.convertPropertyNamesToCompletionItems(
			this.properties,
			textOfEntireLine
		);
	}

	// =========================================================================
	// CHECKS
	// =========================================================================
	private hasPropertyKey(lineText: string): boolean {
		return this.hasEqualsSign(lineText);
	}

	private hasEqualsSign(lineText: string): boolean {
		return lineText.indexOf('=') >= 0;
	}

	// =========================================================================
	// PARSER
	// =========================================================================
	private extractPropertyName(lineText: string): string {
		const lineTextParts = lineText.split('=');
		if (lineTextParts.length === 0) {
			return '';
		}
		const propertyName = lineTextParts[0].trim().toLowerCase();
		return propertyName;
	}

	// =========================================================================
	// FILTERS
	// =========================================================================
	private filterPropertyValues(propertyName: string): string[] {
		// filter
		const matchingProperty = this.properties.find(
			property => property.name === propertyName
		);

		// if not found anything, there are no values to display
		if (matchingProperty === undefined) {
			return [];
		}

		// return values of the property
		return matchingProperty.values;
	}

	// =========================================================================
	// CONVERTERS
	// =========================================================================
	private convertPropertyNamesToCompletionItems(
		properties: Property[],
		textOfEntireLine: string
	): CompletionItem[] {

		const triggerSuggestCommand: Command = {
			command: 'editorconfig._triggerSuggestAfterDelay',
			arguments: [],
			title: ''
		};

		return properties.map(property => {
			// basic info
			const completionItem = new CompletionItem(
				property.name,
				CompletionItemKind.Property
			);
			completionItem.documentation = property.description;

			// append equals sign if line does not have one
			// also automatically displays IntelliSense for property values
			if (!this.hasEqualsSign(textOfEntireLine)) {
				completionItem.insertText = property.name + ' = ';
				completionItem.command = triggerSuggestCommand;
			}

			return completionItem;
		});
	}

	private convertPropertyValuesToCompletionItems(
		values: string[]
	): CompletionItem[] {
		const valuesSortOrder = {
			true: '1',
			false: '2',
			unset: '9'
		};
		return values.map(
			value => {
				// basic info
				const completionItem = new CompletionItem(value, CompletionItemKind.Value);

				// sort predefined values to specific order
				completionItem.sortText = valuesSortOrder[value] || '3' + value;
				return completionItem;
			}
		);
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
