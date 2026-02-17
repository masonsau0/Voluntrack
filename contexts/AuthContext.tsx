"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import type { UserProfile } from "@/lib/firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "@/lib/firebase/config"
import { doc, getDoc } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setUserProfile(null) // Clear stale profile immediately when auth changes

      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid)
          const userDoc = await getDoc(userDocRef)
          
          if (userDoc.exists()) {
            setUserProfile({
              uid: userDoc.id,
              ...userDoc.data(),
            } as UserProfile)
          } else {
            console.error("User profile not found")
            setUserProfile(null)
          }
        } catch (error) {
          console.error("Error fetching user profile:", error)
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
