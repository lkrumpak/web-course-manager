import AuthCheck from "../../components/AuthCheck";
import { db, auth, serverTimestamp } from '../../lib/firebase';
import { useAuth } from "../../lib/authContext"
import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';
import Link from 'next/link';
import styles from '../../styles/Courses.module.css'
import DatePicker from 'react-datepicker'
import { format } from 'date-fns'

export default function coursePage({}) {
  const { isAdmin } = useAuth()
  return (
    <main>
      <AuthCheck>
        <CoursesList />
        {isAdmin ? (<CreateNewCourse />) : null}
      </AuthCheck>
    </main>
  )
}

function CoursesList() {
  const [courses, setCourses] = useState([])

  function getCourses() {
    let results = []

    const ref = db.collection('courses')

    ref.where(`members.${auth.currentUser.uid}.coordinator`, '==',true)
    .get().then((item) => {
      results = item.docs.map((doc) => doc.data());
    });

    ref.where('published', '==', true).where(`members.${auth.currentUser.uid}.student`, '==',true)
    .get().then((item) => {
      results = results.concat(item.docs.map((doc) => doc.data()))
    });
    
    ref.where(`members.${auth.currentUser.uid}.teacher`, '==',true)
    .get().then((item) => {
      results = results.concat(item.docs.map((doc) => doc.data()))  
      setCourses(results)
    });
  };
  
  useEffect(() => {
    getCourses();
  }, []);
  
  return (
    <div className='main-content'>
    <h1>Courses</h1>
    <table>
      <thead>
        <tr>
          <th className='table-course-title'>Course</th>
          <th className='table-course-term'>Term</th>
          <th className='table-course-published'> Published</th>
        </tr>
      </thead>
      <tbody>
      {courses ? courses.map((course) => 
      
      <tr key={course.name}>
        <td><Link href={`/courses/${course.slug}`}>{course.name}</Link></td>
        <td>{course.term}</td>
        <td>{course.published ? (<p>Yes</p>) : (<strong>No</strong>)}</td>
      </tr>

      ) : null}
      </tbody>
    </table>
    </div>
  )
}

function CreateNewCourse() {
  // popup
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  const router = useRouter()
  const slug = encodeURI(kebabCase(name));
  const { displayName } = useAuth()
  const isValid = name.length > 3 && name.length < 25;

  // ref
  const refSelect = useRef()

  // DatePicker
  const [startDate, setStartDate] = useState(new Date());

  const createCourse = (e) => {
    e.preventDefault();

    const ref = db.collection('courses').doc(slug)
    const courseTerm = format(startDate, 'yyyy') + ' - ' + refSelect.current.value

    let createdBy = {}
    createdBy[auth.currentUser.uid] = {
      name: displayName,
      coordinator: true,
      student: false,
      teacher: false
    }
    
    const data = {
      name,
      slug,
      published: false,
      term: courseTerm,
      createdAt: serverTimestamp(),
      members: createdBy
    }

    try {
      ref.set(data);
    } catch {
      toast.error('Failed to create a new course!')
    }

    toast.success('New course created!')
    router.push(`/courses/${slug}`);
  }

  return (
    <div className='adminPanel'>
      <button onClick={() => setOpen(!open)} className={`btn ${styles.btnCreate}`}>
        Create Course
      </button>
      {open && (
        <div className='popup-container'>
        <div className='popup-content'>
          <div className='popup-header'>
            <h3>Create Course</h3>
            <button onClick={() => setOpen(!open)} className="popup-close">✖</button>
          </div>

          <form className='popup-form' onSubmit={(e) => createCourse(e)}>
            <label>Course Name</label>
            <input type='text' value={name} onChange={(e) => setName(e.target.value)} placeholder="Computer Programming" />
            <label>Starting Year</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              showYearPicker
              dateFormat="yyyy"
            />
            <label>Period</label>
              <select ref={refSelect}>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
                <option value="P4">P4</option>
                <option value="P5">P5</option>
                <option value="P6">P6</option>
              </select>
            <button type="submit" disabled={!isValid} className='btn btn-green'>Create New Course</button>
          </form>
        </div>
        </div>
      )}
    </div>
  )
}