import React, { useEffect, useState } from 'react';
import axios, { msmartAxios } from '../../api/axios';
import { REGISTER_URL } from '../../api/url';
import { useAuthContext } from '../../hooks/useAuthContext';
import { Link } from 'react-router-dom';
import { useAdminContext } from '../../hooks/useAdminContext';

function RegisterPage() {

    const {admin} = useAdminContext();
    const {dispatch} = useAuthContext();
    const [errMsg, setErrMsg] = useState("");
    const [succMsg, setSuccMsg] = useState("");
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [team, setTeam] = useState("");
    const [position, setPosition] = useState("");
    const [manager, setManager] = useState("");
    const [getTeam, setGetTeam] = useState([]);
    const [getManager, setGetManager] = useState([]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [showBtn, setShowBtn] = useState("");

    useEffect(() => {
      msmartAxios.get(`/api/msmart/admin/get/team/list`, {headers: {
        adminToken: admin.token.adminToken
      }}).then((response) => {
        setGetTeam(response.data)
      })
    }, [])

    const onTeamChange = (id) => {
      setTeam(id);
      msmartAxios.get(`/api/msmart/admin/get/team/manager/${id}`, {headers: {
        adminToken: admin.token.adminToken
      }}).then((response) => {
        setGetManager(response.data)
      })
    }


    const onSubmit = (e) => {
        e.preventDefault();
        setErrMsg("");
        setSuccMsg("");
        setShowBtn("submitted")
        const data = {username: username, name: name, team: team, position: position, manager: manager, password: password, confirmPassword: confirmPassword, email: email, phoneNumber: phoneNumber}
        msmartAxios.post('/api/msmart/create/user', data, {headers:{
            adminToken: admin.token.adminToken
        }}).then ( async (response) =>{
            if (response.status === 400 || response.data.error){
                setErrMsg(response.data.error)
                setShowBtn("")
              }
            if (response.status === 200){ 
                setSuccMsg(response.data.success)
                setShowBtn("")
              }
        })
    }

    const handleUsername = (e) => {
      const newUsername = e.target.value.replace(/[^a-zA-Z0-9_]/g, ''); // Hanya huruf, nombor, dan _
        setUsername(newUsername);// Remove non-numeric characters
    };

  return (
            <div className='mt-3'>



                <form onSubmit={onSubmit}>

                  <div className="row">

                    <div className="col">
                      <div className='mb-2'>
                        <label>Name</label>
                        <input type='text' name='name' className="form-control shadow-none" onChange={(event) => {setName(event.target.value)}} required />
                      </div>
                    </div>

                  </div>

                  <div className="row">

                    <div className="col">
                      <div className='mb-3'>
                        <label >Username</label>
                        <input type='text' name='username' className="form-control shadow-none" value={username} onChange={handleUsername} required />
                      </div>
                    </div>

                  </div>


                  <div className="row">

                    <div className="col">
                      <div className='mb-3'>
                        <label >Team</label>
                        <select className="form-control shadow-none" name="manager" onChange={(event) => {onTeamChange(event.target.value)}} required >
                          <option value="">Select Team..</option>           
                          {getTeam.map(val => {
                            return(<option value={val.id}>{val.teamName}</option>)
                          })}
                        </select>
                      </div>
                    </div>

                    {!team ? (<></>) : (<>
                    
                      <div className="col">
                      <div className='mb-3'>
                        <label >Position</label>
                        <select className="form-control shadow-none" name="manager" onChange={(event) => {setPosition(event.target.value)}} required >
                        <option value="">Select Position..</option>
                        <option value="Manager">Manager</option>
                        <option value="Member">Member</option>       
                        </select>
                      </div>
                    </div>
                    
                    </>)}



                  </div>

                  {position === "Member" && (   

                  <div className='mb-3'>
                    <label >Manager</label>
                    <select className="form-control shadow-none" name="manager" onChange={(event) => {setManager(event.target.value)}} required >
                      <option value="">Select Manager..</option>           
                      {getManager.map(val => {
                        return(<option value={val.username}>{val.nameInTeam}</option>)
                      })}
                    </select>
                    </div>

                    )}



                    <div className='mb-3'>
                    <label >Password</label>
                    <input type='password' name='password' className="form-control shadow-none" onChange={(event) => {setPassword(event.target.value)}} required />
                    </div>

                    <div className='mb-3'>
                    <label >Confirm Password</label>
                    <input type='password' name='confirmPassword' className="form-control shadow-none" onChange={(event) => {setConfirmPassword(event.target.value)}} required />
                    </div>

                    <div className='mb-3'>
                    <label >Email Address</label>
                    <input type='email' name='email' className="form-control shadow-none" onChange={(event) => {setEmail(event.target.value)}} required />
                    </div>

                    <div className='mb-3'>
                    <label >Phone Number</label>
                    <input type='number' name='mobile' className="form-control shadow-none" onChange={(event) => {setPhoneNumber(event.target.value)}} required />
                    </div>

                    {errMsg && (<div class="alert alert-danger" role="alert">
                {errMsg}
                </div>)}

                {succMsg && (<div class="alert alert-success" role="alert">
                {succMsg}
                </div>)}

                    {showBtn === "submitted" ? <></> : <>                  
                    <div class="d-grid gap-2 my-5">
                    <button className="btn btn-dark" type="submit">Register Now</button>
                    </div>
                    </>}




                    
                    
                </form>
            </div>
  )
}

export default RegisterPage