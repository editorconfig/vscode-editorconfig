import * as assert from 'assert';
import * as Utils from '../src/Utils';

suite('EditorConfig extension', () => {

	// Defines a Mocha unit test
	test('Utils.fromEditorConfig', () => {
		[
			{
				config: {
					indent_style: 'tab',
					indent_size: 5
				},
				defaults: {
					insertSpaces: false,
					tabSize: 4
				},
				expected: {
					insertSpaces: false,
					tabSize: 5
				}
			},
			{
				config: {
					indent_style: 'tab',
					tab_width: 5
				},
				defaults: {
					insertSpaces: false,
					tabSize: 4
				},
				expected: {
					insertSpaces: false,
					tabSize: 5
				}
			},
			{
				config: {
					indent_style: 'space',
					indent_size: 5
				},
				defaults: {
					insertSpaces: false,
					tabSize: 4
				},
				expected: {
					insertSpaces: true,
					tabSize: 5
				}
			},
			{
				config: {
					indent_size: 5
				},
				defaults: {
					insertSpaces: false,
					tabSize: 4
				},
				expected: {
					insertSpaces: false,
					tabSize: 5
				}
			},
			{
				config: {
					tab_width: 5
				},
				defaults: {
					insertSpaces: false,
					tabSize: 4
				},
				expected: {
					insertSpaces: false,
					tabSize: 5
				}
			},
			{
				config: {
					indent_size: 5
				},
				defaults: {
					insertSpaces: true,
					tabSize: 4
				},
				expected: {
					insertSpaces: true,
					tabSize: 5
				}
			},
			{
				config: {
					tab_width: 5
				},
				defaults: {
					insertSpaces: true,
					tabSize: 4
				},
				expected: {
					insertSpaces: true,
					tabSize: 5
				}
			},
			{
				config: {
					indent_style: 'space'
				},
				defaults: {
					insertSpaces: false,
					tabSize: 4
				},
				expected: {
					insertSpaces: true,
					tabSize: 4
				}
			},
			{
				config: {
					indent_style: 'space'
				},
				defaults: {
					insertSpaces: false,
					tabSize: 5
				},
				expected: {
					insertSpaces: true,
					tabSize: 5
				}
			},
			{
				config: {
					indent_size: 'tab',
					tab_width: 3
				},
				defaults: {
					insertSpaces: false,
					tabSize: 5
				},
				expected: {
					insertSpaces: false,
					tabSize: 3
				}
			},
			{
				config: {},
				defaults: {
					insertSpaces: false,
					tabSize: 5
				},
				expected: {
					insertSpaces: false,
					tabSize: 5
				}
			},
			{
				config: {},
				defaults: {
					insertSpaces: true,
					tabSize: 4
				},
				expected: {
					insertSpaces: true,
					tabSize: 4
				}
			},
			{
				config: {
					indent_size: 2,
					indent_style: 'space',
					tab_width: 4
				},
				defaults: {},
				expected: {
					insertSpaces: true,
					tabSize: 2
				}
			}
		].forEach(scenario => {
			assert.deepEqual(
				Utils.fromEditorConfig(
					scenario.config,
					scenario.defaults
				),
				scenario.expected
			);
		});
	});

	test('Utils.toEditorConfig', () => {
		[
			{
				options: {
					insertSpaces: true,
					tabSize: 5
				},
				expected: {
					indent_style: 'space',
					indent_size: 5
				}
			},
			{
				options: {
					insertSpaces: false,
					tabSize: 6
				},
				expected: {
					indent_style: 'tab',
					tab_width: 6
				}
			},
			{
				options: {
					insertSpaces: false,
					tabSize: 'auto'
				},
				expected: {
					indent_style: 'tab',
					tab_width: 4
				}
			},
			{
				options: {
					insertSpaces: 'auto',
					tabSize: 7
				},
				expected: {
					indent_style: 'tab',
					tab_width: 7
				}
			},
			{
				options: {
					insertSpaces: 'auto',
					tabSize: 'auto'
				},
				expected: {
					indent_style: 'tab',
					tab_width: 4
				}
			}
		].forEach(scenario => {
			assert.deepEqual(
				Utils.toEditorConfig(
					scenario.options
				),
				scenario.expected
			);
		});
	});
});
