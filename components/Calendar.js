import {React, useState, useEffect} from "react"
import { startOfWeek, startOfDay, addWeeks, subWeeks, addDays, isSameDay, format, isEqual, getMonth } from 'date-fns'
import { db, auth} from "../lib/firebase"
import styles from '../styles/Calendar.module.css'
import Link from 'next/link'

function getWorkDays(start) {
  let date = startOfWeek(startOfDay(start))
  const week = [...Array(7)].map((_, i) => addDays(date, i))
  return week;
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState( startOfDay(new Date()));
  const [currentWeek, setCurrentWeek] = useState( startOfWeek(startOfDay(new Date())));
  const data = getWorkDays(currentWeek)
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    getTodos();
  }, []); // blank to run only on first launch
 
  async function  getTodos() {
    const query = db.collectionGroup('practicals').orderBy('createdAt')
    const posts = (await query.get()).docs.map((doc) => {
      let test = doc.data()
      test['id'] = doc.id
      return test
    });
  
    setTodos(posts)
  }

  function nextWeek() {
    setSelectedDate(addWeeks(selectedDate, 1))
    setCurrentWeek(addWeeks(currentWeek, 1))
  };

  function prevWeek() {
    setSelectedDate(subWeeks(selectedDate, 1))
    setCurrentWeek(subWeeks(currentWeek, 1))
  };

  function onDateClick(day){
    setSelectedDate(day)
  };

  return(
  <div className={styles.timetable}>
    <h3 className={styles.header}>Timetable</h3>
    <div className={`${styles.monthheader}`}>
      <div className={styles.monthitem} onClick={prevWeek}>
        <div className={styles.arrowLeft}></div>
      </div>
      <div className={styles.monthtext}>{format(currentWeek, 'MMMM')}</div>
      <div className={styles.monthitem} onClick={nextWeek}>
        <div className={styles.arrowRight}></div>
      </div>
    </div>
    <div className={styles.weekheader}>
      {
        ["Sun","Mon", "Tue", "Wed", "Thu", "Fri","Sat"].map(dayName =>
          <div className={`${styles.weekitem} ${styles.weekhighlight}`}>{dayName}</div>)
      }
    </div>

    <div className={styles.weekheader}>
      {
        data.map(day => 
          <div className={styles.weekitem}>
            <div className={`${styles.dayitem}
              ${
              isSameDay(day, selectedDate) ? styles.selected : ""
              }
              ${todos.filter(todo => isEqual(startOfDay(todo.startDate.toDate()),day) === true).length > 0 ? styles.available : "" } 
              `}
              
              key={day}
              onClick={() => onDateClick(day)}
            >
              { format(day, 'dd') }
            </div>
          </div>
        )
      }
    </div>
    <div style={{ width: "90vw", maxWidth: "500px", marginTop: "24px" }}>
      {todos.filter(todo => isEqual(startOfDay(todo.startDate.toDate()),selectedDate) === true).map((todo) => (
        <>
        {todo.location === 'Online' ? (
        <Link href={`/queue/${todo.id}`} key={todo.id}> 
        <div className={styles.card} >
          
          <p className={styles.time}><strong>{format(todo.startDate.toDate(), 'HH:mm ')} - {format(todo.endDate.toDate(), 'HH:mm ')} </strong></p>
          <p><strong>Course:</strong> {todo.course}</p>
          <p><strong>Location:</strong> {todo.location}</p>
        </div>
        </Link>
        ) : (
          <Link href={`courses/${todo.course}/practical/${todo.id}`} key={todo.id}> 
          <div className={styles.card} >
            
            <p className={styles.time}><strong>{format(todo.startDate.toDate(), 'HH:mm ')} - {format(todo.endDate.toDate(), 'HH:mm ')} </strong></p>
            <p><strong>Course:</strong> {todo.course}</p>
            <p><strong>Crowd Level:</strong> {todo.status}</p>
            <p><strong>Location:</strong> {todo.location}</p>
          </div>
          </Link>
        ) }</>
      ))}
    </div>
  </div>
  )
}
