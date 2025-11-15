import React, { useState } from 'react'
import { useAuthContext } from '../hooks/useAuthContext'
import axios from '../api/axios';
import { useLogout } from '../hooks/useLogout';
import { useNavigate, useParams } from 'react-router-dom';


function Resetpass() {

  const [password, setPassword] = useState('');
  const [colour, setColour] = useState('');
  const [message, setMessage] = useState('');
  const { token } = useParams();
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/user/reset-password/${token}`, { password });
      setMessage(response.data.message);
      if(response.data.message){
        setColour('green')
        nav('/login')
      }
     
    } catch (error) {
      setMessage('Error resetting password');
      setColour('red')
    }
  };

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="my-4 header-title">RESET PASSWORD</h1>
        </div>
        <div class="row justify-content-center text-start mt-3">
  <div class="col-sm-6">
    <div className='card'>
      <div className='card-body'>
      <form onSubmit={handleSubmit}>
        <input
        className='form-control'
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className='d-grid'>
        <button className='btn btn-sm btn-dark mt-2' type="submit">Reset Password</button>
        </div>
        
      </form>
      {message && <p className='mt-4' style={{color: colour}}>{message}</p>}
      </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
  )
}

export default Resetpass