import { Typography } from '@mui/material'

import { appVersionStyles } from '../styles/global.styles'
import { APP_NAME, SETTINGS_VERSION_LABEL } from '../utils/constants'

import type { ReactElement } from 'react'

const AppVersion = (): ReactElement => {
  return (
    <Typography sx={appVersionStyles}>
      {APP_NAME} - {SETTINGS_VERSION_LABEL} {__APP_VERSION__}
    </Typography>
  )
}

export default AppVersion
