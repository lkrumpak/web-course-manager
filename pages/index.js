
import Calendar from '../components/Calendar'
import AuthCheck from '../components/AuthCheck'
import styles from '../styles/Courses.module.css'
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const goCourse = () => {
    router.push(`/courses`);
  }
  return (
    <main>
      <AuthCheck>
        <div className='mainContent'>
          <Calendar/>
        </div>
        <div className='adminPanel test'>
          <button type="button" onClick={goCourse} className={`btn ${styles.btnCreate}`}>Courses</button>
        </div>
      </AuthCheck>
    </main>
  )
}
