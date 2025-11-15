import React, { useEffect, useRef, useState } from "react";
import { muAxios } from "../../api/axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAdminContext } from "../../hooks/useAdminContext";

function Data({setNavbar, props}) {

    const {admin} = useAdminContext();
    const {course} = useParams();
    const [username, setUsername] = useState("")
    const [err, setErr] = useState("");
    const [err1, setErr1] = useState("");
    const [progress, setProgress] = useState([])

    useEffect(() => {
      setNavbar(false);
  })  

    const submitData = (e) => {
      e.preventDefault()
      setErr("")
      setErr1("")
      const data = {username: username}
      muAxios.post(`/api/mu/all/get/progress/${course}`, data, {headers: {
        adminToken: admin.token.adminToken
      }}).then((response) => {
        console.log(response.data)
          setProgress(response.data.data)
          if(response.data.err.length > 0 && response.data.err1.length > 0){
            const errlist = response.data.err.join(', ')
            setErr(`User ${errlist} not exist`)
            const errlist1 = response.data.err1.join(', ')
            setErr1(`User ${errlist1} already exist`)
          }else if (response.data.err.length == 0 && response.data.err1.length > 0){
            const errlist1 = response.data.err1.join(', ')
            setErr1(`User ${errlist1} already exist`)
          }else if (response.data.err.length > 0 && response.data.err1.length == 0){
            const errlist = response.data.err.join(', ')
            setErr1(`User ${errlist} not exist`)
          }else{
            setErr("")
            setErr1("")
          }
      })
    }

  return (
    <div className='App2'>
      <div className="row justify-content-center text-center mt-5">
        <div className="col-lg-8 justify-content-center">
        <div className='card justify-content-center'>
        <div className="text-start mx-5 my-4"><b>USERNAME</b>
        <textarea className="form-control" rows="5" onChange={(event) => {setUsername(event.target.value)}} />
        <div className="d-grid gap-2 mt-4 mb-4"><button type="submit" className="btn btn-success" onClick={submitData}>submit</button></div>
        </div>
        {err && (<div class="alert alert-danger mx-5 mb-4" role="alert">
                    {err}
                    </div>)}

        {err1 && (<div class="alert alert-danger mx-5 mb-4" role="alert">
                    {err1}
                    </div>)}
        </div>
        <div className='card'>
        <div className="d-flex justify-content-end mt-2 mx-3"><button type="submit" className="btn btn-secondary btn-sm" onClick={submitData}>Refresh</button></div>

    <div className='card-body'><table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">username</th>
      <th scope="col">course</th>
      <th scope="col">Lesson</th>
    </tr>
  </thead>
  <tbody>
{!progress ? (<></>): (progress.sort((a,b) => b.currentLesson - a.currentLesson).map((val,i) => {
            return(
                <tr><th scope="row">{i+1}</th>
                <td>{val.username}</td>
                <td>{val.shortlink}</td>
                <td>{val.currentLesson}</td></tr>
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

export default Data