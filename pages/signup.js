import React, { useRef, useState } from "react"
import { useAuth } from "../lib/authContext"
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function signupPage({}) {
  const nameRef = useRef()
  const emailRef = useRef()
  const idRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return toast.error("Passwords do not match")
    }
    
    if (passwordRef.current.value.length <= 4) {
      return toast.error("Password should be longer than 6 characters")
    }
    
    try {
      setLoading(true)
      await signup(nameRef.current.value, emailRef.current.value, idRef.current.value, passwordRef.current.value)
      router.push('/')
      toast.success('Authenitcation Successful')
    } catch {
      toast.error('Authenitcation Failed')
    }

    setLoading(false)
  }

  // Reroute user if authenticated 
  if (currentUser) router.push('/')
  
  return (
    <main>
      <form className="auth-form" onSubmit={handleSubmit}>
        <span className="form-title">Sign up</span>
        <div className="form-input">
          <input className="input100" type="text" ref={nameRef} placeholder="Full Name" required/>
        </div>
        <div className="form-input">
          <input className="input100" type="text" ref={emailRef} placeholder="School Email" required/>
        </div>
        <div className="form-input">
          <input className="input100" type="text" ref={idRef} placeholder="Student ID" required/>
        </div>
        <div className="form-input">
          <input className="input100" type="password" ref={passwordRef} placeholder="Password" required/>
        </div>
        <div className="form-input">
          <input className="input100" type="password" ref={passwordConfirmRef} placeholder="Confirm Password" required/>
        </div>
        <div className='form-extra' >
          <Link href="/login">Already have an account?</Link>
        </div>
        <button disabled={loading} className="btn form-btn" type="submit" >Sign up</button>
      </form>
    </main>      
  )
}
