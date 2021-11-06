import axios from "axios"
import { JSDOM } from "jsdom"

export async function fetchTraffic(): Promise<string> {
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

export function parseTraffic(data: string): string {
  const { document } = new JSDOM(data).window
  const totalAmountInt = document.getElementsByClassName(
    "traffic-total-amount-number-int"
  )[0]?.textContent
  const totalAmountDecimal = document.getElementsByClassName(
    "traffic-total-amount-number-decimal"
  )[0]?.textContent

  const totalLastMonth = document
    .getElementsByClassName("traffic-sammary-table")[0]
    ?.getElementsByClassName("traffic-table")[0]?.rows[1]?.cells[1]?.textContent

  const total =
    totalAmountInt && totalAmountDecimal
      ? `今月の合計 ${totalAmountInt}${totalAmountDecimal} GB`
      : `先月の合計 ${totalLastMonth}`

  const trafficTableRows = (
    document
      .getElementsByClassName("traffic-history-table")[0]
      ?.getElementsByClassName("traffic-table")[0] ||
    document
      .getElementsByClassName("traffic-history-table")[1]
      ?.getElementsByClassName("traffic-table")[0]
  )?.rows
  const cells = trafficTableRows[trafficTableRows?.length - 1]?.cells

  return `${total}
  ${cells[0]?.textContent?.trim()}
  ${cells[1]?.textContent}
  ↑${cells[2]?.textContent}
  ↓${cells[3]?.textContent}`
}
