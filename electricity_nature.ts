import puppeteer from "puppeteer"

const ELECTRICITY_NATURE_COOKIE_DENKI_API =
  process.env.ELECTRICITY_NATURE_COOKIE_DENKI_API || ""

export const takeScreenshot = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 2 })
  await page.setCookie({
    name: "denki-api",
    value: ELECTRICITY_NATURE_COOKIE_DENKI_API,
    url: "https://electricity-api.nature.global/1",
  })
  await page.goto("https://electricity.nature.global/home")
  await page.waitForSelector("g")

  const today = await page.screenshot({
    clip: { x: 0, y: 990, width: 1000, height: 170 },
  })

  await page.click("div.selection button")
  await page.waitForTimeout(1000)

  const yesterday = await page.screenshot({
    clip: { x: 0, y: 282, width: 1000, height: 870 },
  })
  await browser.close()
  return [today, yesterday] as Buffer[]
}

takeScreenshot()
