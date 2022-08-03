import AuthCheck from "../../components/AuthCheck";
import { db, auth, serverTimestamp } from '../../lib/firebase';
import { useAuth } from "../../lib/authContext"
import { useCollection } from 'react-firebase-hooks/firestore';
import { useRouter } from 'next/router';
import React, { useRef, useState, useEffect} from "react"
import toast from 'react-hot-toast';
import styles from '../../styles/Queue.module.css'
import { startOfWeek, startOfDay, addWeeks, subWeeks, addDays, isSameDay, format, isEqual, getMonth, formatDistanceStrict, setMinutes, setHours } from 'date-fns'
import Link from 'next/link'
import DatePicker  from 'react-datepicker'


export default function queuePage({}) {
  const { isAdmin } = useAuth()
  return (
    <main>
      <AuthCheck>
        {isAdmin ? (<VirtualMeeting/>) : (<StudentQueue/>)}
      </AuthCheck>
    </main>
  )
}

function StudentQueue(){
  const router = useRouter()
  const { id } = router.query;
  const { displayName } = useAuth();

  const [queueStatus, setQueueStatus] = useState(false)
  const [meetingStatus, setmeetingStatus] = useState(false)
  const [position, setPosition] = useState('...')

  const [teacher,setTeacher]= useState('-')
  const [time,setTime]= useState('')
  const [virtualLink,setvirtualLink]= useState('-')
  const refCourseName = useRef()
 
  useEffect(() => {
    const unsubscribe = db.collection('queues').doc(id).collection('queue').doc(auth.currentUser.uid)
    .onSnapshot(async (doc) => {
      
      if(doc.exists) {
        setQueueStatus(true)  
        setmeetingStatus(doc.data().inMeeting)
        setTime(await doc.data().createdAt)
        setTeacher(doc.data().teacher.name)
        setvirtualLink(doc.data().meetingLink)
      
      } else {
        setQueueStatus(false)
        setmeetingStatus(false)
      }
    })
    db.collection('queues').doc(id).get().then(doc => {
      if(doc.exists) {
      refCourseName.current = doc.data().courseName
      }
    })

    return () => unsubscribe()
  }, [])
  

  useEffect(() => {
     db.collection('queues').doc(id).collection('queue')
    .where('createdAt', '<=', time)
    .onSnapshot(docc => {
      setPosition(docc.size)
    })
    console.log(time)
  
  }, [time])

  function joinQueue(e) {
    e.preventDefault();

    const ref = db.collection('queues').doc(id).collection('queue').doc(auth.currentUser.uid)

    const data = {
      displayName,
      createdAt: serverTimestamp(),
      teacher: {},
      inMeeting: false,
      meetingLink: ''
    }
    
    try {
      ref.set(data);
    } catch {
      toast.error('Failed to join Queue!')
    }

    toast.success('You have joined the queue!')
  }

  function leaveQueue(e){
    e.preventDefault();
    try{
      db.collection('queues').doc(id).collection('queue').doc(auth.currentUser.uid).delete()
    }catch{

    }
  }
  return(
    <>
    <div className={styles.card}>
      <h2>{refCourseName.current}</h2>
      {queueStatus ? (
        <>
        {!meetingStatus ? (
          <h3>Your queue position is <strong>{position}</strong></h3>
        ): (
          <>
          <h3>Your teacher is: <strong>{teacher}</strong></h3>
          <h3>Meeting link: <strong><a href={virtualLink} target='_blank'>{virtualLink}</a></strong></h3>
          <p>You have 2 minutes to join the meeting. Otherwise you will have to requeue</p>
          </>
        )}
        <button onClick={(e) => leaveQueue(e)} className='btn btn-fixed btn-red'>
          Leave
        </button>
        </>
      ):(
        <>
        <h3>There are currently <strong>{position}</strong> people in the queue.</h3>
        <button  onClick={(e) => joinQueue(e)} className='btn btn-fixed btn-green'>
          Join Queue
        </button>
        </>
      )}
      
    </div>
    </>
  )
}

function VirtualMeeting(){
  const router = useRouter()
    const { id } = router.query
  
    const ref = db.collection('queues').doc(id).collection('queue').orderBy('createdAt')
    const [querySnapshot] = useCollection(ref)
    const practicals = querySnapshot?.docs
  return (
    <div className='main-content'>
    <h1>Virtual Queue</h1>
    <table>
      <thead>
        <tr>
          <th className='table-course-title'>name</th>
          <th className='table-course-action'>Joined</th>
          <th className='table-course-action'>Teacher</th>
          <th className='table-course-action'>In Meeting</th>
          <th className='table-course-action'>Action</th>
        </tr>
      </thead>
      <tbody>
       
        {practicals ? practicals.map((practical) => 
        
            <tr key={practical.id}>
              <td>{practical.data().displayName}</td>
              <td>{format(practical.data().createdAt.toDate(), 'HH:mm')}</td>
              <td>{practical.data().teacher.name}</td>
              <td>{practical.data().inMeeting ? (<p className={styles.statusTrue}>Yes</p>) :  (<p className={styles.statusFalse}>No</p>) }</td>
              <td><EditMeeting user={practical.data()} uid={practical.id} status={practical.data().isMeeting}/></td>
            </tr> 
          
        ) : null}
      </tbody>
    </table>
    </div>
  )
}

function EditMeeting(props){
  const refMeeting = useRef()
  const [open, setOpen] = useState(false);

  const router = useRouter()
  const { id } = router.query
  const {displayName} = useAuth()
  
  const createMeeting = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    console.log(displayName)
    db.collection('queues').doc(id).collection('queue').doc(props.uid).update(
      {
        teacher : {
          uid:auth.currentUser.uid,
          name: displayName
        },
        inMeeting: true,
        meetingLink: refMeeting.current.value
      }
    )
    setOpen(!open)
  }

  const leaveMeeting = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    db.collection('queues').doc(id).collection('queue').doc(props.uid).update(
      {
        teacher : {},
        inMeeting: false,
        meetingLink: ''
      }
    )
    setOpen(!open)
  }
  
  function removeUser(e){
    e.stopPropagation()
    e.preventDefault()
    try{
      db.collection('queues').doc(id).collection('queue').doc(props.uid).delete()
    }catch (error){
      console.log(error)
    }
    setOpen(!open)
  }

  return (
    <>
      <div className='action' onClick={(e) => setOpen(!open)}> Info</div>
      {open && (
        <div className='popup-container'>
        <div className='popup-content'>
          <div className='popup-header'>
            <h3>{props.user.displayName}</h3>
            <button onClick={() => setOpen(!open)} className="popup-close">✖</button>
          </div>
          <form className='popup-form' onSubmit={(e) =>createMeeting(e)}>
            <label>Meeting Link</label>
            <input type='text' ref={refMeeting}></input>
            {props.user.inMeeting ? (<>
            <button type="submit" className='btn btn-green '>Resend Meeting Link</button>
            <button onClick={(e) => leaveMeeting(e)}  className='btn btn-red btn-inline '>Leave Meeting</button>
            <button onClick={(e) => removeUser(e)} className='btn btn-red btn-inline '>Complete Meeting</button>
            </>):
            (<>
            <button type="submit" className='btn btn-green btn-inline '>Create Meeting</button>
            <button onClick={(e) => removeUser(e)} className='btn btn-red btn-inline '>Remove from Queue</button>
            </>)}
          </form>
        </div>
        </div>
      )}
    </>
  )
}