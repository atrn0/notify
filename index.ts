import schedule from "node-schedule"

const job = schedule.scheduleJob("*/5 * * * * *", function () {
  console.log("hello!")
})
