import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios, { msmartAxios } from '../../../../api/axios';
import { useAuthContext } from '../../../../hooks/useAuthContext';

function SuperManageTeam() {

    const {user} = useAuthContext();
    const {teamId} = useParams();
    const [dbData, setDbData] = useState([]);
    const [managers, setManagers] = useState([]);
    const [error, setError] = useState("");
    const [succ, setSucc] = useState("");
    const [search, setSearch] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const navigate = useNavigate();
  
  
  
  useEffect(() => {
  
    msmartAxios.get(`/api/msmart/supermanager/get/team/member/${teamId}`, {headers: {
      accessToken: user.token
    }}).then((response) => {
      if(response.data.team){
        setDbData(response.data.team)
        setManagers(response.data.manager)
      }else{
        setError("Unable to retrieve data")
      }
    })
  
  }, [])
  
    const deleteMember = (id, e) => {
      setSucc('');
      setError('');
      e.preventDefault();
  
      const confirmed = window.confirm('Are you sure you want to delete this member request?')
      
      if(confirmed){
        msmartAxios.delete(`/api/msmart/manager/member/${id}`, {headers: {
          accessToken: user.token
        }}).then((response) => {
          if(response.data.succ){
            setSucc(response.data.succ)
            const delay = () =>{
              window.location.reload()
            }
            setTimeout(delay, 2000)
          }else{
            setError("Unable to delete member request")
            const delay = () =>{
              window.location.reload()
            }
            setTimeout(delay, 2000)
          }
        }).catch((err) => {
            setError("Unable to delete member request")
            const delay = () =>{
              window.location.reload()
            }
            setTimeout(delay, 2000)
            console.log(err)
        })
      }
  
    }
  
    const approveMember = (id, e) => {
      setSucc('');
      setError('');
  
      const data = {id: id}
  
      e.preventDefault();
  
      msmartAxios.put(`/api/msmart/manager/approve/member`, data, {headers: {
        accessToken: user.token
      }}).then((response) => {
        if(response.data.succ){
          setSucc(response.data.succ)
          const delay = () =>{
            window.location.reload()
          }
          setTimeout(delay, 2000)
        }else{
          setError("Unable to approve member request")
          const delay = () =>{
            window.location.reload()
          }
          setTimeout(delay, 2000)
        }
      }).catch((err) => {
          setError("Unable to approve member request")
          const delay = () =>{
            window.location.reload()
          }
          setTimeout(delay, 2000)
          console.log(err)
      })
    }

  return (

        <div>
              <div className="container mt-4">
          <div className="row justify-content-center text-center">
            <div className="col-lg-12">
            <h1 className="mt-4 header-title">M-SMART</h1>
            </div>
            </div>
    
    <div class="card text-center mt-4">

      
    
      <div class="card-header text-start">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/admin/summary/${teamId}`}>Summary</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/admin/manager/${teamId}`}>Managers</Link>
          </li>
          <li class="nav-item">
          <Link class="nav-link active" aria-current="true" href="#">Members</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/admin/activity/${teamId}`}>Activities</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/admin/followup/${teamId}`}>Follow Up</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/admin/leads/${teamId}`}>Leads</Link>
          </li>
        </ul>
      </div>
      
      <div class="card-body">
    
            
      <div className='row justify-content-center mt-3'>
          <div className='col-lg text-center'>
            <div className='container'>
            {!error ? (<></>) : (
            <div class="alert alert-danger text-center mb-3" role="alert">
              {error}
            </div>)}

            

            {!succ ? (<></>) : (
            <div class="alert alert-success text-center mb-3" role="alert">
              {succ}
            </div>)}
            


                  <div className='table-responsive' style={{fontSize: '0.9rem'}}>
                  <table class="table table-bordered">
                    <thead className='bg-light'>
                      <tr>
                        <th scope="col">#</th>
                        <th scope="col" className='text-start'>Username</th>
                        <th scope="col" className='text-start'>Name</th>
                        <th scope="col" className='text-start'>Manager</th>
                        <th scope="col">Pos</th>   
                        <th scope="col">Status</th>
                      </tr>
                    </thead>

                        <tbody>
                      
                        {dbData.map((val,key) => {

                          const managerUsername = val.managerUsername

                          const manager = managers.find(manager => manager.username === managerUsername)

                          let pos = val.position
                          if(pos === 'Manager & Member'){
                            pos = 'Team Leader'
                          }
                          return(
                            <tr>
                        <th scope="row">{key +1}</th>
                        <td className='text-start'>{val.username}</td>
                        <td className='text-start'>{val.nameInTeam}</td>
                        <td className='text-start'>{manager.nameInTeam}</td>
                        <td>{pos}</td>
                        <td>{val.isVerified === true ? (<> <span style={{color:'green'}}>Verified</span></>): (<>
                          <div className='d-flex gap-2 justify-content-center'>
                            <button className='btn btn-sm btn-success' onClick={(e) => {approveMember(val.id, e)}}><i class="bi bi-check-lg"></i></button>
                            <button className='btn btn-sm btn-danger' onClick={(e) => {deleteMember(val.id, e)}}><i class="bi bi-trash"></i></button></div>
                        
                        </>)}</td>
                      </tr>
                          )
                        })}
                        
                    </tbody>

                    
                  </table>
                  </div>

            </div>
            </div>
          </div>

    
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

export default SuperManageTeam