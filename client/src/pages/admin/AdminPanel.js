import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAdminContext } from '../../hooks/useAdminContext';

function AdminPanel({setNavbar, setAdminNav, props}) {

  const {admin} = useAdminContext();
  const [active, setActive] = useState(false);
  const [activeMsg, setActiveMsg] = useState("");
  const [allreq, setallreq] = useState([])
  const navigate = useNavigate();
  
  useEffect(() => {
    setNavbar(false);
    setAdminNav(true);
})

useEffect(() => {
  axios.get('/api/admin/get/unvalidate/users', {headers: {
    adminToken: admin.token.adminToken
  }}).then((response) => {
    if(response.data.users){
      setallreq(response.data.users)
    }
  }).catch((err) => console.log(err))
}, []);


  return (
    <div className='App'>
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-12 mb-4">
        <h1 className="mt-4 header-title text-center">ADMIN PANEL</h1>
        </div>
        </div>
        <div className='row justify-content-center'>
          <div className='col-md-6 text-center'>
          <div class="card">
            <div class="card-body">
              <strong>Users List</strong>
              <div className="d-grid my-3 gap-2">
                  <Link className='btn btn-dark mt' to='/admin/users'>Go To List</Link>
                </div>
            </div>
          </div>
          </div>
          </div>
          <div className="row justify-content-center">
          <div className='col-md-6 text-center'>
          <div class="card">
            <div class="card-body">
            <strong>Registration</strong>
              <div className="d-grid my-3 gap-2">
                  <Link className='btn btn-outline-dark mb-2' to='/admin/create/team'>Register Team & Owner</Link>
                  <Link className='btn btn-outline-dark mt-2' to='/admin/create/member'>Register Manager & Member</Link>
                </div>
            </div>
          </div>
          </div>
          </div>
          <div className="row justify-content-center">
          <div className='col-md-6 text-center'>
          <div class="card">
            <div class="card-body">
            <strong>RTM Monitoring</strong>
            <div className="d-grid my-3 gap-2">
            <Link className='btn btn-outline-dark' to='/admin/monitor/ranking'>Overall Ranking</Link>
            <Link className='btn btn-dark my-2' to='/admin/monitor/team'>Team Monitor</Link>
            <Link className='btn btn-dark mb-2' to='/admin/monitor/manager'>Manager Monitor</Link>
            </div>
            </div>
          </div>
          </div>
          </div>
        </div>
        </div>
  )
}

export default AdminPanel