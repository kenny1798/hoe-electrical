import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../../hooks/useAuthContext';
import { msmartAxios } from '../../../api/axios';
import { useNavigate } from 'react-router-dom';

function JoinAsManager() {

const {user} = useAuthContext();
const [teamObj, setTeamObj] = useState([])
const [teamId, setTeamId] = useState(0);
const [managerName, setManagerName] = useState("");
const [yourName, setYourName] = useState("");
const [succMsg, setSuccMsg] = useState("");
const [errMsg, setErrMsg]= useState("");
const nav = useNavigate();

useEffect(() => {
  msmartAxios.get('/api/msmart/get/team/list', {headers: {
    accessToken: user.token
  }}).then((response) => {
    setTeamObj(response.data)
  })
}, [])


const submitForm = () => {
  setErrMsg("")
  setSuccMsg("")
  const data = {teamId:parseInt(teamId, 10), managerName:managerName, yourName:yourName}
  msmartAxios.post('/api/msmart/join/manager', data, {headers: {
    accessToken:user.token
  }}).then((response) => {
    if(response.data.succMsg){
      setSuccMsg(response.data.succMsg);
      setErrMsg("");
      const delay = () => {
        nav('/msmart');
      }
      setTimeout(delay, 2000)
    }else{
      setErrMsg(response.data.error);
      setSuccMsg("");
    }
  })
}

console.log(teamId)

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">M-SMART</h1>
        <p style={{fontSize:"1rem"}}>No more 1000 files on your desk and desktop. Say hello to M-Smart 😎</p>
        </div>

        <div className='row justify-content-center my-2'>
    <div className='col-md-8'>
  {succMsg ? (<div class="alert alert-success text-center" role="alert"> {succMsg}
        </div>) : (<></>)}
  {errMsg ? (<div class="alert alert-danger text-center" role="alert"> {errMsg}
        </div>) : (<></>)}
  
  <div className='card'>
  <div className='row justify-content-center mb-5'>
    <div className="col-md-12">
      <div className='row g-3 my-3 justify-content-center'>
  <div className="col-lg-8">
  </div>
  </div>
  <div className='container'>
  <div className='row justify-content-center text-start'>
  <div className='col-lg-8'>
  <label><strong>Select Team</strong></label>
  <select class="form-select mt-1" onChange={(event) => {setTeamId(event.target.value)}}>
              <option value="" selected>Please Select a team..</option>
 {teamObj.map((value, key) => {
  return (          
              <option value={value.id}>{value.teamName}</option>
            
  )
})}
</select>


            

              <label className='mt-5'><strong>Group Name</strong></label>
              <input className='form-control mt-1' type='text' onChange={(event) => {setManagerName(event.target.value)}} />

              <label className='mt-5'><strong>Your Name</strong></label>
              <input className='form-control mt-1' type='text' onChange={(event) => {setYourName(event.target.value)}} />

          <div className="d-grid my-3 gap-2">
          <button className='btn btn-primary mt-5' onClick={submitForm}>Submit Form</button>
          </div>
          
    
  </div>
  </div>
  </div>
</div>
</div>
    </div>
    </div>
    </div>
        
        </div>
        </div>
      </div>
  )
}

export default JoinAsManager