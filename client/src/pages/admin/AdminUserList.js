import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { msmartAxios } from '../../api/axios';
import { useAdminContext } from '../../hooks/useAdminContext';

function AdminUserList({setNavbar, props}) {

  const {admin} = useAdminContext();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchType, setSearchType] = useState("username");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setNavbar(false);
})

useEffect(() => {
axios.get('/api/admin/getuser', {headers:{
  adminToken: admin.token.adminToken
}}).then((response) => {
  setUsers(response.data)
  console.log(response.data)
})

}, [])

useEffect(() => {
  msmartAxios.get('/api/msmart/admin/get/team/list', {headers: {
    adminToken: admin.token.adminToken
  }}).then((response) => {
    setTeams(response.data)
    console.log(response.data)
  })
  
  }, [])

  
  return (
    <div className="App">
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-12 mb-4 text-center">
        <h1 className="mt-4 header-title text-center">USERS LIST</h1>
        <Link to={'/admin'}>Admin Panel</Link> <span>/ Users List</span>
        </div>
        </div>
        <div className='row justify-content-center'>
          <div className='col-lg-12 text-center'>
          <div className='row justify-content-center my-3'>
          <div className='col-md-2'>
          <select className='form-select shadow-none' onChange={(event) => setSearchType(event.target.value)}>
            <option value="username">Username</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="phoneNumber">Phone Number</option>
            <option value="teamName">Team</option>
          </select>
          </div>
          <div className="col-md-10">
          <input type="text" className='form-control shadow-none' placeholder='Search here' onChange={(event) =>{setSearch(event.target.value)}}/>
          </div>
          </div>

          <div className='table-responsive'>
          <table class="table table-hover table-light">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Username</th>
      <th scope="col">Name</th>
      <th scope="col">Email</th>
      <th scope="col">PhoneNumber</th>
      <th scope="col">Team</th>
      <th scope="col">Position</th>
      <th scope="col">Action</th>
    </tr>
  </thead>
{users.filter((value) => {
const teamId = parseInt(value.teams?.teamId, 10);

// Find the team
const team = teams.find((team) => team.id === teamId);

// Extract the teamName
const teamName = team?.teamName || '';

// Normalize search input
const normalizedSearch = search.toLowerCase();

// Check for matching search type
if (searchType === "username" || searchType === "email" || searchType === "phoneNumber" || searchType === "name") {
  return value[searchType]?.toLowerCase().includes(normalizedSearch);
}

if (searchType === "teamName") {
  return teamName.toLowerCase().includes(normalizedSearch);
}

return false;
  
}).map((value, key) => {

const link = '/admin/users/edit/' + value.username;

const teamId = parseInt(value.teams.teamId, 10)

const team = teams.find((team) => team.id === teamId);

const teamName = team ? team.teamName : null;

const position = team ? team.position : null;

  return (
  <tbody>
    <tr>
      <th scope="row">{key+1}</th>
      <td>{value.username}</td>
      <td>{value.name}</td>
      <td>{value.email}</td>
      <td>{value.phoneNumber}</td>
      <td>{teamName}</td>
      <td>{value.teams.position}</td>
      <td><Link className='btn btn-sm btn-primary' to={link}>Edit</Link></td>
    </tr>
  </tbody>
  )})}
            </table>
          </div>
            </div>
          </div>
          </div>
          </div>
  )
}

export default AdminUserList