import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from "../lib/authContext"
import { useRouter } from 'next/router'

export default function Navbar() {
  const { currentUser, displayName, isAdmin } = useAuth()
  const router = useRouter()
  const { logout } = useAuth()

  async function handleSubmit(){
    try{
      await logout()
      router.push('/login')
      return toast.success("You have successfully logged out")
    } catch {
      return toast.error("Failed to logout")
    } 
  }

  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li>
          <Link href="/"><button className="btn-logo">Krumbs</button></Link>
        </li>
        {currentUser ? (
          <>
          <li className="nav-item has-dropdown push-left">
            <a className='avatar' href='#'>{displayName[0]}</a>
            <div className="dropdown">
              <p className='dropdown-name'>{displayName}</p>
              <Link href="/profile"><button className='btn'>Profile</button></Link>
              {isAdmin ? (
                <Link href="/admin"><button className='btn'>Admin</button></Link>
              ):
                <></>
              }
              <button className='btn' onClick={handleSubmit}>Logout</button>
            </div>
          </li>
          </>
          ) : 
          <li>
            <Link href="/login"><button className='btn'>Login</button></Link>
          </li>
        }
      </ul>
    </nav>
  )
}
