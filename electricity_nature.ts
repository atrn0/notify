import CDP from "chrome-remote-interface"
import fs from "fs"

const url = "https://electricity.nature.global/home"
const format = "png"
const viewportWidth = 375
const viewportHeight = 2000
const delay = 5000
const fullPage = true

;(() => {
  CDP(async (client) => {
    const { DOM, Emulation, Network, Page } = client
    await Page.enable()
    await DOM.enable()
    await Network.enable({})
    const deviceMetrics = {
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor: 0,
      mobile: false,
      fitWindow: false,
    }
    await Emulation.setDeviceMetricsOverride(deviceMetrics)
    await Emulation.setVisibleSize({
      width: viewportWidth,
      height: viewportHeight,
    })

    await Network.setCookie({
      name: "denki-api",
      value: "",
      url: "https://electricity-api.nature.global/1",
    })
    await Page.navigate({ url })

    setTimeout(async function () {
      const screenshot = await Page.captureScreenshot({ format })
      const buffer = new Buffer(screenshot.data, "base64")
      fs.writeFile("output.png", buffer, "base64", function (err) {
        if (err) {
          console.error(err)
        } else {
          console.log("Screenshot saved")
        }
        client.close()
      })
    }, delay)
  })
})()
