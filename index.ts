import schedule from "node-schedule"
import axios from "axios"
import { JSDOM } from "jsdom"

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

  if (!totalAmountInt || !totalAmountDecimal) {
    return "failed to fetch traffic"
  }

  return totalAmountInt + totalAmountDecimal + "GB"
}

// const job = schedule.scheduleJob("0 * * * * *", function () {})

async function main() {
  let data
  try {
    data = await fetchTraffic()
  } catch (err) {
    console.error(err)
    return
  }

  const traffic = parseTraffic(data)
  console.log(traffic)
}

main()
