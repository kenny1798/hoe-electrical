import React, { useState } from 'react'
import axios from '../api/axios';
import loading from '../components/loading.gif';


function Forgotpass() {

  const [email, setEmail] = useState('');
  const [colour, setColour] = useState('');
  const [message, setMessage] = useState('');
  const [btn, setBtn] = useState(true);


  const handleSubmit = async (e) => {
    setBtn(false);
    e.preventDefault();
    try {
      const response = await axios.post(`/api/user/forgot-password`, { email });
      setMessage(response.data.message);
      response.data.message && setColour('green')
      if(response.data.message){
        setBtn(true);
      }
    } catch (error) {
      setBtn(true);
      console.log(error)
      setMessage('Error sending email, please try again.');
      setColour('red')
    }
  };

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="my-4 header-title">FORGOT PASSWORD</h1>
        </div>
        <div class="row justify-content-center text-start mt-3">
  <div class="col-sm-6">
    <div className='card'>
      <div className='card-body'>
      <form onSubmit={handleSubmit}>
        <input
          className='form-control'
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
       
          
        {btn === true ?  <div className='d-grid'> <button className='btn btn-sm btn-dark mt-2' type="submit">Send Reset Link</button></div> : <div className=" justify-content-center mt-2"> <img src={loading} className='' alt='loading' width={20} /> <span className='mx-2'>Finding user and sending reset link</span> </div>}

        
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

export default Forgotpass