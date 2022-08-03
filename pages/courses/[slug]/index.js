import AuthCheck from "../../../components/AuthCheck";
import { db, auth, serverTimestamp } from '../../../lib/firebase';
import { useAuth } from "../../../lib/authContext"
import { useCollection } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import React, { useRef, useState, useEffect} from "react"
import toast from 'react-hot-toast';
import styles from '../../../styles/Courses.module.css'
import { startOfWeek, startOfDay, addWeeks, subWeeks, addDays, isSameDay, format, isEqual, getMonth, formatDistanceStrict, setMinutes, setHours } from 'date-fns'
import Link from 'next/link'
import DatePicker  from 'react-datepicker'



export default function coursePage({}) {
  const { isAdmin } = useAuth()
  return (
    <main>
      <AuthCheck>
        <PracticalList/>
        {isAdmin ? (<AdminPanel />) : null}
      </AuthCheck>
    </main>
  )
}

function PracticalList() {
  const router = useRouter()
  const { slug } = router.query

  const ref = db.collection('courses').doc(slug).collection('practicals')
  const [querySnapshot] = useCollection(ref)
  const practicals = querySnapshot?.docs

  return (
    <div className='main-content'>
    <h1>Practicals</h1>
    <table>
      <thead>
        <tr>
          <th className='table-course-title'>Date</th>
          <th className='table-course-term'>Time</th>
          <th className='table-course-published'>Location</th>
        </tr>
      </thead>
      <tbody>
       
        {practicals ? practicals.map((practical) => 
          <Link href={`/courses/${slug}/practical/${practical.id}`} key={practical.id}>
            <tr>
              <td>{format(practical.data().startDate.toDate(), 'MMMM dd')}</td>
              <td>{format(practical.data().startDate.toDate(),'HH:mm') } - { format(practical.data().endDate.toDate(),'HH:mm')}</td>
              <td>{practical.data().location === 'zoom' ? ('hi') : practical.data().location}</td>
            </tr> 
          </Link>
        ) : null}
      </tbody>
    </table>
    </div>
  )
}

function AdminPanel() {
  return (
    <div className='adminPanel'>
      <CreateNewPractical />
      <PublishCourse />
      <People/>
      <DeleteCourse/>
    </div>
  )
}

function People() {
  const router = useRouter();
  const { slug } = router.query
  const goCourse = () => {
    router.push(`/courses/${slug}/people`);
  }

  return(
    <button onClick={goCourse}  className={`btn btn-fixed btn-green`}>
      People
    </button>
  )
}

function PublishCourse() {
  const router = useRouter()
  const [status, setStatus] = useState()
  const { slug } = router.query

  async function getCourseStatus() {
    await db.collection('courses').doc(slug).get().then((item) => {
      if(item.exists){
        setStatus(item.data().published)
      }
    })
  }
  
  useEffect(() => {
    getCourseStatus()
  }, [])

  async function publishCourse() {
    try {
      await db.collection('courses').doc(slug).update({
        published: !status
      })
      setStatus(!status)

    } catch {
      toast.error('Was unable to publish the course')
      return
    }
    const msg = status ? 'Course has been successfully unpublished' : 'Course has been successfully published'
    toast.success(msg)
  }

  return (
    <button className={`btn btn-fixed ${status ? styles.btnClose : styles.btnCreate}`} onClick={publishCourse}>
      {status ? 'Unpublish' : 'Publish'}
    </button>
  )
}

function DeleteCourse() {
  const router = useRouter()
  const { slug } = router.query;
  const postRef = db.collection('courses').doc(slug);

  const deletePost = async () => {
    const doIt = confirm('are you sure!')

    if (doIt) {
      try {
        await postRef.delete();
      } catch {
        toast.error('Was unable to delete the course');
      }
      
      toast.success('Succefully deleted the course');
      router.push('/courses');
    }
  }

  return (
    <button className={`btn btn-fixed ${styles.btnClose}`} onClick={deletePost}>
      Delete Course
    </button>
  )
}

function CreateNewPractical() {
  const router = useRouter()
  const { slug } = router.query;

  // popup
  const [isOfflineClass, setOfflineClass] = useState(false)
  const [isReacurring, setIsReacurring] = useState(false);
  const [open, setOpen] = useState(false);
  const [participants, setParticipants] = useState([])
  const [multiSelectValue, setMultiSelectValue] = useState()

  // ref
  const refSelect = useRef()
  const refLocation = useRef()
  const refWeeks = useRef(1)

  // DatePicker
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  function handleRecurrenceChange() {
    setIsReacurring(prevValue => !prevValue); // invert value
  }



  function findUserRole(user){
    for (const prop in user)
      if(user[prop] === true) return prop
    return 'none'
  }

  
  useEffect(() => {
    const unsubscribe = db.collection('courses').doc(slug)
    .onSnapshot(async (doc) => {
      if(!doc.exists) return
  
      setParticipants(doc.data().members)
      console.log(doc.data().members)
    })
    return () => {
      unsubscribe
    }
  }, [])
  function handleLocationChange(e){
    if (e.target.value == 'offline'){
      setOfflineClass(true)
      return
    } 
    setOfflineClass(false)
  }
  function handleMultiSet(e){
    console.log(e.target.value)
  }

  function createPractical(e) {
    e.preventDefault();

    var data = {
      course: slug,
      location: isOfflineClass ? refLocation.current.value : 'Online',
      online: isOfflineClass ? false : true,
      status: 'low',
      startDate : startDate,
      endDate: endDate,
      members: participants,
      createdAt: serverTimestamp(),
    }

    let weeks;
    if(isReacurring) {
      weeks = refWeeks.current.value
    } else {
      weeks = 1
    }

    for (let i = 0; i < weeks; i++) {
      data.startDate = addWeeks(startDate, i )
      data.endDate = addWeeks(endDate, i )
      try{
        db.collection('courses').doc(slug).collection('practicals').add(data)
        .then(function(docRef){
          if(!isOfflineClass){
          db.collection('queues').doc(docRef.id).set({
            courseName: slug,
            stats: 0
          })}
        })
        
      } catch{
        toast.error('Was unable to create practical')
        return
      }
    } 
    toast.success('Practical created!')
    setOpen(!open)
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} className='btn btn-fixed btn-green'>
        Create Practical
      </button>
      {open && (
        <div className='popup-container'>
          <div className='popup-content'>
            <div className='popup-header'>
              <h3>Create Practical</h3>
              <button onClick={() => setOpen(!open)} className="popup-close">✖</button>
            </div>
           
            <form className='popup-form' onSubmit={(e) => createPractical(e)}>
              <label>Practical Type</label>
              <select ref={refSelect} onChange={(e) => handleLocationChange(e)}>
                <option value="online">Online (Virtual Queue)</option>
                <option value="offline">Offline</option>
              </select>
              {isOfflineClass && (
                <>
                <label>Location</label>
                <input ref={refLocation} type='text' placeholder="Course Name " />
               
                </>
              )}
              <div className='popup-div'>
                <label>Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    setStartDate(date) 
                    setEndDate(date)
                  }}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
              </div>
              <div className='popup-div'>
                <label>End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  minTime={startDate}
                  maxTime={setHours(setMinutes(new Date(), 59), 23)}
                  minDate={startDate}
                  maxDate={startDate}
                  timeCaption="time"
                  dateFormat="MMMM d, yyyy h:mm aa"
                />
              </div>
              <div>
              <label className='inline-label '>Is this a weekly recurring meeting? </label>
              <input type="checkbox" onChange={handleRecurrenceChange}/>
              </div>
              {isReacurring && (
                <input type='number' ref={refWeeks} placeholder="How many weeks? " />
              )}
              <button type="submit" className='btn btn-green'>Create New Practical</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
