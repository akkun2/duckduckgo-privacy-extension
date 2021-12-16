/**
 *  Tests for injecting navigator.ddg into the page
 */
const harness = require('../helpers/harness')
const { setupServer } = require('../helpers/server')

let browser
let server

describe('Ensure navigator.ddg is injected', () => {
    beforeAll(async () => {
        ({ browser } = await harness.setup())
        server = await setupServer({})
    })
    afterAll(async () => {
        await server.close()
        await harness.teardown(browser)
    })

    it('should expose navigator.ddg.isExtension() === true', async () => {
        const page = await browser.newPage()
        await page.goto(`http://127.0.0.1:${server.port}/blank.html`, { waitUntil: 'networkidle0' })
        const result = await page.evaluate(
            () => navigator.ddg.isExtension(),
            { polling: 100, timeout: 1000 }
        )
        expect(result).toEqual(true)
    })
})
