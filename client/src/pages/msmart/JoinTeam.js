import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext';
import { msmartAxios } from '../../api/axios';
import { useNavigate } from 'react-router-dom';

function JoinTeam() {

  const {user} = useAuthContext();
  const [teamObj, setTeamObj] = useState([]);
  const [managerObj, setManagerObj] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [managerName, setManagerName] = useState("");
  const [yourName, setYourName] = useState("");
  const [succMsg, setSuccMsg] = useState("");
  const [errMsg, setErrMsg]= useState("");
  const nav = useNavigate();

const getManager = () => {
      msmartAxios.get(`/api/msmart/get/manager/list/${teamName}`, {headers: {
        accessToken:user.token
      }}).then((response) => {
        setManagerObj(response.data);
      })
  }
      

  useEffect(() => {
    msmartAxios.get('/api/msmart/get/team/list', {headers: {
      accessToken: user.token
    }}).then((response) => {
      setTeamObj(response.data)
    })
  }, [user.token])


  const submitForm = async () => {
    setSuccMsg("");
    setErrMsg("");
    const data = {teamName:teamName, managerName:managerName, yourName:yourName}
    await msmartAxios.post('/api/msmart/join/team', data, {headers: {
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
          <select class="form-select mt-2" onClick={getManager} onChange={(event) => {setTeamName(event.target.value)}} required>
                <option value="" selected="">Select Team..</option>
            {teamObj.map((value, key) => {
              return(<option value={value.id}>{value.teamName}</option>)
            })}
            </select>
            
{!teamName ? (<></>) : (<div>
  <label className='mt-4'><strong>Select Manager</strong></label>
  <select class="form-select mt-2" onChange={(event) => {setManagerName(event.target.value)}} required>
  <option value="" selected="">Select Manager..</option>{managerObj.map((value, key) => {
  return(
  
  <option value={value.managerName}>{value.managerName}</option>

  )      
})}</select>
</div>)}
            
            
            

            <label className='mt-4'><strong>Your Name</strong></label>
            <input className='form-control' type='text' onChange={(event) => {setYourName(event.target.value)}} required />

          <div className="d-grid my-3 gap-2">
          <button className='btn btn-primary mt-5' onClick={submitForm}>Join Team</button>
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

export default JoinTeam