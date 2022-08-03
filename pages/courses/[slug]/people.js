import AuthCheck from "../../../components/AuthCheck";
import { db} from '../../../lib/firebase';
import { useRouter } from 'next/router';
import React, { useRef, useState, useEffect} from "react"
import toast from 'react-hot-toast';
import styles from '../../../styles/Courses.module.css'
import firebase from 'firebase/app'
import { useAuth } from "../../../lib/authContext"

export default function peoplePage() {
  const router = useRouter()
  const { slug } = router.query;
  const [participants, setParticipants] = useState([])
  const { isAdmin } = useAuth()

  function findUserRole(user){
    for (const prop in user)
      if(user[prop] === true) return prop
    return 'none'
  }

  db.collection('courses').doc(slug)
  .onSnapshot(async (doc) => {
    if(!doc.exists) return
    let results = []
      
      for (const uidd in doc.data().members) {
      const user = doc.data().members[uidd]
      const data ={
        name: user.name,
        role: findUserRole(user),
        uid: uidd
      }
      results.push(data)
    }
    setParticipants(results)
  })

  return (
    <main>
      <AuthCheck>
        <ParticipantsList participants={participants}/>
        {isAdmin ? (
        <div className='adminPanel'>
          <AddNewParticipant participants={participants}/>
        </div>
        ) : null }
      </AuthCheck>
    </main>
  )
}


function ParticipantsList(props) {
  const router = useRouter()
  const { slug } = router.query;
  return (
    <div className='main-content'>
    <table>
      <thead>
        <tr>
          <th className='table-course-title'>Name</th>
          <th className='table-course-action'>Role</th>
          <th className='table-course-action'>Action</th>
        </tr>
      </thead>
      <tbody>
      {props.participants ? props.participants.map((user, i) => 
        <tr key={i}>
          <td>{user.name}</td>
          <td>{user.role}</td>
          <td>
            <EditParticipant user={user} course={slug}/>
          </td>
        </tr>
      ): null}
      </tbody>
    </table>
    </div>
  )
}

function AddNewParticipant(props) {
  const router = useRouter()
  const { slug } = router.query;
  const userRef = useRef()
  const queryField = useRef()
  const [people, setPeople] = useState([])
  const [open, setOpen] = useState(false);

  const queryMembers = async (e) => {
    e.preventDefault();
    let result = []
    let participants = props.participants.map(a => a.uid)

    db.collection('users').where(queryField.current.value, '>=',userRef.current.value)
    .where(queryField.current.value, '<=', userRef.current.value+ '\uf8ff')
    .get().then((item) => {
      item.forEach(doc => {
        if(!participants.includes(doc.id)){
          result.push({
            uid: doc.id,
            name: doc.data().displayName,
            studentId: doc.data().studentId
          })
        }
      })
      setPeople(result)
    })
  };

  const addNewMember = async (e, user) => {
    e.stopPropagation()
    let data = {}
    console.log(user.uid)
    data[`members.${user.uid}`] = {
        name: user.name,
        coordinator: false,
        student: true,
        teacher: false
    }
    db.collection('courses').doc(slug).update(data)
    setOpen(!open)
  }

  return (
    <>
      <button onClick={() => setOpen(!open)} className={`btn btn-fixed ${styles.btnCreate}`}>
        Add
      </button>

      {open && (
        <div className='popup-container'>
        <div className='popup-content'>
          <div className='popup-header'>
            <h3>Search Users</h3>
            <button onClick={() => setOpen(!open)} className="popup-close">✖</button>
          </div>
          <form className='popup-form' onSubmit={queryMembers}>
            <label>Search using   </label>
            <select ref={queryField}>
              <option value="studentId">StudentID</option>
              <option value="displayName">Name</option>
            </select>
            <label>Query </label>
            <input className={styles.input100} ref={userRef} type="text" placeholder="Name / StudentID" required/>
            {people ? people.map((user) => 
              <div className='userInfo'>{user.name} - {user.studentId}<div onClick={(e) => addNewMember(e, user)} className='user btn btn-adduser'>Add Member</div></div>
            ) : null}
            <button type="submit" className='btn btn-green'>Find</button>
          </form>
        </div>
        </div>
       
      )}
    </>
  )
}

function EditParticipant(props){
  const refNewRole= useRef()
  const [open, setOpen] = useState(false);

  
  const changeRole = async (e) => {
    e.stopPropagation()
    e.preventDefault()
    let data = {}
    data[`members.${props.user.uid}.${refNewRole.current.value}`] = true
    data[`members.${props.user.uid}.${props.user.role}`] = false
    db.collection('courses').doc(props.course).update(data)
    setOpen(!open)
  }

  function deleteUser(e){
    e.stopPropagation()
    e.preventDefault()
    const doIt = confirm('are you sure!')
    let data = {}
    data[`members.${props.user.uid}`] = firebase.firestore.FieldValue.delete()
    if (doIt) {
      db.collection('courses').doc(props.course).update(data)
    }
    setOpen(!open)
  }

  return (
    <>
      <div className='action' onClick={(e) => setOpen(!open)}> Edit</div>
      {open && (
        <div className='popup-container'>
        <div className='popup-content'>
          <div className='popup-header'>
            <h3>{props.user.name} - {props.user.role}</h3>
            <button onClick={() => setOpen(!open)} className="popup-close">✖</button>
          </div>
          <form className='popup-form' onSubmit={changeRole}>
            <label>Update role to</label>
            <select ref={refNewRole}>
              <option value="student">student</option>
              <option value="coordinator">coordinator</option>
              <option value="teacher">teacher</option>
            </select>
            <button type="submit" className='btn btn-green btn-inline '>Update Role</button>
            <button onClick={(e) => deleteUser(e)} className='btn btn-red btn-inline '>Remove Member</button>
          </form>
        </div>
        </div>
      )}
    </>
  )
}
