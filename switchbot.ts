import axios from "axios"

// "deviceList": [
//   {
//       "deviceId": "84F7033B368E",
//       "deviceName": "デスクライト",
//       "deviceType": "Color Bulb",
//       "enableCloudService": false,
//       "hubDeviceId": "000000000000"
//   },
//   {
//       "deviceId": "98CDACB1ABCA",
//       "deviceName": "Humidifier CA",
//       "deviceType": "Humidifier",
//       "enableCloudService": true,
//       "hubDeviceId": "000000000000"
//   },
//   {
//       "deviceId": "D5A5245A0F95",
//       "deviceName": "Home",
//       "deviceType": "Hub Mini",
//       "enableCloudService": false,
//       "hubDeviceId": "000000000000"
//   },
//   {
//       "deviceId": "ED217DF42A78",
//       "deviceName": "Meter 78",
//       "deviceType": "Meter",
//       "enableCloudService": true,
//       "hubDeviceId": "D5A5245A0F95"
//   }
// ],
// "infraredRemoteList": [
//   {
//       "deviceId": "01-202106012212-75946187",
//       "deviceName": "時計",
//       "remoteType": "DIY Light",
//       "hubDeviceId": "D5A5245A0F95"
//   }
// ]

const BASEURL = "https://api.switch-bot.com"
const SWITCHBOT_TOKEN = process.env.SWITCHBOT_TOKEN

//   {
//       "deviceId": "D4616B3375C7",
//       "deviceName": "照明",
//       "deviceType": "Bot",
//       "enableCloudService": true,
//       "hubDeviceId": "D5A5245A0F95"
//   },
const LIVING_LIGHT_ID = "D4616B3375C7"

const client = axios.create({
  baseURL: BASEURL,
  headers: { Authorization: SWITCHBOT_TOKEN },
})

type SendDeviceControlCommandRequest = {
  command: "turnOn" | "turnOff"
  parameter?: "default"
  commandType?: "command"
}

type SendDeviceControlCommandResponse = {
  statusCode: number
  message: string
  body: any
}

// https://github.com/OpenWonderLabs/SwitchBotAPI#send-device-control-commands
const sendDeviceControlCommand = async (
  req: SendDeviceControlCommandRequest
) => {
  await client.post<SendDeviceControlCommandResponse>(
    "/v1.0/devices/D4616B3375C7/commands",
    req,
    { headers: { "Content-Type": "application/json; charset=utf8" } }
  )
}

export const turnOnLivingLight = async () => {
  await sendDeviceControlCommand({
    command: "turnOn",
    parameter: "default",
    commandType: "command",
  })
}

export const turnOffLivingLight = async () => {
  await sendDeviceControlCommand({
    command: "turnOff",
    parameter: "default",
    commandType: "command",
  })
}
