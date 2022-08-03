import { useRouter } from 'next/router'
import AuthCheck from "../../components/AuthCheck";

export default function coursePage({}) {
  const router = useRouter()
  router.push('/courses')
  return (
    <main>
    </main>
  )
}
