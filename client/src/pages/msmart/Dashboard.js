import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Link, useParams } from 'react-router-dom';
import LineChart from './LineChart';
import { msmartAxios } from '../../api/axios';
import { lineData } from './data';

function Dashboard() {

  const {teamName} = useParams();
  const [isBroadcast, isBroadcastset] = useState("")
  const [uploadedDB, uploadedDBset] = useState()
  const [pendingPresentation, pendingPresentationset] = useState()
  const [prospectingMerits, prospectingMeritsset] = useState()
  const [connectMerits, connectMeritsset] = useState()
  const [engagementMerits, engagementMeritsset] = useState()
  const [resultMerits, resultMeritsset] = useState()
  const [addFB, addFBset] = useState()
  const [followTT, followTTset] = useState()
  const [saveNumber, saveNumberset] = useState()
  const [pendingFB, pendingFBset] = useState()
  const [pendingTT, pendingTTset] = useState()
  const [pendingWS, pendingWSset] = useState()
  const [close, closeset] = useState()
  const [book, bookset] = useState()
  const [reject, rejectset] = useState()
  const {user} = useAuthContext();
  const [errMsg, setErrMsg] = useState("");
  const [data,setData] = useState([]);
  const toDB = `/msmart/db/manage/${teamName}`

  useEffect(() => {
    msmartAxios.get(`api/msmart/get/data/member/chart/${teamName}`, {headers: {
      accessToken: user.token
    }}).then((response) => {
      setData(response.data.merits)
    })

    msmartAxios.get(`api/msmart/get/data/member/${teamName}`, {headers : {
      accessToken: user.token
    }}).then((response) => {
      const json = response.data;
      isBroadcastset(json.isBroadcast);
      uploadedDBset(json.uploadedDB);
      pendingPresentationset(json.pendingPresentation);
      prospectingMeritsset(json.prospectingMerits);
      connectMeritsset(json.connectMerits);
      engagementMeritsset(json.engagementMerits);
      resultMeritsset(json.resultMerits);
      addFBset(json.addFB);
      followTTset(json.followTT);
      saveNumberset(json.saveNumber);
      pendingFBset(json.pendingFB);
      pendingTTset(json.pendingTT);
      pendingWSset(json.pendingWS);
      closeset(json.close);
      bookset(json.book);
      rejectset(json.reject);
    })
  }, [])

  const [chartData,setChartData] = useState({

    labels: lineData.map((value) => value.day),
    datasets: [{
      label: "Prospecting",
      data: lineData.map((value) => value.prospecting),
    },
    {
      label: "Connecting",
      data: lineData.map((value) => value.connect),
    },
    {
      label: "Engagement",
      data: lineData.map((value) => value.enggage),
    },
    {
      label: "Result",
      data: lineData.map((value) => value.result),
    },
  
    ]
  })

  console.log(data)


  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">M-SMART</h1>
        <p style={{fontSize:"1rem"}}>Welcome to your M-Smart Dashboard.</p>
        </div>
        </div>
        </div>


 <div className='row justify-content-center'>
  <div className='col-md-9'>
    <div className='card'>
      <div className='row mt-2 text-center'>
        <h5><strong>PERFORMANCE FOR THE LAST 30 DAYS</strong></h5>
        </div>
        {!chartData ? (<></>): (<div className=' row mx-2 my-2'>
    <LineChart chartData={chartData}/>
    </div>)}
    </div>
  </div>
</div>

<div className='row justify-content-center'>


<div className='col-md-9'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(0, 162, 255, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
📲
    </div>
    <div className='stat-header text-center my-3'>
      PROSPECTING SUMMARY - 000 POINTS (THIS WEEK)
    </div>
    </div>  
  <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S UPLOADED DATABASE</div>
    <div className='stat-data'>{uploadedDB}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S PROSPECTING ACTIVITY</div>
    <div className='stat-data'>{pendingPresentation}</div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK UPLOADED DATABASE</div>
    <div className='stat-data'>{prospectingMerits}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK PROSPECTING ACTIVITY</div>
    <div className='stat-data'>0</div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to={toDB}>Manage Database ➡️</Link>
    </div>

</div>
</div>
</div>
</div>
</div>


<div className='col-md-9'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(0, 82, 255, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
🤝
    </div>
    <div className='stat-header text-center my-3' style={{color:"#0d0038"}}>
      CONNECTING SUMMARY - 000 POINTS (THIS WEEK)
    </div>
    </div>  
  <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S CONNECT SOCIAL MEDIA</div>
    <div className='stat-data'>{addFB}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S SAVE MOBILE NUMBER</div>
    <div className='stat-data'>{followTT}</div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK CONNECT SOCIAL MEDIA</div>
    <div className='stat-data'>{saveNumber}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK SAVE MOBILE NUMBER</div>
    <div className='stat-data'>{connectMerits}</div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to={toDB}>Manage Database ➡️</Link>
    </div>

</div>
</div>
</div>
</div>
</div>


<div className='col-md-9'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(255, 196, 0, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
📢
    </div>
    <div className='stat-header text-center my-3' style={{color:"#967400"}}>
    ENGAGEMENT SUMMARY - 000 POINTS (THIS WEEK)
    </div>
    </div>  
  <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S SOCIAL MEDIA ENGAGE</div>
    <div className='stat-data'>{pendingFB}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S CONTENT POST</div>
    <div className='stat-data'>{pendingTT}</div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK SOCIAL MEDIA ENGAGE</div>
    <div className='stat-data'>{pendingWS}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK CONTENT POST</div>
    <div className='stat-data'>{engagementMerits}</div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to={toDB}>Manage Database ➡️</Link>
    </div>

</div>
</div>
</div>
</div>
</div>


<div className='col-md-9'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(2, 222, 2, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
📈
    </div>
    <div className='stat-header text-center my-3' style={{color:"#016601"}}>
      RESULT SUMMARY - 000 POINTS (THIS WEEK)
    </div>
    </div>  
  <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S CLOSED</div>
    <div className='stat-data'>{close}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S BOOKED</div>
    <div className='stat-data'>{book}</div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S REJECTED</div>
    <div className='stat-data'>{reject}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S FOLLOW UP</div>
    <div className='stat-data'>{resultMerits}</div>
  </div>
</div>



</div>

<div className='row mb-3'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK CLOSED</div>
    <div className='stat-data'>{close}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK BOOKED</div>
    <div className='stat-data'>{book}</div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK REJECTED</div>
    <div className='stat-data'>{reject}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK FOLLOW UP</div>
    <div className='stat-data'>{resultMerits}</div>
  </div>
</div>



</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to={toDB}>Manage Database ➡️</Link>
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

export default Dashboard