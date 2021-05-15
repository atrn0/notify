import schedule from "node-schedule"
import axios from "axios"
import { JSDOM } from "jsdom"
import { App } from "@slack/bolt"

async function fetchTraffic(): Promise<string> {
  try {
    const res = await axios.get(
      "https://sslbb.excite.co.jp/bbhikari/fit/traffic/",
      {
        headers: {
          Cookie: process.env.BBEXCITE_TRAFFIC_COOKIE || "",
        },
      }
    )
    return res.data
  } catch (err) {
    return err
  }
}

function parseTraffic(data: string): string {
  const { document } = new JSDOM(data).window
  const totalAmountInt = document.getElementsByClassName(
    "traffic-total-amount-number-int"
  )[0]?.textContent
  const totalAmountDecimal = document.getElementsByClassName(
    "traffic-total-amount-number-decimal"
  )[0]?.textContent

  const trafficTable = document.getElementsByClassName("traffic-table")[0]
  const rows = (trafficTable as HTMLTableElement).rows
  const cells = rows[rows.length - 1].cells

  if (!totalAmountInt || !totalAmountDecimal) {
    return "failed to fetch traffic"
  }

  return `合計 ${totalAmountInt}${totalAmountDecimal} GB

${cells[0]?.textContent?.trim()}
${cells[1]?.textContent}
↑${cells[2]?.textContent}
↓${cells[3]?.textContent}`
}

const slackBotToken = process.env.SLACK_BOT_TOKEN
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: slackBotToken,
})

const job = schedule.scheduleJob("0 0 13 * * *", async () => {
  let data
  try {
    data = await fetchTraffic()
  } catch (err) {
    console.error(err)
    return
  }

  const traffic = parseTraffic(data)

  try {
    const res = await app.client.chat.postMessage({
      token: slackBotToken,
      channel: "C021BNDLVJ7",
      text: traffic,
    })
    console.log(res)
  } catch (err) {
    console.log(err)
  }
})
