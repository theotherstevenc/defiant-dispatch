import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import CryptoJS from 'crypto-js'
import cors from 'cors'
import express, { type Request, type Response } from 'express'
import nodemailer from 'nodemailer'
import { simpleParser } from 'mailparser'
import Busboy from 'busboy'
import { Readable } from 'stream'

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

// Body parsing applied per-route, NOT globally.
// Firebase Cloud Functions v2 pre-consumes the request stream, so global
// body parsers (express.json, express.urlencoded, express-fileupload) would
// consume the stream before the /upload handler can access it.

const jsonParser = express.json({ limit: '50mb' })
const urlencodedParser = express.urlencoded({ limit: '50mb', extended: true })

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

// Firebase Hosting rewrites forward the full original path (e.g. /api/send).
// Strip the /api prefix so routes match in both prod and the local emulator.
app.use((req, _res, next) => {
  req.url = req.url.replace(/^\/api(?=\/)/, '')
  next()
})

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

const parseUpload = async (fileBuffer: Buffer): Promise<ParsedEmail> => {
  const parsed = await simpleParser(fileBuffer)

  return {
    html: parsed.html || '',
    text: parsed.text || '',
    amp: ampVersion(parsed) || '',
  }
}

const isValidEmail = (value: unknown): boolean => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const isValidEmailOrList = (value: unknown): boolean => isValidEmail(value) || (Array.isArray(value) && value.length > 0 && value.every(isValidEmail))

const parseMultipartFile = (req: Request): Promise<{ fileName: string; fileBuffer: Buffer }> => {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({ headers: req.headers })
    const chunks: Buffer[] = []
    let fileName = ''

    busboy.on('file', (_fieldname: string, file: Readable, info: { filename: string }) => {
      fileName = info.filename
      file.on('data', (data: Buffer) => chunks.push(data))
      file.on('end', () => {
        resolve({ fileName, fileBuffer: Buffer.concat(chunks) })
      })
    })

    busboy.on('error', (error: Error) => reject(error))

    // Firebase pre-consumes the stream. Use rawBody if available, otherwise pipe.
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody
    if (rawBody) {
      const readable = new Readable()
      readable.push(rawBody)
      readable.push(null)
      readable.pipe(busboy)
    } else {
      req.pipe(busboy)
    }
  })
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.post('/encrypt', jsonParser, urlencodedParser, async (req: Request, res: Response) => {
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

app.post('/send', jsonParser, urlencodedParser, async (req: Request, res: Response) => {
  const { testaddress, testsubject, htmlversion } = req.body
  const ampversion = req.body.ampversion ?? ''
  const textversion = req.body.textversion ?? ''

  // --- Input validation ---
  if (!isValidEmailOrList(testaddress)) {
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
    const user = req.body.username || mailUsername.value()
    const pass = req.body.pass ? decryptText(req.body.pass) : mailPass.value()
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
    return res.status(500).json({ error: 'Internal Server Error' })
  }
})

app.post('/upload', async (req: Request, res: Response) => {
  try {
    const { fileName, fileBuffer } = await parseMultipartFile(req)

    if (!fileName.toLowerCase().endsWith('.eml')) {
      return res.status(400).json({ error: 'File must be .eml format' })
    }

    if (fileBuffer.length === 0) {
      return res.status(400).json({ error: 'File is empty' })
    }

    const parsedContent = await parseUpload(fileBuffer)
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
