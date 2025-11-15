import React from 'react';
import header2 from '../../components/images/tools1.jpg'
import { Link, Navigate, useNavigate } from 'react-router-dom';

function Mchat() {
  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">MCHAT</h1>
        <div className='row'>
<div className="col-lg">
<div className="card text-center my-3">
  <div className="card-header">
  <img src={header2} alt='Mgen-Header' className='image-header'/>
  </div>
  <div className="card-body">
    <h5 className="card-title">Create Your Chat</h5>
    <p className="card-text">Create chat here</p>
    <div className="d-grid gap-2 mt-4 mx-auto">
    <Link className='btn btn-primary' to="/mchat/chat">Generate Now</Link>
    </div>
  </div>
</div>
</div>

<div className="col-lg">
<div className="card text-center my-3">
  <div className="card-header">
  <img src={header2} alt='Mgen-Header' className='image-header'/>
  </div>
  <div className="card-body">
    <h5 className="card-title">Design Your Chat</h5>
    <p className="card-text">Design every chat you created here</p>
    <div className="d-grid gap-2 mt-4 mx-auto">
    <Link className='btn btn-primary' to="/mchat/design">Generate Now</Link>
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

export default Mchat