import { onRequest } from 'firebase-functions/v2/https'
import CryptoJS from 'crypto-js'
import cors from 'cors'
import express from 'express'
import fileUpload from 'express-fileupload'
import nodemailer from 'nodemailer'
import { simpleParser } from 'mailparser'

const app = express()

app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({ limit: '50mb' }))
app.use(cors({ origin: '*' }))
app.use(fileUpload())

const encryptText = (text, key) => {
  return CryptoJS.AES.encrypt(text, key).toString()
}

const decryptText = (encryptedData) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, process.env.ENCRYPTION_KEY)
  return decrypted.toString(CryptoJS.enc.Utf8)
}

const ampVersion = (parsed) => {
  if (parsed && Array.isArray(parsed.attachments)) {
    const ampAttachment = parsed.attachments.find((attachment) => attachment.contentType === 'text/x-amp-html')
    if (ampAttachment) {
      return ampAttachment.content.toString()
    }
  }
}

const parseUpload = async (file) => {
  const parsed = await simpleParser(file.data)

  return {
    html: parsed.html || '',
    text: parsed.text || '',
    amp: ampVersion(parsed) || '',
  }
}

app.post('/api/encrypt', async (req, res) => {
  const { text } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  if (!process.env.ENCRYPTION_KEY) {
    return res.status(500).json({ error: 'Missing credentials' })
  }

  try {
    const encrypted = encryptText(text, process.env.ENCRYPTION_KEY)
    return res.json({ encrypted })
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/api/send', async (req, res) => {
  try {
    const { testaddress, testsubject, ampversion, textversion, htmlversion } = req.body
    const user = req.body.username || process.env.MAIL_USERNAME
    const pass = decryptText(req.body.pass) || process.env.MAIL_PASS
    const from = req.body.from || process.env.MAIL_FROM_NAME
    const host = req.body.host || process.env.MAIL_HOST
    const port = req.body.port || process.env.MAIL_PORT

    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: false,
      auth: {
        user: user,
        pass: pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    })

    await transporter.sendMail({
      from: from + ' <' + user + '>',
      to: testaddress,
      subject: testsubject,
      html: htmlversion,
      text: textversion,
      amp: ampversion,
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return res.status(500).json({ error: 'Internal Server Error.' })
  }
})

app.post('/api/upload', async (req, res) => {
  const file = req.files.file
  const parsedContent = await parseUpload(file)
  res.json(parsedContent)
})

app.get('/api/version', (req, res) => {
  res.json({ version: process.env.npm_package_version })
})

export const api = onRequest(app)
