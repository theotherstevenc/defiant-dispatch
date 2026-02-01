import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import CryptoJS from 'crypto-js'
import cors from 'cors'
import express from 'express'
import nodemailer from 'nodemailer'
import { simpleParser } from 'mailparser'

const app = express()

// Define secrets
const encryptionKey = defineSecret('ENCRYPTION_KEY')
const mailUsername = defineSecret('MAIL_USERNAME')
const mailPass = defineSecret('MAIL_PASS')

// Apply CORS globally
app.use(cors({ origin: '*' }))

const encryptText = (text, key) => {
  return CryptoJS.AES.encrypt(text, key).toString()
}

const decryptText = (encryptedData) => {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey.value())
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

app.post('/encrypt', express.json(), async (req, res) => {
  const { text } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    const encrypted = encryptText(text, encryptionKey.value())
    return res.json({ encrypted })
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/send', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    const { testaddress, testsubject, ampversion, textversion, htmlversion } = req.body
    const user = req.body.username || mailUsername.value()
    const pass = decryptText(req.body.pass) || mailPass.value()
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

app.post('/upload', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    if (!req.body.file) {
      return res.status(400).json({ error: 'No file data provided' })
    }

    // Decode base64 to buffer
    const fileBuffer = Buffer.from(req.body.file, 'base64')
    
    // Parse the .eml file
    const parsedContent = await parseUpload({ data: fileBuffer })
    
    return res.json(parsedContent)
  } catch (error) {
    console.error('Upload parsing error:', error)
    return res.status(500).json({ error: 'Failed to parse file', details: error.message })
  }
})

app.get('/version', (req, res) => {
  res.json({ version: process.env.npm_package_version })
})

app.listen(() =>
  console.log(`
  _____ _____ _____ _____ ____
  | __  |   __| __  |   __|  |
  |    -|   __| __ -|   __|  |__
  |__|__|_____|_____|_____|_____|
  made with ❤ by a 𝗥𝗘𝗕𝗘𝗟
`)
)

export const api = onRequest({ secrets: [encryptionKey, mailUsername, mailPass] }, app)
