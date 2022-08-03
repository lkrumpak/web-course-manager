import React, { useRef, useState } from "react"
import { useAuth } from "../lib/authContext"
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function passwordResetPage({}) {
  const emailRef = useRef()
  const { resetPassword } = useAuth()
  const { currentUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      setLoading(true)
      await resetPassword(emailRef.current.value)
      router.push('/login')
      toast.success('Password reset email has been sent')
    } catch {
      toast.error('Password reset email failed to send')
    }

    setLoading(false)
  }

  if (currentUser) {
    router.push('/')
  }

  return (
    <main>
      <form className="auth-form" onSubmit={handleSubmit} >
        <span className="form-title">Reset Password</span>
        <div className="form-input">
          <input className="input100" type="text" ref={emailRef} placeholder="Email" required/>
        </div>
        <div className='form-extra' >
          <Link href="/login">Go back to login?</Link>
        </div>
        <button disabled={loading} className="btn form-btn" type="submit" >Send Email</button>
      </form>
    </main>
  )
}
