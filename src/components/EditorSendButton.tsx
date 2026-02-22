import { Alert, Backdrop, Button, CircularProgress, Snackbar } from '@mui/material'
import { useMemo, useState } from 'react'

import { useEditorConfigContext } from '../context/EditorConfigContext'
import { useEditorContext } from '../context/EditorContext'
import { useEmailSettingsContext } from '../context/EmailSettingsContext'
import { EmailData } from '../interfaces'
import { BTN_LABEL_SEND, SEND_ALERT_FAILURE, SEND_ALERT_SUCCESS } from '../utils/constants'
import { getCurrentDateTime } from '../utils/getCurrentDateTime'
import { logError } from '../utils/logError'
import { useRenderCount } from '../utils/useRenderCount'

const EditorSendButton = () => {
  useRenderCount('EditorSendButton')
  const { html, text, amp } = useEditorContext()
  const { isPreventThreadingEnabled } = useEditorConfigContext()
  const { subject, emailAddresses, inputSenderSettings } = useEmailSettingsContext()
  const [open, setOpen] = useState(false)
  const [openBackdrop, setOpenBackdrop] = useState(false)
  const [isSendSuccessful, setIsSendSuccessful] = useState(true)

  const emailData = useMemo((): EmailData => {
    const { host, port, username, pass, from } = inputSenderSettings

    return {
      testaddress: emailAddresses,
      testsubject: subject,
      htmlversion: html,
      textversion: text,
      ampversion: amp,
      host,
      port,
      username,
      pass,
      from,
    }
  }, [emailAddresses, subject, html, text, amp, inputSenderSettings])

  const API_URL = '/api/send'
  const HTTP_METHOD = 'POST'

  const handleRequest = async (emailData: EmailData): Promise<Response> => {
    const options: RequestInit = {
      method: HTTP_METHOD,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    }
    const response = await fetch(API_URL, options)
    return response
  }

  const handleResponse = (response: Response) => {
    if (!response.ok || response.status !== 200) {
      logError('An error returned response.statusText: ' + response.statusText, 'EditorSendButton')
      return false
    }
    return true
  }

  const handleClick = async () => {
    setOpenBackdrop(true)

    try {
      const formattedSubject = isPreventThreadingEnabled ? `${emailData.testsubject} ${getCurrentDateTime()}` : emailData.testsubject
      const sendData = { ...emailData, testsubject: formattedSubject }
      const response = await handleRequest(sendData)
      const isSuccess = handleResponse(response)
      setIsSendSuccessful(isSuccess)
    } catch (error) {
      logError('An error occurred while sending the email', 'EditorSendButton', error)
      setIsSendSuccessful(false)
    } finally {
      setOpenBackdrop(false)
      setOpen(true)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <>
      <Button variant='contained' color='primary' onClick={handleClick}>
        {BTN_LABEL_SEND}
      </Button>

      <Backdrop sx={(theme) => ({ color: '#ffffff', zIndex: theme.zIndex.drawer + 1 })} open={openBackdrop}>
        <CircularProgress color='inherit' />
      </Backdrop>

      <Snackbar open={open} autoHideDuration={2500} onClose={handleClose}>
        <Alert severity={isSendSuccessful ? 'success' : 'error'} variant='standard' sx={{ width: '100%' }}>
          {isSendSuccessful ? SEND_ALERT_SUCCESS : SEND_ALERT_FAILURE}
        </Alert>
      </Snackbar>
    </>
  )
}
export default EditorSendButton
