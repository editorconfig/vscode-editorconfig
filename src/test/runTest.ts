import * as path from 'path'

import { runTests } from 'vscode-test'

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../')

		// The path to the extension test script
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index')

		// Download VS Code, unzip it and run the integration test
		await runTests({ extensionDevelopmentPath, extensionTestsPath })

		// Run test using a specific workspace
		const untitledExtensionTestsPath = path.resolve(
			__dirname,
			'./untitled-suite/index',
		)
		const untitledWorkspace = path.resolve(
			__dirname,
			'./untitled-suite/fixtures/untitled',
		)
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath: untitledExtensionTestsPath,
			launchArgs: [untitledWorkspace],
		})
	} catch (err) {
		// tslint:disable-next-line:no-console
		console.error('Failed to run tests')
		process.exit(1)
	}
}

main()
