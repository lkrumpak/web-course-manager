import React, { useRef, useState } from "react"
import { useAuth } from "../lib/authContext"
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'

export default function signupPage({}) {
  const emailRef = useRef()
  const oldpasswordRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { updateEmail, updatePassword } = useAuth()
  const { currentUser, displayName } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleEmailUpdate(e) {
    e.preventDefault()

    try {
      setLoading(true)
      await updateEmail( emailRef.current.value, passwordRef.current.value)
      router.push('/')
      toast.success('Authenitcation Successful')
    } catch {
      toast.error('Authenitcation Failed')
    }

    setLoading(false)
  }

  if (!currentUser) {
    router.push('/login')
  }
  
  return (
    <main>
      <form className="auth-form" >
        <span className="form-title">{displayName}</span>
        <div className="form-input">
          <input className="input100" type="password" ref={oldpasswordRef} placeholder="Old Password" required/>
        </div>
        <div className="form-input">
          <input className="input100" type="password" ref={passwordRef} placeholder="New Password" required/>
        </div>
        <div className="form-input">
          <input className="input100" type="password" ref={passwordConfirmRef} placeholder="Confirm New Password" required/>
        </div>
        <button disabled={loading} className="btn form-btn" type="submit" >Update</button>
      </form>
      
    </main>      
  )
}
