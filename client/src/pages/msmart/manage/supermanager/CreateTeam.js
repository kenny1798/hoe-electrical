import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../../../hooks/useAuthContext';
import { msmartAxios } from '../../../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminContext } from '../../../../hooks/useAdminContext';

function CreateTeam() {

const {admin} = useAdminContext();
const [username, setUsername] = useState("");
const [name, setName] = useState("");
const [password, setPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [email, setEmail] = useState("");
const [phoneNumber, setPhoneNumber] = useState("");
const [teamName, setTeamName] = useState("");
const [link, setLink] = useState("");
const [errMsg, setErrMsg] = useState("");
const [succMsg, setSuccMsg] = useState("");
const [showBtn, setShowBtn] = useState("");
const nav = useNavigate();


const submitForm = () => {
  setErrMsg("")
  setSuccMsg("")
  setShowBtn("submitted")
  const data = {username:username, name:name, password:password, confirmPassword:confirmPassword, email:email, phoneNumber:phoneNumber, teamName:teamName}
  msmartAxios.post('/api/msmart/create/team', data, {headers: {
    adminToken: admin.token.adminToken
  }}).then((response) => {
    if(response.data.succMsg){
      setSuccMsg(response.data.succMsg)
      const delay = () => {
        window.location.reload()
      }
      setTimeout(delay, 2000)
    }else{
      setErrMsg(response.data.error)
      setShowBtn("")
    }
  })
}

const handleUsername = (e) => {
  const newUsername = e.target.value.replace(/[^a-zA-Z0-9_]/g, ''); // Hanya huruf, nombor, dan _
    setUsername(newUsername);// Remove non-numeric characters
};

console.log(username)

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">CREATE TEAM & OWNER</h1>
        <Link to={'/admin'}>Admin Panel</Link> <span>/ Team & Owner Registration</span>
        </div>

        <div className='row justify-content-center my-2'>
    <div className='col-md-8'>
        {!succMsg ?(<></>): (<div class="alert alert-success text-center" role="alert">
          {succMsg}
        </div>)}
        {!errMsg ?(<></>): (<div class="alert alert-danger text-center" role="alert">
          {errMsg}
        </div>)}
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
           <label className='mt-3'><strong>Team Name</strong></label>
              <input className='form-control mt-1' type='text' onChange={(event) => {setTeamName(event.target.value)}} required/>
              <label className='mt-3'><strong>Team WhatsApp Link</strong></label>
              <input className='form-control mt-1' type='text' onChange={(event) => {setLink(event.target.value)}} required/>
            <label className='mt-3'><strong>Name</strong></label>
              <input className='form-control mt-1' type='text' onChange={(event) => {setName(event.target.value)}} required/>
              <label className='mt-3'><strong>Username</strong></label>
              <input className='form-control mt-1' type='text' value={username} onChange={handleUsername} required/>
              <label className='mt-3'><strong>Password</strong></label>
              <input className='form-control mt-1' type='password' onChange={(event) => {setPassword(event.target.value)}} required/>
              <label className='mt-3'><strong>Confirm Password</strong></label>
              <input className='form-control mt-1' type='password' onChange={(event) => {setConfirmPassword(event.target.value)}} required/>
              <label className='mt-3'><strong>Email</strong></label>
              <input className='form-control mt-1' type='email' onChange={(event) => {setEmail(event.target.value)}} required/>
              <label className='mt-3'><strong>Phone Number</strong></label>
              <input className='form-control mt-1' type='number' onChange={(event) => {setPhoneNumber(event.target.value)}} required/>
            {showBtn === "submitted" ? (<></>): (<div className="d-grid my-3 gap-2">
          <button className='btn btn-dark mt-5' onClick={submitForm}>Submit Form</button>
          </div>)}
          
          
    
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

export default CreateTeam