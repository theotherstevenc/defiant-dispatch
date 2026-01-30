import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import { Tooltip } from '@mui/material'
import { useHotkeys } from 'react-hotkeys-hook'

import { useAppContext } from '../context/AppContext'
import { useFirestoreSettings } from '../hooks/useFirestoreSettings'
import { TOGGLE_BTN_HIDE_PROJECTS, TOGGLE_BTN_SHOW_PROJECTS } from '../utils/constants'

import { StyledIconButton } from './StyledIconButton'

const InputToggleWorkingFiles = () => {
  const { settings } = useAppContext()
  const { updateSetting } = useFirestoreSettings()

  const handleOpen = async () => {
    const newValue = !settings.hideWorkingFiles
    await updateSetting('hideWorkingFiles', newValue, 'InputToggleWorkingFiles')
  }

  useHotkeys('mod+b', () => handleOpen(), {
    enableOnFormTags: true,
    preventDefault: true,
  })

  const handleToggleButtonLabel = settings.hideWorkingFiles ? TOGGLE_BTN_SHOW_PROJECTS : TOGGLE_BTN_HIDE_PROJECTS

  return (
    <>
      <Tooltip title={handleToggleButtonLabel}>
        <StyledIconButton onClick={handleOpen} aria-label={handleToggleButtonLabel}>
          {settings.hideWorkingFiles ? <ToggleOffIcon /> : <ToggleOnIcon />}
        </StyledIconButton>
      </Tooltip>
    </>
  )
}
export default InputToggleWorkingFiles
