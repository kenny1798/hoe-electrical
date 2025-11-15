import React, { useState, useEffect } from 'react';
import axios, { mbotAxios } from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Link, useNavigate } from 'react-router-dom';

function MbotCampaign() {

    const {user} = useAuthContext();
    const [campaign, setCampaign] = useState([]);
    const [message, setMesssage] = useState("");
    const [errMessage, setErrMesssage] = useState("");
    const [subStatus, setSubStatus] = useState("")
    const [subMessage, setSubMessage ] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        mbotAxios.get('api/broadcast/get/campaign/', {headers:{
          accessToken: user.token
        }}).then((response) => {
          setCampaign(response.data)
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
        <p>Manage Campaign</p>
        </div>
        <div className="row justify-content-center text-center">

        {subStatus === "" ? (<></>) 
      : subStatus === "Subscription" ? (<>
      <div className='col-sm-8'>
        <div className="d-grid my-3 gap-2">
        {message ? (<div class="alert alert-info" role="alert">
  {message}
</div>) : errMessage ? (<div class="alert alert-danger" role="alert">
  {errMessage}
</div>) : (<></>) }
        <Link className='btn btn-sm btn-success' to='/mbot/create/campaign'>+ Create New Campaign</Link>
        </div>
            <div className='card'>
            <div class="table-responsive">
        <table class="table table-hover text-center">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Name</th>
      <th scope="col">Status</th>
      <th scope="col">Schedule</th>
      <th scope="col">Contacts</th>
      <th scope="col">Sent</th>
      <th scope="col">Action</th>
    </tr>
  </thead>
    {campaign.map((value, key) =>{

const ChangeStatus = (id) => {
    mbotAxios.get(`/api/broadcast/update/campaign/status/${id}`, {headers: {
      accessToken: user.token
    }}).then((response) => {
      if(response.data.message){
        setMesssage(response.data.message)
      }else if(response.data.error){
        setErrMesssage(response.data.error)
      }else{
        setErrMesssage("Unable to proceed action")
      }
      const delayReload = () => {
        window.location.reload()
      }
      setTimeout(delayReload, 2000)
    })
}
      
      return (
  <tbody>
  
    <tr>
      <th scope="row">{key+1}</th>
      <td>{value.campaignName}</td>
      <td>{value.campaignStatus}</td>
      <td>{value.is_Schedule === true ? (<>Schedule</>):(<>Not Schedule</>)}</td>
      <td>{value.totalContacts}</td>
      <td>{value.msgSent}</td>
      <td>{value.campaignStatus === 'Running' ? ( <div><button className='btn btn-sm btn-danger my-1' onClick={() => {ChangeStatus(value.id)}}>Stop</button></div>) : value.campaignStatus === 'Stopped' ? (<div><button className='btn btn-sm btn-success my-1' onClick={() => {ChangeStatus(value.id)}}>Start</button></div>) : (<></>)}</td>
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

export default MbotCampaign