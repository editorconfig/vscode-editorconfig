import * as glob from 'glob'
import * as Mocha from 'mocha'
import * as path from 'path'

export function run(): Promise<void> {
	// Create the mocha test
	const mocha = new Mocha({
		color: true,
		timeout: 5000,
		ui: 'tdd',
	})

	return new Promise((c, e) => {
		glob('./**/*.test.js', { cwd: __dirname }, (err, files) => {
			if (err) {
				return e(err)
			}

			// Add files to the test suite
			files.forEach(f => mocha.addFile(path.resolve(__dirname, f)))

			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`))
					} else {
						c()
					}
				})
			} catch (err) {
				e(err)
			}
		})
	})
}
