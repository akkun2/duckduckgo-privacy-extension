/**
 *  Tests for fingerprinting, these tests load a example website server.
 */

/* global dbg:false */
const harness = require('../helpers/harness')
const { setupServer } = require('../helpers/server')

let browser
let bgPage

describe('Canvas verification', () => {
    beforeAll(async () => {
        ({ browser, bgPage } = await harness.setup())

        // wait for HTTPs to successfully load
        await bgPage.waitForFunction(
            () => window.dbg && dbg.https.isReady,
            { polling: 100, timeout: 6000 }
        )
    })
    afterAll(async () => {
        await harness.teardown(browser)
    })

    it('Canvas drawing should be different per hostname', async () => {
        const hostnames = [
            'bad.third-party.site',
            'good.third-party.site',
            'broken.third-party.site'
        ]
        const hostnameResults = {}
        for (const hostname of hostnames) {
            const page = await browser.newPage()
            await page.goto(`https://${hostname}/features/canvas-draw.html`, { waitUntil: 'networkidle0' })
            // Wait for injection; will be resolved with MV3 changes
            await page.waitForFunction(
                () => navigator.globalPrivacyControl,
                { polling: 100, timeout: 6000 }
            )
            await page.evaluate(() => {
                document.getElementById('draw-same').click()
            })
            await page.waitForFunction(
                () => results && results.complete,
                { polling: 100, timeout: 6000 }
            )
            const results = await page.evaluate(() => results)
            results.results.forEach((a) => {
                if (!(a.id in hostnameResults)) {
                    hostnameResults[a.id] = new Set()
                }
                hostnameResults[a.id].add(a.value)
            })
        }

        // Check that we have unique values for each hostname in the sets
        for (const key in hostnameResults) {
            expect(hostnameResults[key].size).toEqual(hostnames.length, `${key} must be different for all ${hostnames.length} hostnames`)
        }
    })

    it('Canvas should pass all verification tests', async () => {
        const page = await browser.newPage()
        await page.goto('https://bad.third-party.site/privacy-protections/fingerprinting/canvas.html?run', { waitUntil: 'networkidle0' })
        await page.waitForFunction(
            () => results && results.complete,
            { polling: 100, timeout: 6000 }
        )
        const results = await page.evaluate(() => results)

        expect(results.didFail).toEqual(false)
        // Help debug the error
        if (results.didFail) {
            expect(results.fails).toEqual([])
        }
    })
})

async function getFingerprintOfContext (ctx) {
    await ctx.addScriptTag({ path: 'node_modules/@fingerprintjs/fingerprintjs/dist/fp.js' })
    return ctx.evaluate(() => {
        /* global FingerprintJS */
        return (async () => {
            const fp = await FingerprintJS.load()
            return fp.get()
        })()
    })
}

const frameTests = [
    'http://127.0.0.1:8081',
    'http://127.0.0.1:8080'
]
let server
let server2

describe('First Party Fingerprint Randomization', () => {
    beforeAll(async () => {
        ({ browser, bgPage } = await harness.setup())
        server = await setupServer({}, 8080)
        server2 = await setupServer({}, 8081)

        // wait for HTTPs to successfully load
        await bgPage.waitForFunction(
            () => window.dbg && dbg.https.isReady,
            { polling: 100, timeout: 6000 }
        )
    })
    afterAll(async () => {
        await server.close()
        await server2.close()
        await harness.teardown(browser)
    })

    frameTests.forEach(iframeHost => {
        it(`Embedded same/cross-origin frames should match parent (frame: ${iframeHost})`, async () => {
            const page = await browser.newPage()
            // Load a page with an iframe from a different hostname
            await page.goto(`http://127.0.0.1:8080/index.html?host=${iframeHost}`, { waitUntil: 'networkidle0' })
            const fingerprint = await getFingerprintOfContext(page)

            const iframe = page.frames().find(iframe => iframe.url() === iframeHost + '/framed.html')
            const fingerprint2 = await getFingerprintOfContext(iframe)

            expect(fingerprint.components.canvas.value).toEqual(fingerprint2.components.canvas.value)
        })
    })
})
