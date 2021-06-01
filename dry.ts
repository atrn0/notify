import { fetchTraffic, parseTraffic } from "./traffic"
;(async () => {
  const data = await fetchTraffic()
  console.log(parseTraffic(data))
})()
