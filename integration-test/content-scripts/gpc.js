/**
 *  Tests for injecting GPC into the page, these tests load a example website server.
 */

/* global dbg:false */
const harness = require('../helpers/harness')
const { setupServer } = require('../helpers/server')

let browser
let bgPage

function getGPCValueOfContext (ctx) {
    return ctx.evaluate(() => {
        return (async () => {
            return navigator.globalPrivacyControl
        })()
    })
}

const frameTests = [
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8080'
]

let server
let server2

describe('Ensure GPC is injected into frames', () => {
    beforeAll(async () => {
        ({ browser, bgPage } = await harness.setup())
        server = await setupServer({}, 8080)
        server2 = await setupServer({}, 8081)

        // wait for HTTPs to successfully load
        await bgPage.waitForFunction(
            () => window.dbg && dbg.https.isReady,
            { polling: 100, timeout: 10000 }
        )
    })
    afterAll(async () => {
        server.close()
        server2.close()
        await harness.teardown(browser)
    })

    frameTests.forEach(iframeHost => {
        it(`${iframeHost} frame should match the parent frame`, async () => {
            const page = await browser.newPage()
            // Load an page with an iframe from a different hostname
            await page.goto(`http://127.0.0.1:8080/index.html?host=${iframeHost}`, { waitUntil: 'networkidle0' })
            const gpc = await getGPCValueOfContext(page)

            const iframe = page.frames().find(iframe => iframe.url() === iframeHost + '/framed.html')
            const gpc2 = await getGPCValueOfContext(iframe)

            expect(gpc).toEqual(true)
            expect(gpc).toEqual(gpc2)
        })

        it(`${iframeHost} should work with about:blank injected frames`, async () => {
            const page = await browser.newPage()
            await page.goto('http://127.0.0.1:8080/blank_framer.html', { waitUntil: 'networkidle0' })
            const gpc = await getGPCValueOfContext(page)

            const iframe = page.frames().find(iframe => iframe.url() === 'about:blank')
            const gpc2 = await getGPCValueOfContext(iframe)

            expect(gpc).toEqual(true)
            expect(gpc).toEqual(gpc2)
        })
    })
})
