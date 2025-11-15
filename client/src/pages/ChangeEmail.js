import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import axios from '../api/axios';
import { useLocation, useNavigate } from 'react-router-dom';

function ChangeEmail() {

const {user} = useAuthContext();
const [newEmail, setNewEmail] = useState("");
const [confirmEmail, setConfirmEmail] = useState("");
const [succMsg, setSuccMsg] = useState("");
const [errMsg, setErrMsg] = useState("");
const navigate = useNavigate();



const submitChange = (e) => {
  e.preventDefault()
  setErrMsg("");
  setSuccMsg("");
  const data = {newEmail: newEmail, confirmEmail: confirmEmail}
  axios.put('/api/user/change/email', data, {headers: {
    accessToken: user.token
  }}).then((response) => {
    const json = response.data
    if(json.error){
      setErrMsg(json.error);
    }else if(json.success){
      setSuccMsg(json.success);
      const delayReload = () => {
        navigate('/')
      }
      setTimeout(delayReload, 1000)
    }else{
      setErrMsg("Can't update email address. Please try again.")
    }
  })
}

console.log(`${newEmail} : ${confirmEmail}`)

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="my-4 header-title">CHANGE EMAIL ADDRESS</h1>
        </div>
        <div class="row justify-content-center text-start mt-3">
  <div class="col-sm-6">
  {succMsg ? (<div class="alert alert-info" role="alert">
  {succMsg}
</div>) : errMsg ? (<div class="alert alert-danger" role="alert">
  {errMsg}
</div>) : (<></>) }
    <div class="card">
      <div class="card-body">
        <form onSubmit={submitChange}>
        <label>New Email Address</label>
        <input type='email' className='form-control' onChange={(event) => {setNewEmail(event.target.value)}} />
        <label className='mt-4'>Confirm Email Address</label>
        <input type='email' className='form-control' onChange={(event) => {setConfirmEmail(event.target.value)}} />
        <div className="text-center my-3">
            <button className="btn btn-sm btn-primary mt-3  mx-2" type='submit'>Update Email Address</button>
            <button className="btn btn-sm btn-outline-danger mt-3 mx-2" type='reset'>Reset Changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>
        </div>
        </div>
      </div>
  )
}

export default ChangeEmail