import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream'
import { Box, Tooltip } from '@mui/material'
import FormControlLabel from '@mui/material/FormControlLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'

import { useAppContext } from '../context/AppContext'
import { db } from '../firebase'
import { logError } from '../utils/logError'
import { updateFirestoreDoc } from '../utils/updateFirestoreDoc'

import { StyledIconButton } from './StyledIconButton'

const COLLECTION = 'config'
const DOCUMENT = 'editorSettings'

const IconRadio = ({ icon, selected }: { icon: React.ReactNode; selected: boolean }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      outline: selected ? (theme) => `2px solid ${theme.palette.primary.light}` : 'transparent',
      transition: 'background 0.2s',
    }}>
    {icon}
  </Box>
)

const InputThemeToggle = () => {
  const { appColorScheme, setAppColorScheme } = useAppContext()

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const firestoreObj = { appColorScheme: event.target.value }
      await updateFirestoreDoc(db, COLLECTION, DOCUMENT, firestoreObj)
      setAppColorScheme(event.target.value)
    } catch (error) {
      logError('Failed to update editor color scheme:', 'InputThemeToggle', error)
    }
  }

  return (
    <Tooltip title='Toggle Theme'>
      <StyledIconButton>
        <RadioGroup row value={appColorScheme || 'system'} onChange={handleChange} aria-label='theme mode' name='theme-mode'>
          <FormControlLabel
            value='light'
            control={
              <Radio
                icon={<IconRadio icon={<LightModeIcon />} selected={false} />}
                checkedIcon={<IconRadio icon={<LightModeIcon />} selected={true} />}
                sx={{
                  padding: 0,
                  color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white),
                  '&.Mui-checked': {
                    color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white),
                  },
                }}
              />
            }
            label=''
            sx={{ margin: 0 }}
          />
          <FormControlLabel
            value='system'
            control={
              <Radio
                icon={<IconRadio icon={<SettingsSystemDaydreamIcon />} selected={false} />}
                checkedIcon={<IconRadio icon={<SettingsSystemDaydreamIcon />} selected={true} />}
                sx={{
                  padding: '0 10px',
                  color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white),
                  '&.Mui-checked': {
                    color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white),
                  },
                }}
              />
            }
            label=''
            sx={{ margin: 0 }}
          />
          <FormControlLabel
            value='dark'
            control={
              <Radio
                icon={<IconRadio icon={<DarkModeIcon />} selected={false} />}
                checkedIcon={<IconRadio icon={<DarkModeIcon />} selected={true} />}
                sx={{
                  padding: 0,
                  color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white),
                  '&.Mui-checked': {
                    color: (theme) => (theme.palette.mode === 'dark' ? theme.palette.common.black : theme.palette.common.white),
                  },
                }}
              />
            }
            label=''
            sx={{ margin: 0 }}
          />
        </RadioGroup>
      </StyledIconButton>
    </Tooltip>
  )
}

export default InputThemeToggle
