import CheckIcon from '@mui/icons-material/Check'
import { Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material'

import { themeOptionStyles, visuallyHiddenStyles } from '../styles/global.styles'
import { SETTINGS_THEME_DARK_LABEL, SETTINGS_THEME_LIGHT_LABEL, SETTINGS_THEME_SYSTEM_LABEL } from '../utils/constants'

import type { ThemeMode } from '../interfaces'
import type { ReactElement } from 'react'

interface ThemeOption {
  value: ThemeMode
  label: string
}

interface ThemeSelectorProps {
  id: string
  label: string
  value: string
  hasSystemOption?: boolean
  onChange: (value: ThemeMode) => void
}

const ThemeSelector = ({ id, label, value, hasSystemOption = false, onChange }: ThemeSelectorProps): ReactElement => {
  const options: ThemeOption[] = [
    { value: 'light', label: SETTINGS_THEME_LIGHT_LABEL },
    { value: 'dark', label: SETTINGS_THEME_DARK_LABEL },
  ]
  if (hasSystemOption) {
    options.push({ value: 'system', label: SETTINGS_THEME_SYSTEM_LABEL })
  }

  return (
    <FormControl component='fieldset' fullWidth>
      <FormLabel component='legend' id={`${id}-label`} sx={{ mb: 1 }}>
        {label}
      </FormLabel>
      <RadioGroup row value={value} aria-labelledby={`${id}-label`} name={id} sx={{ gap: 0.5, flexWrap: 'nowrap' }}>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio sx={visuallyHiddenStyles} onChange={() => onChange(option.value)} />}
            label={
              <Box component='span' sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                {value === option.value && <CheckIcon fontSize='small' />}
                {option.label}
              </Box>
            }
            sx={[
              themeOptionStyles,
              value === option.value && { borderWidth: 2, borderColor: 'primary.main', bgcolor: 'action.selected', fontWeight: 'fontWeightMedium' },
            ]}
          />
        ))}
      </RadioGroup>
    </FormControl>
  )
}

export default ThemeSelector
