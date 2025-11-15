import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import header1 from '../../components/loading.gif';
import { useAuthContext } from '../../hooks/useAuthContext';
import { msmartAxios } from '../../api/axios';

function Msmart() {

  const { user } = useAuthContext();
  const {err, setErr} = useState("");
  const [position, setPosition] = useState('');
  const [teamId, setTeamId] = useState('');


useEffect(() => {
  msmartAxios.get('/api/msmart/get/user/team', {headers: {
    accessToken: user.token
  }}).then((response) => {
    if(response.status === 400){
      setErr(response.data.error)
    }
    if(response.status === 201){
      setPosition(response.data.pos)
      setTeamId(response.data.teamId)
    }
  })
}, [user.token]);

if (position.startsWith('Member')) {
  window.location.href = `/msmart/db/manage/${teamId}`;
} else if (position.startsWith('Manager')) {
  window.location.href = `/msmart/team/summary/${teamId}`;
} else if (position.startsWith('Owner')) {
  window.location.href = `/msmart/team/admin/summary/${teamId}`;
}

  return (
    <div className=''>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
          {err ? (<>
          <h4 className="my-4">{err}</h4></>) : (<>
            <div className="d-flex justify-content-center mt-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
        <h4 className="my-4">Redirecting to your M-SMART Team Page</h4></>)}       
        </div>
        </div>       
        </div>
      </div>
  )
}

export default Msmart