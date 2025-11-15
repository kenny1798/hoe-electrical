import React, { useEffect, useState } from 'react';
import { useAdminContext } from '../../hooks/useAdminContext';
import axios, { muAxios } from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select'; 

function AdminMuRegister({setNavbar, props}) {

    const {admin} = useAdminContext();
    const [allUser, setAllUser] = useState([])
    const [user,setUser] = useState("");
    const [course,setCourse] = useState("");
    const [succ, setSucc] = useState("");
    const [err, setErr] = useState("");
    const nav = useNavigate();
    let options = []
    const courseOptions = [
        {value:'product', label:'Product Knowledge'},
    ]

    useEffect(() => {
        setNavbar(false);
        axios.get('/api/admin/getuser', {headers: {
            adminToken: admin.token.adminToken
        }}).then((response) => {
            setAllUser(response.data);
        })
    },[])

const handleSubmit = () => {
    const data = {username: user.value, course: course.value};
    muAxios.post('/api/admin/mu/register', data, {headers: {
        adminToken: admin.token.adminToken
    }}).then((response) => {
        const json = response.data;
        if(json.succ){
            setErr('')
            setSucc(json.succ)
            const delay = () => {
                nav('/admin')
            }
            setTimeout(delay, 2000)
        }else if(json.err){
            setSucc("")
            setErr(json.err)
        }
    }).catch((error) => {
        setErr('Something wrong, try again.')
    })
}

console.log(user.value, course.value)



allUser.map((val,key) => {
    return options.push({value: String(val.username), label: val.username})
})



  return (
    <div className='App'>
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-12 mb-4 text-center">
        <h1 className="mt-4 header-title text-center">TRAINING REGISTER</h1>
        <Link to={'/admin'}>Admin Panel</Link> <span>/ Training Register</span>
        </div>
        <div className='col-md-5'>
            {succ && (<div class="alert alert-success" role="alert">
            {succ}
            </div>)}
            {err && (<div class="alert alert-danger" role="alert">
            {err}
            </div>)}
          <label>Username</label>
          <Select placeholder='Insert Username' onChange={setUser} options={options}  />
          <label className='mt-3'>Course Short Name</label>
          <Select placeholder='Insert Course' onChange={setCourse} options={courseOptions}  />
          <div className="d-grid gap-2 my-2">
            <button className="btn btn-primary mt-3" onClick={handleSubmit}>Submit</button>
          </div>
        </div>
        </div>
        </div>
        </div>
  )
}

export default AdminMuRegister