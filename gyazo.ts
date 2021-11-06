import FormData from "form-data"
import axios, { AxiosResponse } from "axios"

const GYAZO_ACCESS_TOKEN = process.env.GYAZO_ACCESS_TOKEN

type GyazoUploadResponse = {
  type: string
  thumb_url: string
  created_at: string
  image_id: string
  permalink_url: string
  url: string
}

export const Upload = async (
  buf: Buffer,
  filename: string
): Promise<GyazoUploadResponse> => {
  const form = new FormData()
  form.append("access_token", GYAZO_ACCESS_TOKEN)
  form.append("imagedata", buf, { filename: filename, knownLength: buf.length })

  let res: AxiosResponse<GyazoUploadResponse>
  try {
    res = await axios.post<GyazoUploadResponse>(
      "https://upload.gyazo.com/api/upload",
      form,
      { headers: form.getHeaders() }
    )
    return res.data
  } catch (err) {
    console.error(err)
    throw err
  }
}
