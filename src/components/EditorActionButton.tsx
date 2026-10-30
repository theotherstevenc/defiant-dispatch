import { ListItemIcon, ListItemText, MenuItem, Tooltip } from '@mui/material'

import { StyledIconButton } from './StyledIconButton'

import type { EditorActionProps } from '../interfaces'
import type { ReactElement, ReactNode } from 'react'

interface EditorActionButtonProps extends EditorActionProps {
  label: string
  children: ReactNode
  onClick: () => void
  isSelected?: boolean
  isDestructive?: boolean
}

const EditorActionButton = ({
  label,
  children,
  onClick,
  isSelected,
  isDestructive = false,
  isMenuItem = false,
  onAction,
  autoFocus,
  tabIndex,
}: EditorActionButtonProps): ReactElement => {
  const handleClick = () => {
    onAction?.()
    onClick()
  }

  if (isMenuItem) {
    return (
      <MenuItem
        onClick={handleClick}
        autoFocus={autoFocus}
        tabIndex={tabIndex}
        aria-label={label}
        role={isSelected === undefined ? 'menuitem' : 'menuitemcheckbox'}
        aria-checked={isSelected}
        sx={{ minHeight: 44, color: isDestructive ? 'error.main' : 'text.primary' }}>
        <ListItemIcon sx={{ color: 'inherit' }}>{children}</ListItemIcon>
        <ListItemText>{label}</ListItemText>
      </MenuItem>
    )
  }

  return (
    <Tooltip title={label} placement='top' disableInteractive>
      <StyledIconButton onClick={handleClick} aria-label={label} aria-pressed={isSelected}>
        {children}
      </StyledIconButton>
    </Tooltip>
  )
}

export default EditorActionButton
