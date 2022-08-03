import { useRouter } from 'next/router'
import { db} from '../../../../lib/firebase';
import React, { useEffect, useState} from "react"
import AuthCheck from "../../../../components/AuthCheck";
import {useAuth }from "../../../../lib/authContext"
import toast from 'react-hot-toast';

export default function practicalPage({}) {
  const router = useRouter()
  const { id } = router.query
  const { slug } = router.query
  const [status,setStatus] = useState('')
  const { isAdmin } = useAuth()

  function getInfo(){
    db.collection('queues').doc(id).get().then(doc => {
      if(doc.exists){
        router.push(`/queue/${id}`)
      } else {
        db.collection('courses').doc(slug).collection('practicals').doc(id)
        .onSnapshot(doc => {
          if(doc.exists) {
          setStatus(doc.data().status)
          }
        })
      }
    })
  }

  useEffect(() => {
    getInfo()
  }, [])
 
  return (
    <main>
      <AuthCheck>
        <div>
        <h2>Practical Page</h2>
        <p>Crowd Status: <strong>{status}</strong></p>
        </div>
        {isAdmin ? (<AdminPanel />) : null}
      </AuthCheck>
    </main>
  )
}

function AdminPanel(){
  const router = useRouter()
  const { slug } = router.query;
  const { id } = router.query;
  const postRef = db.collection('courses').doc(slug).collection('practicals').doc(id);
  const [status,setStatus] = useState('low')
  const [open, setOpen] = useState(false);

  const deletePost = async () => {
    const doIt = confirm('are you sure!')

    if (doIt) {
      try {
        await postRef.delete();
      } catch (err){
        toast.error('Was unable to delete the course');
        console.log(err)
        return
      }
      
      toast.success('Succefully deleted the course');
      router.push(`/courses/${slug}`);
    }
  }

  const changeStatus= async (e) => {
    e.preventDefault()
    db.collection('courses').doc(slug).collection('practicals').doc(id).update({
      status: status
    })
  }

  return(<div className='adminPanel'>
  <button className={`btn btn-fixed btn-green`} onClick={() => setOpen(!open)}>
      Change Crowd Status
    </button>
    <button className={`btn btn-fixed btn-red`} onClick={deletePost}>
      Delete Practical
    </button>
    {open && (
        <div className='popup-container'>
          <div className='popup-content'>
            <div className='popup-header'>
              <h3>Change Crowd Status</h3>
              <button onClick={() => setOpen(!open)} className="popup-close">✖</button>
            </div>
           
            <form className='popup-form' onSubmit={(e) => changeStatus(e)}>
              <label>Crowds level</label>
              <select onChange={(e) => setStatus(e.target.value)}>
                <option value="Low">low</option>
                <option value="Moderate">Moderate</option>
                <option value="Busy">Busy</option>
              </select>
              <button type="submit" className='btn btn-green'>Update</button>
            </form>
          </div>
        </div>
      )}
   </div>
  )
}