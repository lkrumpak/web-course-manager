import Link from 'next/link';
import { startOfWeek, startOfDay, addWeeks, subWeeks, addDays, isSameDay, format, isEqual, getMonth } from 'date-fns'


export default function PracticalFeed({ posts, admin }) {
  return posts ? posts.map((post) => <PracticalItem post={post} admin={admin} />) : null;
}

function PracticalItem({ post, admin = false }) {
 
  return (
    <div className="card">
     
        <a>
          <strong>By @{post.location}</strong>
        </a>
    

      
        <h2>
          <a>{format(post.start.toDate(), 'MMMM dd')}</a>
        </h2>
    

      {/* If admin view, show extra controls for user */}
      {admin && (
        <>
          
            <h3>
              <button className="btn-blue">Edit</button>
            </h3>
          

          {/*post.published ? <p className="text-success">Live</p> : <p className="text-danger">Unpublished</p>*/}
        </>
      )}
    </div>
  );
}