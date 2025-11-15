import React, { useState, useEffect } from 'react';
import axios from '../../api/axios.js';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import header1 from '../../components/images/mbot1.png';
import header2 from '../../components/images/mbot2.png';
import header3 from '../../components/images/mbot3.png';


function Mbot() {

  const {user} = useAuthContext();
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [showbtn, setShowButton] = useState("Show");
  const navigate = useNavigate();

useEffect(() => {
  axios.get('/api/user/mbot/check/subscription', {headers: {
    accessToken: user.token
  }}).then((response) => {
    const json = response.data;
    if(json.Nothing){
      setStatus("Nothing")
    }else if(json.status){
      setStatus(json.status);
      setMessage(json.message);
    }else{
      setStatus("");
    }
  })
}, [navigate, user.token])

const addSubscription = () => {
  setShowButton("")
  axios.get('/api/user/mbot/new/subscription', {headers: {
    accessToken: user.token
  }}).then((response) => {
    const json = response.data;
    if(json.success){
      const delayNav = () => {
        navigate('/mbot/auth')
      }
      setTimeout(delayNav, 2000)
    }else if(json.error){
      console.log(json.error)
    }
  })
}

  return (

  <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">M-BOT</h1>
        <p>WhatsApp Automation</p>
        </div>
        </div>
        {status === "" ? (<></>) 
        : status === "Nothing" ? (<>
        <div>
        <div className='row justify-content-center text-center mb-2'>

<div className="col-lg-6">
  <div className="card text-center my-3">
    <div className="card-header">
      <img src={header1} alt='Mgen-Header' className='image-header'/>
    </div>
  <div className="card-body">
    <h5 className="card-title">STEP 1: Connect WhatsApp</h5>
    <p className="card-text">Connect your WhatsApp to our system by QR Code Scan</p>
      <div className="d-grid gap-2 mt-2 mx-auto">
        {!showbtn ? (<></>) : (<button className='btn btn-success' onClick={addSubscription}>Start Now!</button>)}
      </div>
    </div>
  </div>
</div>

</div>

<div className='row justify-content-center text-center mt-2'>
<div className="col-lg-6">
<img width="48" height="48" src="https://img.icons8.com/fluency/48/thick-arrow-pointing-down--v1.png" alt="thick-arrow-pointing-down--v1"/>
</div>
</div>

<div className='row justify-content-center text-center mb-2'>
<div className="col-lg-6">
  <div className="card text-center my-3">
    <div className="card-header">
      <img src={header2} alt='Mgen-Header' className='image-header'/>
    </div>
  <div className="card-body">
    <h5 className="card-title">STEP 2: Build Chat Flow</h5>
    <p className="card-text">Build your automated conversation texts, images or videos</p>
      <div className="d-grid gap-2 mt-2 mx-auto">
      {!showbtn ? (<></>) : (<button className='btn btn-success' onClick={addSubscription}>Start Now!</button>)}
      </div>
    </div>
  </div>
</div>
</div>

<div className='row justify-content-center text-center mt-2'>
<div className="col-lg-6">
<img width="48" height="48" src="https://img.icons8.com/fluency/48/thick-arrow-pointing-down--v1.png" alt="thick-arrow-pointing-down--v1"/>
</div>
</div>

<div className='row justify-content-center text-center mb-4'>
<div className="col-lg-6">
  <div className="card text-center my-3">
    <div className="card-header">
      <img src={header3} alt='Mgen-Header' className='image-header'/>
    </div>
  <div className="card-body">
    <h5 className="card-title">STEP 3: Create Campaign</h5>
    <p className="card-text">Setup to whom and what you want to send in a broadcast</p>
      <div className="d-grid gap-2 mt-2 mx-auto">
      {!showbtn ? (<></>) : (<button className='btn btn-success' onClick={addSubscription}>Start Now!</button>)}
      </div>
    </div>
  </div>
</div>
</div>
          </div>
          </>) : 
          status === "Subscription" ? (<>

          <div className='row justify-content-center text-center mb-2'>
            <div className='col-lg-6 justify-content-center'>
              <div class="alert alert-info text-center" role="alert">
              {message}
              </div>
            </div>
          </div>
          
          <div className='row justify-content-center text-center mb-2'>

          <div className="col-lg-6">
            <div className="card text-center my-3">
              <div className="card-header">
                <img src={header1} alt='Mgen-Header' className='image-header'/>
              </div>
            <div className="card-body">
              <h5 className="card-title">STEP 1: Connect WhatsApp</h5>
              <p className="card-text">Connect your WhatsApp to our system by QR Code Scan</p>
                <div className="d-grid gap-2 mt-2 mx-auto">
                  <Link className='btn btn-success' to="/mbot/auth">Connect WhatsApp Now</Link>
                </div>
              </div>
            </div>
          </div>

          </div>

          <div className='row justify-content-center text-center mt-2'>
          <div className="col-lg-6">
          <img width="48" height="48" src="https://img.icons8.com/fluency/48/thick-arrow-pointing-down--v1.png" alt="thick-arrow-pointing-down--v1"/>
          </div>
          </div>

          <div className='row justify-content-center text-center mb-2'>
          <div className="col-lg-6">
            <div className="card text-center my-3">
              <div className="card-header">
                <img src={header2} alt='Mgen-Header' className='image-header'/>
              </div>
            <div className="card-body">
              <h5 className="card-title">STEP 2: Build Chat Flow</h5>
              <p className="card-text">Build your automated conversation texts, images or videos</p>
                <div className="d-grid gap-2 mt-2 mx-auto">
                  <Link className='btn btn-success' to="/mbot/flow">Build Flow Now</Link>
                </div>
              </div>
            </div>
          </div>
          </div>

          <div className='row justify-content-center text-center mt-2'>
          <div className="col-lg-6">
          <img width="48" height="48" src="https://img.icons8.com/fluency/48/thick-arrow-pointing-down--v1.png" alt="thick-arrow-pointing-down--v1"/>
          </div>
          </div>

          <div className='row justify-content-center text-center mb-4'>
          <div className="col-lg-6">
            <div className="card text-center my-3">
              <div className="card-header">
                <img src={header3} alt='Mgen-Header' className='image-header'/>
              </div>
            <div className="card-body">
              <h5 className="card-title">STEP 3: Create Campaign</h5>
              <p className="card-text">Setup to whom and what you want to send in a broadcast</p>
                <div className="d-grid gap-2 mt-2 mx-auto">
                  <Link className='btn btn-success' to="/mbot/campaign">Create Campaign Now</Link>
                </div>
              </div>
            </div>
          </div>
          </div>
          </>) 
        : status === "Expired" && (<>
        <div className='row justify-content-center text-center mb-2'>
          <div className='col-lg-6'>
            <div class="alert alert-danger" role="alert">
              {message}
            </div>
          </div>
        </div>
        </>)}
  </div>
  </div>


  )
}

export default Mbot