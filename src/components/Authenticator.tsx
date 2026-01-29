import CloseIcon from '@mui/icons-material/Close'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { useMemo, useState } from 'react'

import { useAppContext } from '../context/AppContext'
import { useEditorContext } from '../context/EditorContext'
import { iconButtonStyles } from '../styles/global.styles'
import { BTN_LABEL_CANCEL, BTN_LABEL_LOGIN, BTN_LABEL_LOGIN_ERROR, BTN_LABEL_LOGOUT, BTN_LABEL_OK, LABEL_CLOSE } from '../utils/constants'
import { logError } from '../utils/logError'

import { StyledIconButton } from './StyledIconButton'

const Authenticator = () => {
  const auth = useMemo(() => getAuth(), [])
  const { user } = useAppContext()
  const { setHtml, setText, setAmp, setWorkingFileID, setWorkingFileName, setFiles } = useEditorContext()

  const [open, setOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [isAuthPending, setIsAuthPending] = useState(false)

  const handleAuthButtonClick = () => {
    if (!user) {
      setOpen(true)
    }
    if (user) {
      handleLogout()
    }
  }

  const handleClose = () => {
    setOpen(false)
    setLoginError(null)
    setUsername('')
    setPassword('')
  }

  const handleLogout = async () => {
    setIsAuthPending(true)
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
    } finally {
      setIsAuthPending(false)
    }
  }

  const handleLogin = async () => {
    setIsAuthPending(true)
    try {
      await signInWithEmailAndPassword(auth, username, password)
      setOpen(false)
      setLoginError(null)
      setUsername('')
      setPassword('')
    } catch (error) {
      logError('Error signing in', 'Authenticator', error)
      setLoginError(BTN_LABEL_LOGIN_ERROR)
    } finally {
      setIsAuthPending(false)
    }
  }

  const submitOnEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLogin()
    }
  }

  const authButtonLabel = user ? BTN_LABEL_LOGOUT : BTN_LABEL_LOGIN

  return (
    <>
      <Tooltip title={authButtonLabel}>
        <StyledIconButton
          onClick={handleAuthButtonClick}
          aria-label={authButtonLabel}
          disabled={isAuthPending}
          sx={{
            bgcolor: user ? 'grey.400' : 'primary.dark',
            boxShadow: 3,
          }}>
          {user ? <LogoutIcon /> : <LoginIcon />}
        </StyledIconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth='sm'>
        <DialogTitle>
          {BTN_LABEL_LOGIN}
          {isAuthPending && <CircularProgress size={20} sx={{ ml: 1, verticalAlign: 'middle' }} />}
          <IconButton aria-label={LABEL_CLOSE} onClick={handleClose} sx={iconButtonStyles} disabled={isAuthPending}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loginError && (
            <Typography color='error' sx={{ mt: 1, mb: 1 }}>
              {loginError}
            </Typography>
          )}
          <TextField
            autoFocus
            margin='dense'
            label='username'
            type='text'
            fullWidth
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            onKeyDown={submitOnEnter}
            disabled={isAuthPending}
          />
          <TextField
            margin='dense'
            label='password'
            type='password'
            fullWidth
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            onKeyDown={submitOnEnter}
            disabled={isAuthPending}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='secondary' disabled={isAuthPending}>
            {BTN_LABEL_CANCEL}
          </Button>
          <Button onClick={handleLogin} color='primary' disabled={isAuthPending}>
            {BTN_LABEL_OK}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
export default Authenticator
