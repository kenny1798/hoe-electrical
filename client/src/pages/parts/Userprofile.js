import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import userImage from '../../components/profile.png';
import { Link } from 'react-router-dom';

function Userprofile() {


const [userObject, setUserObject] = useState({});
const {user} = useAuthContext();

useEffect(()=> {
    axios.get('/api/user/username', {headers: {
      accessToken:user.token
    }}).then((response) => {
      setUserObject(response.data.user)
    })
  }, [user.token])

  return (
    <div class="page-content page-container" id="page-content">
    <div class="padding">
        <div class="row container d-flex justify-content-center">

                                                <div class="card user-card-full">
                                                    <div class="row m-l-0 m-r-0">
                                                        <div class="col-sm-4 bg-c-lite-green user-profile">
                                                            <div class="card-block text-center text-white">
                                                                <div class="m-b-25">
                                                                    <img src= {userImage} class="img-radius" alt="User-Profile-Image" width="80" />
                                                                </div>
                                                                <h6 class="f-w-600">Welcome, {userObject.username}</h6>
                                                                <p>{userObject.name}</p>
                                                            </div>
                                                        </div>
                                                        <div class="col-sm-8">
                                                            <div class="card-block">
                                                                <h6 class=" p-b-5 b-b-default f-w-600">Information</h6>
                                                                <div class="row">
                                                                    <div class="col-sm-6 my-3">
                                                                    </div>
                                                                    <div class="col-sm-6 my-3">
                                                                    </div>
                                                                    <div class="col-sm-6 my-3">
                                                                    <p class="mb-1 f-w-600">Email</p>
                                                                        <h6 class="text-muted f-w-400">{userObject.email}</h6>
                                                                    </div>
                                                                    <div class="col-sm-6 my-3">
                                                                        <p class="mb-1 f-w-600">Phone</p>
                                                                        <h6 class="text-muted f-w-400">{userObject.phoneNumber}</h6>
                                                                    </div>
                                                                    <div class="col-sm-12 my-5">
                                                                    </div>
                                                                    <div class="col-sm-12 my-5">
                                                                    </div>
                                                                        <div className="d-grid gap-2 my-4">
                                                                            <Link to={'/change-password'} className="btn btn-dark mt-3" type='submit'>Change Password</Link>
                                                                        </div>
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

export default Userprofile