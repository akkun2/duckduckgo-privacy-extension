/**
 *  Tests for injecting navigator.ddg into the page
 */
const harness = require('../helpers/harness')
const { setupServer } = require('../helpers/server')

let browser
let server
let bgPage

describe('Ensure navigator.ddg is injected', () => {
    beforeAll(async () => {
        ({ browser, bgPage } = await harness.setup())
        server = await setupServer({})
        await bgPage.waitForFunction(
            () => window.dbg && window.dbg.https.isReady,
            { polling: 100, timeout: 10000 }
        )
    })
    afterAll(async () => {
        await server.close()
        await harness.teardown(browser)
    })

    it('should expose navigator.ddg.isExtension() === true', async () => {
        const page = await browser.newPage()
        // page.on('console', (msg) => console.log('PAGE LOG:', msg.text()))
        await page.goto(`http://127.0.0.1:${server.port}/blank.html`, { waitUntil: 'networkidle0' })
        const result = await page.evaluate(
            () => navigator.ddg.isExtension(),
            { polling: 100, timeout: 1000 }
        )
        expect(result).toEqual(true)
    })
})
