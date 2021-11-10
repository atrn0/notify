import schedule from "node-schedule"
import { App, GenericMessageEvent, LogLevel, MessageEvent } from "@slack/bolt"
import { fetchTraffic, parseTraffic } from "./traffic"
import { takeScreenshot } from "./electricity_nature"
import { Upload } from "./gyazo"
import { turnOffLivingLight, turnOnLivingLight } from "./switchbot"

const CHANNEL = "C02LPDMMDR8"
const MYID = "U02CY8ZKU2F"

const slackBotToken = process.env.SLACK_BOT_TOKEN
const slackAppToken = process.env.SLACK_APP_TOKEN
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: slackBotToken,
  appToken: slackAppToken,
  socketMode: true,
  logLevel: LogLevel.DEBUG,
})

;(async () => {
  await app.start()
  console.log("⚡️ Bolt app started")
})()

const notifyError = async (message: string) => {
  const res = await app.client.chat.postMessage({
    token: slackBotToken,
    channel: CHANNEL,
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
      channel: CHANNEL,
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
      channel: CHANNEL,
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

const isGenericMessageEvent = (msg: MessageEvent): msg is GenericMessageEvent =>
  (msg as GenericMessageEvent).subtype === undefined

app.message(/^(lights on|:lights_on:|l)$/, async ({ message, say }) => {
  if (!isGenericMessageEvent(message)) return
  if (message.user != MYID) {
    await say("Unauthorized")
    return
  }

  try {
    await turnOnLivingLight()
    await say(`:lights_on:`)
  } catch (err) {
    await say(`Failed to turn on the living light.: ${err}`)
  }
})

app.message(/^(lights off|:lights_off:|lo)$/, async ({ message, say }) => {
  if (!isGenericMessageEvent(message)) return
  if (message.user != MYID) {
    await say("Unauthorized")
    return
  }

  try {
    await turnOffLivingLight()
    await say(`:lights_off:`)
  } catch (err) {
    await say(`Failed to turn on the living light.: ${err}`)
  }
})

app.message(/^(traffic|t)$/, notifyTraffic)

app.message(/^(electric|e)$/, notifyElectricity)
