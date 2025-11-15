import React, { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';


function Autocopyform() {


  const {user} = useAuthContext();
  const [succ, setSucc] = useState("");
  const [err, setErr] = useState("");
  const [link, setLink] = useState("");
  const nav = useNavigate()

  const handleSubmit = (e) => {
    const delay = () => {
      nav('/')
    }
    e.preventDefault()
    const sendData = {link: link};
    setErr("");
    setSucc("");
    axios.post('/api/user/cw-access', sendData, {headers: {
        accessToken: user.token
    }}).then((response) => {
        console.log(response.data)
        if(response.data.succ){
            setSucc(response.data.succ)
            setTimeout(delay, 3000)
        }else{
            setErr("Something wrong happened. Please try again")
        }
    })
  }

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="my-4 header-title">M-ACE ACCESS FORM</h1>
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
        <label>Insert Posting Link</label>
        <textarea maxLength={1000} rows={5} type='text' className='form-control' onChange={(event) => {setLink(event.target.value)}} />
        <div className="d-grid gap-2 my-4">
            <button className="btn btn-primary mt-3" type='submit'>Submit</button>
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

export default Autocopyform