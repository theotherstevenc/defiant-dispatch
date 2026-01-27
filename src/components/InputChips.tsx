import ClearIcon from '@mui/icons-material/Clear'
import { TextField, styled } from '@mui/material'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import React, { useRef, useState } from 'react'

import { FOCUS_OUTLINE_COLOR } from '../utils/constants'

const StyledStack = styled(Stack)(({ theme }) => ({
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.action.disabled}`,
  alignItems: 'center',
  flexWrap: 'wrap',
  rowGap: theme.spacing(1),
  columnGap: theme.spacing(0),
  display: 'flex',
  alignContent: 'center',
  '&:hover': {
    borderColor: theme.palette.text.primary,
  },
  '&:focus-within': {
    outline: `2px solid ${FOCUS_OUTLINE_COLOR}`,
    zIndex: 1,
    borderColor: theme.palette.primary.main,
  },
  '& .MuiTextField-root': {
    flex: 1,
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        border: 'none',
      },
      '& input': {
        padding: theme.spacing(0.5, 1),
        width: '100%',
      },
    },
  },
}))

const StyledChip = styled(Chip)(({ theme }) => ({
  '& .MuiChip-label': {
    fontSize: '1rem',
  },
  '&:focus': {
    backgroundColor: theme.palette.action.selected,
  },
  '&:focus-visible': {
    outline: `2px solid ${FOCUS_OUTLINE_COLOR}`,
    outlineOffset: 2,
  },
}))

const StyledClearIcon = styled(ClearIcon)(({ theme }) => ({
  '&:hover': {
    color: `${theme.palette.primary.main}!important`,
  },
  '&:focus': {
    outline: 'none',
    color: theme.palette.primary.main,
  },
  '&:focus-visible': {
    outline: `2px solid ${FOCUS_OUTLINE_COLOR}`,
    outlineOffset: 1,
  },
}))

interface ChipItemProps {
  value: string
  onDelete: (value: string) => void
}

interface InputChipsProps {
  chipValues: string[]
  setChipValues: React.Dispatch<React.SetStateAction<string[]>>
  onChange?: (values: string[]) => void
}

const ChipItem: React.FC<ChipItemProps> = ({ value, onDelete }) => {
  const handleDelete = () => onDelete(value)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleDelete()
    }
  }

  return (
    <StyledChip
      key={value}
      label={value}
      onDelete={handleDelete}
      deleteIcon={<StyledClearIcon tabIndex={0} role='button' aria-label={'Remove ' + value} onKeyDown={handleKeyDown} />}
    />
  )
}

const InputChips: React.FC<InputChipsProps> = ({ chipValues, setChipValues, onChange }) => {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDelete = (chipItemToDelete: string) => {
    setChipValues((prev) => {
      const newValues = prev.filter((chipItem) => chipItem !== chipItemToDelete)
      onChange?.(newValues)
      return newValues
    })
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value.trim()

    if ((e.key === 'Enter' || e.key === ',') && value) {
      setChipValues((prev) => {
        const newValues = [...prev, value]
        onChange?.(newValues)
        return newValues
      })
      setInputValue('')
      // Prevent comma from being entered in the input
      if (e.key === ',') {
        e.preventDefault()
      }
    }
  }

  return (
    <StyledStack direction='row' spacing={1}>
      {chipValues.map((chipItem) => (
        <ChipItem key={chipItem} value={chipItem} onDelete={handleDelete} />
      ))}
      <TextField inputRef={inputRef} onChange={handleInputChange} value={inputValue} onKeyDown={handleKeyDown} />
    </StyledStack>
  )
}

export default InputChips
