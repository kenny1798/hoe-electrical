import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios, { msmartAxios } from '../../../api/axios';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useToast } from '../../../context/ToastContext';

function ManageTeam() {

  const {user} = useAuthContext();
  const {teamId} = useParams();
  const { notifyError } = useToast();

  const [dbData, setDbData] = useState([]);
  const [manager, setManager] = useState([]);
  const [loading, setLoading] = useState(true);



useEffect(() => {

  msmartAxios.get(`/api/msmart/manager/get/team/member/${teamId}`, {headers: {
    accessToken: user.token
  }}).then((response) => {
    if(response.data.team){
      setDbData(response.data.team)
    }else{
      notifyError("Unable to retrieve data")
    }
  })

  msmartAxios.get(`/api/msmart/get/manager/list/${teamId}`, {headers: {
    accessToken: user.token
  }}).then((response) => {
    if(response.data){
      setManager(response.data)
    }else{
      notifyError("Unable to retrieve data")
    }
  }).catch((err) => {
    console.log(err)
  }).finally(() => {
    setLoading(false)
  })

}, [user, teamId])

useEffect(() => {



}, [user, teamId])
  


  return (

    <div>
              <div className="container mt-4">
          <div className="row justify-content-center text-center">
            <div className="col-lg-12">
            <h1 className="mt-4 header-title">M-SMART</h1>
            </div>
            </div>

            <div className="row justify-content-center">
              <div className="col-md-6">
              <nav class="nav nav-pills nav-justified my-4" style={{backgroundColor: "#e9ecef", borderRadius: "10px"}}>
              <Link class="nav-link active" href="#">Team</Link>
              <Link class="nav-link" to={`/msmart/manager/database/${teamId}`}>Personal</Link>
            </nav>
              </div>

            </div>
            
    
    <div class="card text-center mt-4">
    
      <div class="card-header text-start">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <Link className="nav-link" to={`/msmart/team/summary/${teamId}`}>Summary</Link>
          </li>
          <li class="nav-item">
            <Link class="nav-link active" aria-current="true" href="#">Manage</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/activity/${teamId}`}>Activities</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/followup/${teamId}`}>Follow Up</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/leads/${teamId}`}>Leads</Link>
          </li>
        </ul>
          
      </div>
      
      <div class="card-body">

                {loading ? (
              <div class="d-flex justify-content-center">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            ): (
            <div className='table-responsive mt-3' style={{fontSize:"0.9rem"}}>
            <table class="table table-bordered">
              <thead className='bg-light'>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col" className='text-start'>Member Info</th>
                  <th scope="col" className='text-start'>Position</th>
                  <th scope="col" className='text-start'>Manager</th>
                </tr>
              </thead>

                  <tbody>
                
                  {dbData.map((val,key) => {

                    const getmanagerName = val.managerUsername;

                    let managerName = manager.find((m) => {
                      return m.username === getmanagerName
                    })


                    let pos = val.position
                    if(pos === 'Manager & Member'){
                      pos = 'Team Leader'
                    }
                    return(
                  <tr>
                  <th scope="row" style={{fontSize: '0.9rem'}}>{key +1}</th>
                  <td className='text-start' ><span style={{fontSize: '0.9rem'}}>{val.nameInTeam} ({val.username})</span></td>
                  <td className='text-start'><span style={{fontSize: '0.9rem'}}>{val.position}</span></td>
                  <td className='text-start'><span style={{fontSize: '0.9rem'}}>{managerName.username}</span></td>

                </tr>
                    )
                  })}
                  
              </tbody>

              
            </table>
            </div>)}
     
    
      </div>
    </div>
    
    
            <div className='row justify-content-center mt-3'>
              <div className='col-lg-8 text-center'>
    
                </div>
              </div>
              </div>    
            </div>
  )
}

export default ManageTeam