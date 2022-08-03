import React, { useContext, useState, useEffect } from "react"
import { auth, db, serverTimestamp } from "./firebase"

const AuthContext = React.createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState()
  const [isAdmin, setisAdmin] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)

  function signup(name, email,id, password) {
    auth.createUserWithEmailAndPassword(email, password).then(async data => {
      return db.collection('users').doc(data.user.uid).set({
        displayName: name,
        studentId: id,
        createdAt: serverTimestamp(),
        admin: false
      })
    }).catch(err =>{
      return err
    })
  }

  function login(email, password) {
    return auth.signInWithEmailAndPassword(email, password)
  }

  function logout() {
      return auth.signOut()
  }

  function resetPassword(email) {
      return auth.sendPasswordResetEmail(email)
  }

  function updateEmail(email) {
      return currentUser.updateEmail(email)
  }

  function updatePassword(password) {
      return currentUser.updatePassword(password)
  }

  useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user)

      if(user){
        db.collection('users').doc(user.uid)
        .onSnapshot((doc) => {
          setDisplayName(doc.data()?.displayName);
          setisAdmin(doc.data()?.admin);
        });
      } else {
        setDisplayName('');
        setisAdmin(false);
      }
      
      setLoading(false)
      })
      
      return unsubscribe
  }, [])

  const value = {
      currentUser,
      isAdmin,
      displayName,
      login,
      signup,
      logout,
      resetPassword,
      updateEmail,
      updatePassword
  }

  return (
      <AuthContext.Provider value={value}>
      {!loading && children}
      </AuthContext.Provider>
  )
}