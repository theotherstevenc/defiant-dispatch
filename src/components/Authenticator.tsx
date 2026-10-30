import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CloseIcon from '@mui/icons-material/Close'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useState } from 'react'

import { useAuthContext } from '../context/AuthContext'
import { useEditorContext } from '../context/EditorContext'
import { iconButtonStyles } from '../styles/global.styles'
import { BTN_LABEL_ACCOUNT, BTN_LABEL_CANCEL, BTN_LABEL_LOGIN, BTN_LABEL_LOGOUT, BTN_LABEL_OK, LABEL_CLOSE } from '../utils/constants'
import { logError } from '../utils/logError'

import { StyledIconButton } from './StyledIconButton'

import type { MouseEvent } from 'react'

const Authenticator = () => {
  const auth = getAuth()
  const { user } = useAuthContext()
  const { setHtml, setText, setAmp, setWorkingFileID, setWorkingFileName, setFiles } = useEditorContext()

  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [accountAnchor, setAccountAnchor] = useState<HTMLElement | null>(null)

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    if (!user) {
      setOpen(true)
    }
    if (user) {
      setAccountAnchor(event.currentTarget)
    }
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleLogout = async () => {
    setAccountAnchor(null)
    try {
      await signOut(auth)
      setHtml('')
      setText('')
      setAmp('')
      setWorkingFileID('')
      setWorkingFileName('')
      setFiles([])
    } catch (error) {
      logError('Error signing out', 'Authenticator', error)
    }
  }

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, username, password)
      setOpen(false)
    } catch (error) {
      logError('Error signing in', 'Authenticator', error)
    }
  }

  const handleLoginButtonLabel = user ? BTN_LABEL_ACCOUNT : BTN_LABEL_LOGIN
  const isAccountMenuOpen = Boolean(accountAnchor)

  return (
    <>
      <Tooltip title={handleLoginButtonLabel}>
        <StyledIconButton
          id='account-button'
          onClick={handleOpen}
          aria-label={handleLoginButtonLabel}
          aria-haspopup={user ? 'menu' : 'dialog'}
          aria-expanded={user ? isAccountMenuOpen : open}
          aria-controls={isAccountMenuOpen ? 'account-menu' : undefined}
          sx={{
            bgcolor: user ? 'grey.400' : 'primary.dark',
            boxShadow: 3,
          }}>
          {user ? <AccountCircleIcon /> : <LoginIcon />}
        </StyledIconButton>
      </Tooltip>

      <Menu
        id='account-menu'
        anchorEl={accountAnchor}
        open={isAccountMenuOpen}
        onClose={() => setAccountAnchor(null)}
        slotProps={{ list: { 'aria-labelledby': 'account-button' } }}>
        <MenuItem onClick={handleLogout} sx={{ minHeight: 44 }}>
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText>{BTN_LABEL_LOGOUT}</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>
          {BTN_LABEL_LOGIN}
          <IconButton aria-label={LABEL_CLOSE} onClick={handleClose} sx={iconButtonStyles}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin='dense'
            label='username'
            type='text'
            fullWidth
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleLogin()
              }
            }}
          />
          <TextField
            margin='dense'
            label='password'
            type='password'
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleLogin()
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary'>
            {BTN_LABEL_CANCEL}
          </Button>
          <Button onClick={handleLogin} color='primary'>
            {BTN_LABEL_OK}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default Authenticator
