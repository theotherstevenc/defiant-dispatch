import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import CryptoJS from 'crypto-js'
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import fileUpload from 'express-fileupload'
import nodemailer from 'nodemailer'
import { simpleParser } from 'mailparser'

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express()

// ---------------------------------------------------------------------------
// Firebase secrets
// ---------------------------------------------------------------------------

const encryptionKey = defineSecret('ENCRYPTION_KEY')
const mailUsername = defineSecret('MAIL_USERNAME')
const mailPass = defineSecret('MAIL_PASS')

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({ limit: '50mb' }))
app.use(fileUpload())

// CORS — allow Firebase hosting domains + local dev origins
const allowedOrigins = [
  'https://defiant-dispatch-6d153.web.app',
  'https://defiant-dispatch-6d153.firebaseapp.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5001',
  'http://localhost:4000',
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
  })
)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ParsedEmail {
  html: string
  text: string
  amp: string
}

const encryptText = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString()
}

const decryptText = (encryptedData: string): string => {
  const decrypted = CryptoJS.AES.decrypt(encryptedData, encryptionKey.value())
  return decrypted.toString(CryptoJS.enc.Utf8)
}

const ampVersion = (parsed: Awaited<ReturnType<typeof simpleParser>>): string | undefined => {
  if (parsed && Array.isArray(parsed.attachments)) {
    const ampAttachment = parsed.attachments.find((attachment) => attachment.contentType === 'text/x-amp-html')
    if (ampAttachment) {
      return ampAttachment.content.toString()
    }
  }
}

const parseUpload = async (file: fileUpload.UploadedFile): Promise<ParsedEmail> => {
  const parsed = await simpleParser(file.data)

  return {
    html: parsed.html || '',
    text: parsed.text || '',
    amp: ampVersion(parsed) || '',
  }
}

const isValidEmail = (value: unknown): boolean => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.post('/encrypt', async (req: Request, res: Response) => {
  const { text } = req.body

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    const encrypted = encryptText(text, encryptionKey.value())
    return res.json({ encrypted })
  } catch (error) {
    console.error('Error encrypting:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/send', async (req: Request, res: Response) => {
  const { testaddress, testsubject, htmlversion } = req.body
  const ampversion = req.body.ampversion ?? ''
  const textversion = req.body.textversion ?? ''

  // --- Input validation ---
  if (!isValidEmail(testaddress)) {
    return res.status(400).json({ error: 'Valid email address is required' })
  }
  if (!testsubject || typeof testsubject !== 'string') {
    return res.status(400).json({ error: 'Subject is required' })
  }
  if (!htmlversion || typeof htmlversion !== 'string') {
    return res.status(400).json({ error: 'HTML version is required' })
  }
  if (req.body.port !== undefined) {
    const portNum = Number(req.body.port)
    if (!Number.isInteger(portNum) || portNum < 1 || portNum > 65535) {
      return res.status(400).json({ error: 'Invalid port' })
    }
  }

  try {
    // Use ?? instead of || so empty-string or 0 aren't replaced by defaults.
    // Use ternary for pass so decryptText is never called on undefined/empty input.
    const user = req.body.username ?? mailUsername.value()
    const pass = req.body.pass ? decryptText(req.body.pass) : mailPass.value()
    const from = req.body.from ?? process.env.MAIL_FROM_NAME
    const host = req.body.host ?? process.env.MAIL_HOST
    const port = req.body.port ?? process.env.MAIL_PORT

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
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/upload', async (req: Request, res: Response) => {
  if (!req.files?.file) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const file = req.files.file as fileUpload.UploadedFile

  if (!file.name.toLowerCase().endsWith('.eml')) {
    return res.status(400).json({ error: 'File must be .eml format' })
  }

  if (file.size === 0) {
    return res.status(400).json({ error: 'File is empty' })
  }

  try {
    const parsedContent = await parseUpload(file)
    return res.json(parsedContent)
  } catch (error) {
    console.error('Error parsing upload:', error)
    return res.status(500).json({ error: 'Failed to parse email file' })
  }
})

app.get('/version', (_req: Request, res: Response) => {
  res.json({ version: process.env.npm_package_version })
})

// ---------------------------------------------------------------------------
// Export as Firebase Cloud Function
// ---------------------------------------------------------------------------

export const api = onRequest({ secrets: [encryptionKey, mailUsername, mailPass] }, app)
