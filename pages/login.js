import React, { useRef, useState } from "react"
import { useAuth } from "../lib/authContext"
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function loginPage({}) {
  const emailRef = useRef()
  const passwordRef = useRef()
  const { login } = useAuth()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setLoading(true)
      await login(emailRef.current.value, passwordRef.current.value)
      router.push('/')
      toast.success('Authenitcation Successful')
    } catch {
      toast.error('Authenitcation Failed')
    }

    setLoading(false)
  }

  if (currentUser) {
    router.push('/')
  }

  return (
    <main>
      <form className="auth-form" onSubmit={handleSubmit} >
        <span className="form-title">Login</span>
        <div className="form-input">
          <input className="input100" type="text" ref={emailRef} placeholder="Email" required/>
        </div>
        <div className="form-input">
          <input className="input100" type="password" ref={passwordRef} placeholder="Password" required/>
        </div>
        <div className='form-extra' >
          <Link href="/signup">Sign up?</Link>
          <Link href="/password-reset">Forgot Password?</Link>
        </div>
        <button disabled={loading} className="btn form-btn" type="submit" >Login</button>
      </form>
    </main>
  )
}
