import React, { useState, useEffect } from 'react';
import axios, { mbotAxios } from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';


function MbotFlow() {

    const {user} = useAuthContext();
    const [flow, setFlow] = useState([]);
    const [subStatus, setSubStatus] = useState("");
    const [subMessage, setSubMessage ] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        mbotAxios.get('api/broadcast/get/flowname/', {headers:{
          accessToken: user.token
        }}).then((response) => {
          setFlow(response.data)
        })
      }, [user.token])

    useEffect(() => {
        axios.get('/api/user/mbot/check/subscription', {headers: {
          accessToken: user.token
        }}).then((response) => {
          const json = response.data;
          if(json.Nothing){
            navigate('/mbot')
          }
          else if(json.status){
            setSubStatus(json.status);
            setSubMessage(json.message);
          }else{
            setSubStatus("");
          }
        })
      }, [navigate, user.token])

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">M-BOT</h1>
        <p>Manage Flow</p>
        </div>
        <div className="row justify-content-center text-center">

        {subStatus === "" ? (<></>) 
      : subStatus === "Subscription" ? (<>
      <div className='col-sm-8'>
        <div className="d-grid my-3 gap-2">
        <Link className='btn btn-sm btn-success' to='/mbot/create/flow'>+ Create New Flow</Link>
        </div>
            <div className='card'>
            <div class="table-responsive">
        <table class="table table-hover text-center">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Flow Name</th>
      <th scope="col">Action</th>
    </tr>
  </thead>
    {flow.map((value, key) =>{

  const link = '/mbot/flow/' + value.id;
      return (
  <tbody>
  
    <tr>
      <th scope="row">{key+1}</th>
      <td>{value.flowName}</td>
      <td><Link className='btn btn-sm btn-primary' to={link}>Edit</Link></td>
    </tr>
  </tbody>)
    })}
    </table>
    </div>
    </div>
          </div>
          </>) 
        : subStatus === "Expired" && (<>
        <div className='row justify-content-center text-center mb-2'>
          <div className='col-lg-6'>
            <div class="alert alert-danger" role="alert">
              {subMessage}
            </div>
          </div>
        </div>
        </>)}

    </div>
        </div>
        </div>
        </div>
  )
}

export default MbotFlow