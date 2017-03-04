import * as assert from 'assert';
import {
	Position,
	window,
	workspace,
	WorkspaceEdit
} from 'vscode';
import {
	getFixturePath,
	getOptionsForFixture
} from './testUtils';

import * as utils from 'vscode-test-utils';

suite('EditorConfig extension', () => {

	suiteTeardown(utils.closeAllFiles);

	test('indent_style = tab; tab_width = n', async () => {
		for (const n of [2, 3, 4]) {
			const options = await getOptionsForFixture([`tab-width-${n}`]);
			assert.strictEqual(
				options.insertSpaces,
				false,
				`editor has insertSpaces: false`
			);
			assert.strictEqual(
				options.tabSize,
				n,
				`editor has a tabSize of ${n}`
			);
		}
	});

	test('indent_style = space; indent_size = n', async () => {
		for (const n of [2, 3, 4]) {
			const options = await getOptionsForFixture([`indent-size-${n}`]);
			assert.strictEqual(
				options.insertSpaces,
				true,
				`editor has insertSpaces: true`
			);
			assert.strictEqual(
				options.tabSize,
				n,
				`editor has a tabSize of ${n}`
			);
		}
	});

	test('subfolder settings', async () => {
		for (const n of [2, 3, 4, 'x']) {
			const options = await getOptionsForFixture(['folder', `tab-width-${n}`]);
			const expectedTabSize = (n === 'x') ? 8 : n;
			assert.strictEqual(
				options.insertSpaces,
				false,
				`editor has insertSpaces: false`
			);
			assert.strictEqual(
				options.tabSize,
				expectedTabSize,
				`editor has a tabSize of ${expectedTabSize}`
			);
		}
	});

	test.skip('insert_final_newline = true', async (done) => {
		const savedText = await withSetting(
			'insert_final_newline',
			'true'
		).saveText('foo');
		assert.strictEqual(savedText, 'foo\n',
			'editor inserts final newline on save');
		done();
	});

	test('insert_final_newline = false', async () => {
		const savedText = await withSetting(
			'insert_final_newline',
			'false'
		).saveText('foo\n');
		assert.strictEqual(savedText, 'foo\n',
			'editor preserves final newline on save');
	});

	test.skip('trim_trailing_whitespace = true', async () => {
		const savedText = await withSetting(
			'trim_trailing_whitespace',
			'true'
		).saveText('foo  ');
		assert.strictEqual(savedText, 'foo',
			'editor trims trailing whitespace on save');
	});

	test('trim_trailing_whitespace = false', async () => {
		const savedText = await withSetting(
			'trim_trailing_whitespace',
			'false'
		).saveText('foo  ');
		assert.strictEqual(savedText, 'foo  ',
			'editor preserves trailing whitespace on save');
	});

	test('end_of_line = lf', async (done) => {
		const doc = await withSetting(
			'end_of_line',
			'lf',
			{
				contents: 'foo\r\n'
			}
		).doc;
		setTimeout(() => {
			assert.strictEqual(doc.getText(), 'foo\n',
				'editor converts CRLF line endings into LF on open');
			done();
		}, 25);
	});

	test('end_of_line = crlf', async (done) => {
		const doc = await withSetting(
			'end_of_line',
			'crlf',
			{
				contents: 'foo\n'
			}
		).doc;
		setTimeout(() => {
			assert.strictEqual(doc.getText(), 'foo\r\n',
				'editor converts LF line endings into CRLF on open');
			done();
		}, 25);
	});

	test('end_of_line = preserve', async (done) => {
		const doc = await withSetting(
			'end_of_line',
			'preserve',
			{
				contents: 'foo\r\n'
			}
		).doc;
		setTimeout(() => {
			assert.strictEqual(doc.getText(), 'foo\r\n',
				'editor preserves CRLF line endings on open');
			done();
		}, 25);
	});

	test('end_of_line = undefined', async (done) => {
		const doc = await withSetting(
			'end_of_line',
			'undefined',
			{
				contents: 'foo\r\n'
			}
		).doc;
		setTimeout(() => {
			assert.strictEqual(doc.getText(), 'foo\r\n',
				'editor preserves CRLF line endings on open');
			done();
		}, 25);
	});

	test('detect indentation', async (done) => {
		const options = await getOptionsForFixture([
			'detect-indentation',
			'indent-size-2'
		]);

		assert.strictEqual(
			options.tabSize,
			2,
			'editor has no tabSize defined'
		);

		assert.strictEqual(
			options.insertSpaces,
			true,
			'editor has no insertSpaces defined'
		);

		done();
	});
});

function withSetting(
	rule: string,
	value: string,
	options?: {
		contents?: string;
		saves?: number;
	}
) {
	options = options || {};
	return {
		doc: createDoc(options.contents),
		saveText: async (text: string) => {
			const doc = await createDoc();
			const edit = new WorkspaceEdit();
			edit.insert(doc.uri, new Position(0, 0), text);
			assert.strictEqual(
				await workspace.applyEdit(edit),
				true,
				'applies edit'
			);
			return await new Promise(resolve => {
				workspace.onDidSaveTextDocument(savedDoc => {
					resolve(savedDoc.getText());
				});
				doc.save();
			});
		}
	};

	async function createDoc(contents?: string) {
		const filename = await utils.createFile(contents || '', getFixturePath([
			rule,
			value,
			'test'
		]));
		const doc = await workspace.openTextDocument(filename);
		await window.showTextDocument(doc);
		return doc;
	}
}
