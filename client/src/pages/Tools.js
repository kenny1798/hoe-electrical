import React from 'react';
import '../App.css';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import header1 from '../components/images/tools1.jpg';
import header2 from '../components/images/tools2.jpg';
import header3 from '../components/images/tools3.jpg';
import header4 from '../components/images/tools4.jpg';

function Tools() {

  
  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">AUTOMATION TOOLS</h1>

        </div>
<div className='row'>
<div className="col-lg">
<div className="card text-center my-3">
  <div className="card-header">
  <img src={header2} alt='Mgen-Header' className='image-header'/>
  </div>
  <div className="card-body">
    <h5 className="card-title">M-SMART: Sales Activity Management</h5>
    <p className="card-text"></p>
    <div className="d-grid gap-2 mt-4 mx-auto">
    <Link className='btn btn-dark' to="/msmart">View M-SMART</Link>
    </div>
  </div>
</div>
</div>
<div className="col-lg">
<div className="card text-center my-3">
  <div className="card-header">
  <img src={header3} alt='Mgen-Header' className='image-header'/>
  </div>
  <div className="card-body">
    <h5 className="card-title">M-CHAT: Chat Automation</h5>
    <p className="card-text"></p>
    <div className="d-grid gap-2 mt-4 mx-auto">
    <Link className='btn btn-primary btn-dark disabled'>Coming Soon</Link>
    </div>
  </div>
</div>
</div>
</div>
    </div>
    </div>
    </div>
    
  );
}

export default Tools