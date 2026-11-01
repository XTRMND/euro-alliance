// Lighthouse CI's puppeteerScript: stores a cookie choice in the browser before each run, so the
// consent banner isn't measured on every page (the e2e suite does the same with
// tests/e2e/consented.json; tests/e2e/consent.spec.ts covers the first visit). A Cookie request
// header isn't enough: the page's head script reads document.cookie. Lighthouse's storage reset
// leaves cookies alone and still clears the cache.

const choice = { v: 1, ts: 1798761600000, functional: false, statistics: false, marketing: false }

module.exports = async (browser, { url }) => {
  const page = await browser.newPage()
  await page.setCookie({
    name: 'ea_consent',
    value: encodeURIComponent(JSON.stringify(choice)),
    url: new URL(url).origin,
  })
  await page.close()
}
