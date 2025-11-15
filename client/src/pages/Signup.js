import React from 'react';
import RegisterPage from './parts/RegisterPage';
import { Link } from 'react-router-dom';

function Signup() {
  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center">
          <h1 className="my-4 header-title text-center">REGISTER MANAGER/MEMBER</h1>
            <div className="col-md-5">
            <Link to={'/admin'}>Admin Panel</Link> <span>/ Member & Manager Registration</span>
              <RegisterPage/>
            </div>
      </div>
    </div>
    </div>
  )
}

export default Signup