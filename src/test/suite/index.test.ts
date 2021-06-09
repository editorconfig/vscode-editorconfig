import * as assert from 'assert'
import * as os from 'os'
import { Position, window, workspace, WorkspaceEdit } from 'vscode'
import { getFixturePath, getOptionsForFixture, wait } from '../testUtils'

import * as utils from 'vscode-test-utils'

suite('EditorConfig extension', function () {
	this.retries(2)
	suiteTeardown(utils.closeAllFiles)

	test('indent_style = tab; tab_width = n', async () => {
		for (const n of [2, 3, 4]) {
			const options = await getOptionsForFixture([`tab-width-${n}`])
			assert.strictEqual(
				options.insertSpaces,
				false,
				`editor has insertSpaces: true`,
			)
			assert.strictEqual(
				options.tabSize,
				n,
				`editor has a tabSize of ${options.tabSize} instead of ${n}`,
			)
		}
	})

	test('indent_style = space; indent_size = n', async () => {
		for (const n of [2, 3, 4]) {
			const options = await getOptionsForFixture([`indent-size-${n}`])
			assert.strictEqual(
				options.insertSpaces,
				true,
				`editor has insertSpaces: false`,
			)
			assert.strictEqual(
				options.tabSize,
				n,
				`editor has a tabSize of ${options.tabSize} instead of ${n}`,
			)
		}
	})

	test('subfolder settings', async () => {
		for (const n of [2, 3, 4, 'x']) {
			const options = await getOptionsForFixture(['folder', `tab-width-${n}`])
			const expectedTabSize = n === 'x' ? 8 : n
			assert.strictEqual(
				options.insertSpaces,
				false,
				`editor has insertSpaces: true`,
			)
			assert.strictEqual(
				options.tabSize,
				expectedTabSize,
				`editor has a tabSize of ${options.tabSize} instead of ${expectedTabSize}`,
			)
		}
	})

	test('insert_final_newline = true', async () => {
		const savedText = await withSetting(
			'insert_final_newline',
			'true',
		).saveText('foo')
		assert.strictEqual(
			savedText,
			`foo${os.EOL}`,
			'editor fails to insert final newline on save',
		)
	})

	test('insert_final_newline = false', async () => {
		const text = `foo${os.EOL}`
		const savedText = await withSetting(
			'insert_final_newline',
			'false',
		).saveText(text)
		assert.strictEqual(
			savedText,
			text,
			'editor fails to preserve final newline on save',
		)
	})

	test('insert_final_newline = unset', async () => {
		const text = `foo${os.EOL}`
		const savedText1 = await withSetting(
			'insert_final_newline',
			'unset',
		).saveText(text)
		assert.strictEqual(
			savedText1,
			text,
			'editor fails to preserve final newline on save',
		)

		const savedText2 = await withSetting(
			'insert_final_newline',
			'unset-2',
		).saveText('foo')
		assert.strictEqual(
			savedText2,
			'foo',
			'editor fails to preserve no final newline on save',
		)
	})

	test('trim_trailing_whitespace = true', async () => {
		const savedText = await withSetting(
			'trim_trailing_whitespace',
			'true',
		).saveText('foo  ')
		assert.strictEqual(
			savedText,
			'foo',
			'editor fails to trim trailing whitespace on save',
		)
	})

	test('trim_trailing_whitespace = false', async () => {
		const savedText = await withSetting(
			'trim_trailing_whitespace',
			'false',
		).saveText('foo  ')
		assert.strictEqual(
			savedText,
			'foo  ',
			'editor fails to preserve trailing whitespace on save',
		)
	})

	test('trim_trailing_whitespace = unset', async () => {
		const savedText = await withSetting(
			'trim_trailing_whitespace',
			'unset',
		).saveText('foo  ')
		assert.strictEqual(
			savedText,
			'foo  ',
			'editor fails to preserve trailing whitespace on save',
		)
	})

	test('end_of_line = lf', async () => {
		const savedText = await withSetting('end_of_line', 'lf').saveText('foo\r\n')
		assert.strictEqual(
			savedText,
			'foo\n',
			'editor fails to convert CRLF line endings into LF on save',
		)
	})

	test('end_of_line = crlf', async () => {
		const savedText = await withSetting('end_of_line', 'crlf').saveText('foo\n')
		assert.strictEqual(
			savedText,
			'foo\r\n',
			'editor fails to convert LF line endings into CRLF on save',
		)
	})

	test('end_of_line = unset', async () => {
		const savedText = await withSetting('end_of_line', 'unset', {
			contents: '\r\n',
		}).saveText('foo')
		assert.strictEqual(
			savedText,
			'foo\r\n',
			'editor fails to preserve CRLF line endings on save',
		)
	})

	test('detect indentation (space, empty root)', async () => {
		const options = await getOptionsForFixture([
			'detect-indentation',
			'root',
			'indent-style-space',
		])
		const expectedTabSize = 2
		assert.strictEqual(
			options.tabSize,
			expectedTabSize,
			`editor has a tabSize of ${options.tabSize} instead of ${expectedTabSize}`,
		)
		assert.strictEqual(
			options.insertSpaces,
			true,
			`editor has insertSpaces: ${options.insertSpaces}`,
		)
	})

	test('detect indentation (tab, empty root)', async () => {
		const options = await getOptionsForFixture([
			'detect-indentation',
			'root',
			'indent-style-tab',
		])
		const expectedTabSize = 4
		assert.strictEqual(
			options.tabSize,
			expectedTabSize,
			`editor has a tabSize of ${options.tabSize} instead of ${expectedTabSize}`,
		)
		assert.strictEqual(
			options.insertSpaces,
			false,
			`editor has insertSpaces: ${options.insertSpaces}`,
		)
	})

	test('detect indentation (space, unset tab_width=8)', async () => {
		const options = await getOptionsForFixture([
			'detect-indentation',
			'tab_width',
			'indent-style-space',
		])
		const expectedTabSize = 2
		assert.strictEqual(
			options.tabSize,
			expectedTabSize,
			`editor has a tabSize of ${options.tabSize} instead of ${expectedTabSize}`,
		)
		assert.strictEqual(
			options.insertSpaces,
			true,
			`editor has insertSpaces: ${options.insertSpaces}`,
		)
	})

	test('detect indentation (tab, unset tab_width=4)', async () => {
		const options = await getOptionsForFixture([
			'detect-indentation',
			'tab_width',
			'indent-style-tab',
		])
		const expectedTabSize = 4
		assert.strictEqual(
			options.tabSize,
			expectedTabSize,
			`editor has a tabSize of ${options.tabSize} instead of ${expectedTabSize}`,
		)
		assert.strictEqual(
			options.insertSpaces,
			false,
			`editor has insertSpaces: ${options.insertSpaces}`,
		)
	})

	test('detect indentation (space, unset)', async () => {
		const options = await getOptionsForFixture([
			'detect-indentation',
			'unset',
			'indent-style-space',
		])
		const expectedTabSize = 2
		assert.strictEqual(
			options.tabSize,
			expectedTabSize,
			`editor has a tabSize of ${options.tabSize} instead of ${expectedTabSize}`,
		)
		assert.strictEqual(
			options.insertSpaces,
			true,
			`editor has insertSpaces: ${options.insertSpaces}`,
		)
	})

	test('detect indentation (tab, unset)', async () => {
		const options = await getOptionsForFixture([
			'detect-indentation',
			'unset',
			'indent-style-tab',
		])
		const expectedTabSize = 4
		assert.strictEqual(
			options.tabSize,
			expectedTabSize,
			`editor has a tabSize of ${options.tabSize} instead of ${expectedTabSize}`,
		)
		assert.strictEqual(
			options.insertSpaces,
			false,
			`editor has insertSpaces: ${options.insertSpaces}`,
		)
	})
})

function withSetting(
	rule: string,
	value: string,
	options: {
		contents?: string
	} = {},
) {
	return {
		async getText() {
			return (await createDoc(options.contents)).getText()
		},
		saveText(text: string) {
			return new Promise<string>(async resolve => {
				const doc = await createDoc(options.contents)
				workspace.onDidChangeTextDocument(doc.save)
				workspace.onDidSaveTextDocument(savedDoc => {
					assert.strictEqual(savedDoc.isDirty, false, 'dirty saved doc')
					resolve(savedDoc.getText())
				})
				const edit = new WorkspaceEdit()
				edit.insert(doc.uri, new Position(0, 0), text)
				assert.strictEqual(
					await workspace.applyEdit(edit),
					true,
					'editor fails to apply edit',
				)
			})
		},
	}

	async function createDoc(contents = '') {
		const uri = await utils.createFile(
			contents,
			getFixturePath([rule, value, 'test']),
		)
		const doc = await workspace.openTextDocument(uri)
		await window.showTextDocument(doc)
		await wait(50) // wait for EditorConfig to apply new settings
		return doc
	}
}
