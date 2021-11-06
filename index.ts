import schedule from "node-schedule"
import { App } from "@slack/bolt"
import { fetchTraffic, parseTraffic } from "./traffic"
import { takeScreenshot } from "./electricity_nature"
import { Upload } from "./gyazo"

const slackBotToken = process.env.SLACK_BOT_TOKEN
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: slackBotToken,
})

const notifyError = async (message: string) => {
  const res = await app.client.chat.postMessage({
    token: slackBotToken,
    channel: "C02CY99N79Q",
    text: message,
  })
  console.log(res)
}

const notifyTraffic = async () => {
  let data
  try {
    data = await fetchTraffic()
  } catch (err) {
    notifyError("failed to fetchTraffic")
    console.error(err)
    return
  }

  const traffic = parseTraffic(data)

  try {
    const res = await app.client.chat.postMessage({
      token: slackBotToken,
      channel: "C02CY99N79Q",
      text: traffic,
      username: "インターネット",
      icon_emoji: ":pager:",
    })
    console.log(res)
  } catch (err) {
    console.log(err)
  }
}

const notifyElectricity = async () => {
  try {
    const bufs = await takeScreenshot()
    const [todayURL, yesterdayURL] = await Promise.all(
      bufs.map(async (b) => (await Upload(b, "e.png")).url)
    )
    const res = await app.client.chat.postMessage({
      token: slackBotToken,
      channel: "C02CY99N79Q",
      text: `${todayURL}\n${yesterdayURL}`,
      username: "電力使用量",
      icon_emoji: ":electric_plug:",
    })
    console.log(res)
  } catch (err) {
    notifyError("failed to notifyElectricity")
    console.log(err)
  }
}

// 13:00 JST everyday
schedule.scheduleJob("0 0 4 * * *", notifyTraffic)
// 08:00 JST everyday
schedule.scheduleJob("0 0 23 * * *", notifyElectricity)
