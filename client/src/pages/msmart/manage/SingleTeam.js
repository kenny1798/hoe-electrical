import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LineChart from '../LineChart';
import { lineData } from '../data';
import { useAuthContext } from '../../../hooks/useAuthContext';
import axios from '../../../api/axios';


function SingleTeam() {

  const {user} = useAuthContext();
  const [err, setErr] = useState("");
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


  useEffect(() => {

  }, [])


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
  <div className='col-lg-8'>
    <div className='card'>
    <div className='mx-2 my-2'>
    <LineChart chartData={chartData}  />
    </div>
    </div>
  </div>
</div>

<div className='row justify-content-center'>
<div className='col-md-4 mx-2'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(0, 162, 255, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
📲
    </div>
    <div className='stat-header text-center my-3'>
      PROSPECTING SUMMARY
    </div>
    </div>  
  <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TOTAL UPLOADED DATABASE</div>
    <div className='stat-data'></div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S FOLLOW UP COUNT</div>
    <div className='stat-data'></div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>RECENT DATABASE UPLOADED</div>
    <div className='stat-data'></div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>RECENT ENGAGED DATABASE</div>
    <div className='stat-data'></div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to="/msmart/db/manage">Manage Database ➡️</Link>
    </div>

</div>

</div>
</div>

</div>

</div>



<div className='col-md-4'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(0, 82, 255, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
🤝
    </div>
    <div className='stat-header text-center my-3' style={{color:"#0d0038"}}>
      CONNECTING SUMMARY
    </div>
    </div>  
  <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TOTAL UPLOADED DATABASE</div>
    <div className='stat-data'></div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S FOLLOW UP COUNT</div>
    <div className='stat-data'></div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>RECENT DATABASE UPLOADED</div>
    <div className='stat-data'></div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>RECENT ENGAGED DATABASE</div>
    <div className='stat-data'></div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to="/msmart/db/manage">Manage Database ➡️</Link>
    </div>

</div>

</div>
</div>

</div>

</div>

</div>


<div className='row justify-content-center'>
<div className='col-md-4 mx-2'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(255, 196, 0, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
📢
    </div>
    <div className='stat-header text-center my-3' style={{color:"#967400"}}>
    ENGAGEMENT SUMMARY
    </div>
    </div>  
  <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TOTAL UPLOADED DATABASE</div>
    <div className='stat-data'></div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S FOLLOW UP COUNT</div>
    <div className='stat-data'></div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>RECENT DATABASE UPLOADED</div>
    <div className='stat-data'></div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>RECENT ENGAGED DATABASE</div>
    <div className='stat-data'></div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to="/msmart/db/manage">Manage Database ➡️</Link>
    </div>

</div>

</div>
</div>

</div>

</div>


<div className='col-md-4'>
<div className='row mt-2'>
<div className='card' style={{backgroundColor:"rgba(2, 222, 2, 0.24)"}}>
<div className='d-flex justify-content-evenly mb-3'>
<div className='container mx-4'>
<div className='row'>
<div className='text-center mt-3' style={{fontSize:"5rem"}}>
📈
    </div>
    <div className='stat-header text-center my-3' style={{color:"#016601"}}>
      RESULT SUMMARY
    </div>
    </div>  
  <div className='row'>
  <div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TOTAL UPLOADED DATABASE</div>
    <div className='stat-data'></div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>TODAY'S FOLLOW UP COUNT</div>
    <div className='stat-data'></div>
  </div>
</div>
</div>

<div className='row mb-3'>
<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>RECENT DATABASE UPLOADED</div>
    <div className='stat-data'></div>
  </div>
</div>

<div className="col-lg my-4">
  <div className="stat-card text-center">
    <div className='card-stat-headtext mx-3'>RECENT ENGAGED DATABASE</div>
    <div className='stat-data'></div>
  </div>
</div>

</div>

<div className="d-grid mt-3 mb-5 mx-auto">
    <Link className='btn btn-lg btn-dark mb-3' to="/msmart/db/manage">Manage Database ➡️</Link>
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

export default SingleTeam