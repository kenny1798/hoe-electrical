import React, { useEffect, useRef, useState } from "react";
import { muAxios } from "../../api/axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";

function MuMonitor() {

    const {user} = useAuthContext();
    const [course, setCourse] = useState("")
    const [username, setUsername] = useState("")
    const [err, setErr] = useState("");
    const [err1, setErr1] = useState("");
    const [progress, setProgress] = useState([])
    const [lesson, setLesson]= useState(null);
    const [searchTerm, setSearchTerm] = useState("");
 

    const submitData = (e) => {
      e.preventDefault()
      setErr("")
      setErr1("")
      const data = {username: username}
      muAxios.get(`/api/mu/manager/get/progress/${course}`, {headers: {
        accessToken: user.token
      }}).then((response) => {
        console.log(response.data.data)
          setProgress(response.data.data)
          setLesson(response.data.vidCount)
      })
    }

    const filteredProgress = progress.filter((val) =>
      val.user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className='App2'>
      <div className="row justify-content-center text-center mt-5">
        <div className="col-lg-8 justify-content-center">
        {err && (<div class="alert alert-danger mx-5 mb-4" role="alert">
                    {err}
                    </div>)}
          <div className="card">
          <div className="text-start mx-5 mt-4 mb-3"><b>Course</b>
          <select className="form-select" onChange={(event) => {setCourse(event.target.value)}}>
            <option></option>
            <option value="product">Product Knowledge</option>
            <option value="fcm">Free Cost Marketing</option>
          </select>
        </div>
        <div className="d-grid mb-4 mx-5">
          <button className="btn btn-sm btn-dark" onClick={submitData}>Submit</button>
        </div>
          </div>


        <div className='card'>

    <div className='card-body'>
    <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by LG Code"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
      <table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">LG Code</th>
      <th scope="col">Name</th>
      <th scope="col">Lesson</th>
    </tr>
  </thead>
  <tbody>
{!progress ? (<></>): (filteredProgress.sort((a,b) => b.currentLesson - a.currentLesson).map((val,i) => {

  console.log(val)
            return(
                <tr><th scope="row">{i+1}</th>
                <td>{val.user.username}</td>
                <td>{val.user.name}</td>
                <td>{val.progress.currentLesson} / {lesson}</td></tr>
            )
        }))}
        


  </tbody>
</table></div>
</div>
</div>
</div>
    </div>
  )
}

export default MuMonitor