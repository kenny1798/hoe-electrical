import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LineChart from '../LineChart';
import { lineData } from '../data';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { msmartAxios } from '../../../api/axios';



function ManagerDashboard() {

  const {user} = useAuthContext();
  const {teamName} = useParams();
  const [uploadDB, setUploadDB] = useState("");
  const [presentation, setPresentation] = useState("");
  const [followup, setFollowup] = useState("");

  const manageTeam = `/msmart/team/manage/${teamName}`

  useEffect(() => {
    msmartAxios.get(`/api/msmart/get/team/data/${teamName}`, {headers: {
      accessToken: user.token
    }}).then((response) => {
      const json = response.data;
      setUploadDB(json.uploadDB);
      setPresentation(json.presentation);
      setFollowup(json.followup);
    })
  }, [])

  console.log(uploadDB)

  const [chartData,setChartData] = useState({
    labels: lineData.map((data) => data.day),
    datasets: [{
      label: "Prospecting",
      data: lineData.map((data) => data.prospecting),
    },
    {
      label: "Connecting",
      data: lineData.map((data) => data.connect),
    },
    {
      label: "Engagement",
      data: lineData.map((data) => data.enggage),
    },
    {
      label: "Result",
      data: lineData.map((data) => data.result),
    },
  
    ]
  })

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
  <div className='col-lg-10'>
    <div className='card'>
    <div className='row'>
    <div className='mx-2 my-2'>
    <LineChart chartData={chartData}  />
    </div>
    </div>
    </div>
  </div>
</div>

<div className='row justify-content-center'>
<div className='col-md-5 mx-2'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(0, 162, 255, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
📲
    </div>
    <div className='stat-header text-center my-3'>
      GROUP PROSPECTING SUMMARY
    </div>
    </div>  
  <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S UPLOADED DATABASE</div>
    <div className='stat-data'>{uploadDB}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S PRESENTATION</div>
    <div className='stat-data'>{presentation}</div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S FOLLOWUP</div>
    <div className='stat-data'>{followup}</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK ACTIVITIES</div>
    <div className='stat-data'>0</div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to={manageTeam}>Manage Group ➡️</Link>
    </div>

</div>

</div>
</div>

</div>

</div>



<div className='col-md-5'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(0, 82, 255, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
🤝
    </div>
    <div className='stat-header text-center my-3' style={{color:"#0d0038"}}>
      GROUP CONNECTING SUMMARY
    </div>
    </div>  
    <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>ADD FRIEND @ FB - THIS WEEK</div>
    <div className='stat-data'>0</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>FOLLOW @ TIKTOK - THIS WEEK</div>
    <div className='stat-data'>0</div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>SAVE PHONE NUMBER - THIS WEEK</div>
    <div className='stat-data'>0</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S ACTIVITIES</div>
    <div className='stat-data'>0</div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to={manageTeam}>Manage Group ➡️</Link>
    </div>

</div>

</div>
</div>

</div>

</div>

</div>


<div className='row justify-content-center'>
<div className='col-md-5 mx-2'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(255, 196, 0, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
📢
    </div>
    <div className='stat-header text-center my-3' style={{color:"#967400"}}>
    GROUP ENGAGEMENT SUMMARY
    </div>
    </div>  
    <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>PENDING ENGAGE @ FACEBOOK</div>
    <div className='stat-data'>0</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>PENDING ENGAGE @ TIKTOK</div>
    <div className='stat-data'>0</div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>PENDING ENGAGE @ WS STATUS</div>
    <div className='stat-data'>0</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK ACTIVITIES</div>
    <div className='stat-data'>0</div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to={manageTeam}>Manage Group ➡️</Link>
    </div>

</div>

</div>
</div>

</div>

</div>


<div className='col-md-5'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(2, 222, 2, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
📈
    </div>
    <div className='stat-header text-center my-3' style={{color:"#016601"}}>
      GROUP RESULT SUMMARY
    </div>
    </div>  
    <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>CLOSED - THIS WEEK</div>
    <div className='stat-data'>0</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>BOOKED STATUS</div>
    <div className='stat-data'>0</div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>REJECTED - THIS WEEK</div>
    <div className='stat-data'>0</div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>THIS WEEK ACTIVITIES</div>
    <div className='stat-data'>0</div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to={manageTeam}>Manage Group ➡️</Link>
    </div>

</div>
</div>

</div>

</div>
</div>
</div>



<div className='row justify-content-center'>
<div className='col-md-5 mx-2'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(0, 162, 255, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='stat-header text-center my-3'>
      GROUP PROSPECTING RANKING
    </div>
    <table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Name</th>
      <th scope="col">Merits</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Cody Liya</td>
      <td>403</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>ST Syafiq</td>
      <td>337</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td >Cody Lina</td>
      <td>328</td>
    </tr>
  </tbody>
</table>
</div>  

</div>
</div>
</div>
</div>




<div className='col-md-5'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(0, 82, 255, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>

    <div className='stat-header text-center my-3' style={{color:"#0d0038"}}>
      GROUP CONNECTING RANKING
    </div>

    <table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Name</th>
      <th scope="col">Merits</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Cody Liya</td>
      <td>403</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>ST Syafiq</td>
      <td>337</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td >Cody Lina</td>
      <td>328</td>
    </tr>
  </tbody>
</table>

</div>
</div>
</div>
</div>
</div>
</div>

<div className='row justify-content-center'>
<div className='col-md-5 mx-2'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(255, 196, 0, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>

    <div className='stat-header text-center my-3' style={{color:"#967400"}}>
    GROUP ENGAGEMENT SUMMARY
    </div>

    <table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Name</th>
      <th scope="col">Merits</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Cody Liya</td>
      <td>403</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>ST Syafiq</td>
      <td>337</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td >Cody Lina</td>
      <td>328</td>
    </tr>
  </tbody>
</table>

</div>
</div>
</div>
</div>
</div>


<div className='col-md-5'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(2, 222, 2, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>

    <div className='stat-header text-center my-3' style={{color:"#016601"}}>
      GROUP RESULT RANKING
    </div>

    <table class="table">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Name</th>
      <th scope="col">Merits</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">1</th>
      <td>Cody Liya</td>
      <td>403</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>ST Syafiq</td>
      <td>337</td>
    </tr>
    <tr>
      <th scope="row">3</th>
      <td >Cody Lina</td>
      <td>328</td>
    </tr>
  </tbody>
</table>


</div>
</div>

</div>

</div>
</div>
</div>


</div>
  )
}

export default ManagerDashboard