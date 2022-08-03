import { useAuth } from "../lib/authContext"
import { useRouter } from 'next/router'
import Link from 'next/link';

// Component's children only shown to logged-in users
export default function AuthCheck(props) {
  const router = useRouter()
  const { currentUser } = useAuth()
  return  currentUser ? props.children : 'You must be signed in to view this page'
}
