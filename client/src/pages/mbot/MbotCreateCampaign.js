import React, { useState, useEffect } from 'react';
import axios, { mbotAxios } from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import { useNavigate } from 'react-router-dom';

function MbotCreateCampaign() {

  const dateNow = new Date();
  const {user} = useAuthContext();
  const [campaignName, setCampaignName] = useState("");
  const [excelFile, setExcelFile] = useState("")
  const [msgInterval, setMsgInterval] = useState(180);
  const [isSchedule, setIsSchedule] = useState(0);
  const [flow, setFlow] = useState([])
  const [inputContent, setInputContent] = useState("");
  const [scheduleDate, setScheduleDate] = useState(dateNow.toISOString());
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [subStatus, setSubStatus] = useState("");
  const [subMessage, setSubMessage ] = useState("");
  const [priority, setPriority] = useState(0);
  const navigate = useNavigate()

  useEffect(() => {
    mbotAxios.get('/api/broadcast/get/flowname/', {headers: {
      accessToken: user.token
    }}).then((response) => {
      setFlow(response.data)
      setInputContent(response.data[0].flowName)
    })
  }, [user.token])


  const toggleSchedule = () => {
    if(isSchedule === 0){
      setIsSchedule(1)
    }else{
      setIsSchedule(0)
      setScheduleDate(dateNow.toISOString());
      setPriority(0);
    }
  }

  const togglePriority = () => {
    if(priority === 0){
      setPriority(1)
    }else{
      setPriority(0);
    }
  }

  const delayNav = () => {
    navigate('/mbot/campaign', {replace:true})
  }
  
  const submitCampaign = (e) => {
    e.preventDefault();
    const formData = new FormData()
    formData.append('campaignName', campaignName);
    formData.append('excelFile', excelFile);
    formData.append('msgInterval', msgInterval);
    formData.append('isSchedule', isSchedule);
    formData.append('inputContent', inputContent);
    formData.append('scheduleDate', scheduleDate);
    formData.append('priority', priority);
    mbotAxios.post('/api/broadcast/create/campaign', formData, {headers:{
      accessToken:user.token
    }}).then((response) => {
      if(response.data.success){
        setTimeout(delayNav, 6000)
        setSuccess(response.data.success)
      }else if(response.data.error){
        setError(response.data.error)
      }
    })
  }

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
        </div>
        </div>
    <div className='row justify-content-center'>

    {subStatus === "" ? (<></>) 
      : subStatus === "Subscription" ? (<>
      <div className="col-sm-8">
      {!error ? (<></>): (<div class="alert alert-danger" role="alert">
  {error}
</div>)}
    <div className='card'>
      <div className="card-header text-center">
    <form encType='multipart/form-data'>
  <div className='container'>
  <div className='row justify-content-center text-start'>
  <div className='col-sm-6'>
  <label className='mt-5'><strong>Campaign Name</strong></label><br/>
          <input type="text" className='form-control shadow-none' required onChange={(event) => {setCampaignName(event.target.value)}}/>
          <label className='mt-5'><strong>Excel File</strong></label>
          <input type="file" className='form-control shadow-none' required onChange={(event) => {setExcelFile(event.target.files[0])}} />
          <label className='mt-5'><strong>Message Interval</strong></label>
          <input className='form-control shadow-none' type="range" min="180" max="300" required onChange={(event) => {setMsgInterval(event.target.value)}}/>{msgInterval} Second<br/>
          <label className='mt-5'><strong>Flow</strong></label>
          <select className='form-control shadow-none' onChange={(event) => {setInputContent(event.target.value)}} >
          {flow.map((value, key) => {
            return(<option value={value.flowName}>{value.flowName}</option>)
            })}
          </select>
  <div  class="form-check form-check-inline mt-4">
  <label class="form-check-label">
    Schedule Campaign
  </label>
  <input  class="form-check-input" type="checkbox" onClick={toggleSchedule}/>
</div>
<br></br>
          {isSchedule === 0 ? (<></>): (<>
            <label className='mt-4'><strong>Schedule Date</strong></label>
            <input className='form-control shadow-none' type="datetime-local" onChange={(event) => {setScheduleDate(event.target.value)}} />
            <div  class="form-check form-check-inline mt-4">
              <label class="form-check-label">
                Set campaign as priority
              </label>
              <input  class="form-check-input" type="checkbox" onClick={togglePriority}/>
            </div>
          </>)}
          
          <div className="d-grid mb-4 mt-4 gap-2">
            {(excelFile && campaignName) == '' ? (<button className='btn btn-secondary mt-2'>Submit Block</button>) : (<button className='btn btn-primary mt-2' type='submit' onClick={submitCampaign}>Submit Block</button>)}
          </div>

          
          
          
  </div>
  {!success ? (<></>): (<div class="alert alert-success" role="alert">
  Campaign created successfully
</div>)}
  
  </div>
  </div>
</form>
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
  )
}

export default MbotCreateCampaign
