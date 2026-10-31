import { Alert, AlertTitle, Button, Snackbar, useMediaQuery } from '@mui/material'
import { useRef, useState } from 'react'

import { appVersionStyles, captainsLogStyles } from '../styles/global.styles'
import { APP_NAME, CAPTAINS_LOG_MESSAGE, CAPTAINS_LOG_TITLE, LABEL_CLOSE, SETTINGS_VERSION_LABEL } from '../utils/constants'

import type { ReactElement } from 'react'

const LOG_ACTIVATIONS = 5
const ACTIVATION_WINDOW_MS = 3000
const LOG_DURATION_MS = 6000

const AppVersion = (): ReactElement => {
  const activationRef = useRef({ count: 0, lastTime: 0 })
  const [isLogOpen, setIsLogOpen] = useState(false)
  const shouldReduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const handleActivation = () => {
    const now = Date.now()
    const previous = activationRef.current
    const count = now - previous.lastTime > ACTIVATION_WINDOW_MS ? 1 : previous.count + 1
    activationRef.current = { count, lastTime: now }
    if (count === LOG_ACTIVATIONS) {
      activationRef.current.count = 0
      setIsLogOpen(true)
    }
  }

  return (
    <>
      <Button aria-label={`${APP_NAME} ${SETTINGS_VERSION_LABEL} ${__APP_VERSION__}`} onClick={handleActivation} sx={appVersionStyles}>
        {APP_NAME} - {SETTINGS_VERSION_LABEL} {__APP_VERSION__}
      </Button>
      <Snackbar
        open={isLogOpen}
        autoHideDuration={LOG_DURATION_MS}
        transitionDuration={shouldReduceMotion ? 0 : undefined}
        onClose={(_event, reason) => {
          if (reason !== 'clickaway') setIsLogOpen(false)
        }}>
        <Alert severity='info' role='status' closeText={LABEL_CLOSE} onClose={() => setIsLogOpen(false)} sx={captainsLogStyles}>
          <AlertTitle>{CAPTAINS_LOG_TITLE}</AlertTitle>
          {CAPTAINS_LOG_MESSAGE}
        </Alert>
      </Snackbar>
    </>
  )
}

export default AppVersion
