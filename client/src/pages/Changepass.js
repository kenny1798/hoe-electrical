import React, { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import axios from '../api/axios';
import { useLogout } from '../hooks/useLogout';
import { useNavigate } from 'react-router-dom';

function Changepass() {

  const {user} = useAuthContext();
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [succ, setSucc] = useState("");
  const [err, setErr] = useState("");
  const {logout} = useLogout();
  const nav = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    setSucc("")
    setErr("")
    const data = {currPass: currPass, newPass: newPass, ConfirmNewPass: confirmNewPass}
    axios.post('/api/user/change/password', data, {headers: {
      accessToken: user.token
    }}).then((response) => {
      if(response.data.error){
        setErr(response.data.error)
      }else if(response.data.success){
        setSucc(response.data.success)
        const userLogout = () => {
          logout()
        }
        setTimeout(userLogout, 2000)
      }
    }).catch((error) => {
      setErr("Couldn't connect to server. Please try again")
    })
  }


  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="my-4 header-title">CHANGE PASSWORD</h1>
        </div>
        <div class="row justify-content-center text-start mt-3">
  <div class="col-sm-6">
  {succ && (<div class="alert alert-success mb-4" role="alert">
                    {succ}
                    </div>)}
                    {err && (<div class="alert alert-danger mb-4" role="alert">
                    {err}
                    </div>)}
    <div className='card'>
      <div className='card-body'>
      <form onSubmit={handleSubmit}>
        <label>Current Password</label>
        <input type='password' className='form-control' onChange={(event) => {setCurrPass(event.target.value)}}  />
        <label className='mt-4'>New Password</label>
        <input type='password' className='form-control' onChange={(event) => {setNewPass(event.target.value)}}/>
        <label className='mt-4'>Confirm New Password</label>
        <input type='password' className='form-control' onChange={(event) => {setConfirmNewPass(event.target.value)}}/>
        <div className="text-center my-3">
            <button className="btn btn-sm btn-dark mt-3  mx-2" type='submit'>Update Password</button>
            <button className="btn btn-sm btn-outline-secondary mt-3 mx-2" type='reset'>Clear Form</button>
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

export default Changepass