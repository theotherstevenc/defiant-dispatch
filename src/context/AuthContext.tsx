/* eslint-disable react-refresh/only-export-components */
import { onAuthStateChanged, User } from 'firebase/auth'
import React, { createContext, useContext, useEffect, useState } from 'react'

import { auth } from '../firebase'

interface AuthContextProps {
  user: User | null
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
    })
    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}

export const useAuthContext = (): AuthContextProps => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    if (process.env.NODE_ENV === 'development') {
      throw new Error('useAuthContext must be used within an AuthProvider')
    } else {
      throw new Error('Auth context is not available.')
    }
  }
  return context
}
