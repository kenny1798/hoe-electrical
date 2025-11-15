import React, { useEffect, useState } from 'react';
import { useAdminContext } from '../../hooks/useAdminContext';
import axios, { muAxios } from '../../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select'; 

function AdminManagerRegister({setNavbar, props}) {

    const {admin} = useAdminContext();
    const [allUser, setAllUser] = useState([]);
    const [allManager, setAllManager] = useState([]);
    const [user,setUser] = useState("");
    const [succ, setSucc] = useState("");
    const [err, setErr] = useState("");
    const nav = useNavigate();
    let options = []
    const courseOptions = [
        {value:'product', label:'Product Knowledge'},
    ]

    useEffect(() => {
        setNavbar(false);
        axios.get('/api/admin/getmanager', {headers: {
            adminToken: admin.token.adminToken
        }}).then((response) => {
            setAllManager(response.data.data);
        }).catch(err => {
            setErr('Unable to receive Managers data')
        })
    },[])

    useEffect(() => {
        setNavbar(false);
        axios.get('/api/admin/exclude/manager', {headers: {
            adminToken: admin.token.adminToken
        }}).then((response) => {
            setAllUser(response.data);
        }).catch(err => {
            setErr('Unable to receive Users data')
        })
    },[])

const handleSubmit = () => {
    const data = {username: user.value};
    axios.post('/api/admin/manager', data, {headers: {
        adminToken: admin.token.adminToken
    }}).then((response) => {
        const json = response.data;
        if(json.success){
            setErr('')
            setSucc(json.success)
            const delay = () => {
                window.location.reload()
            }
            setTimeout(delay, 2000)
        }else if(json.error){
            setSucc("")
            setErr(json.error)
            const delay = () => {
                window.location.reload()
            }
            setTimeout(delay, 2000)
        }
    }).catch((error) => {
        setErr('Something wrong, try again.')
        const delay = () => {
            window.location.reload()
        }
        setTimeout(delay, 2000)
    })
}

const deleteManager = (id) => {
    const result = window.confirm("Are you sure you want to proceed with this action?");

    if(result){
        axios.delete(`/api/admin/manager/${id}`, {headers: {
            adminToken: admin.token.adminToken
        }}).then((response) => {
            if(response.data.success){
                setSucc(response.data.success)
                const delay = () => {
                    window.location.reload()
                }
                setTimeout(delay, 2000)
            }if(response.data.error){
                setErr(response.data.error)
                const delay = () => {
                    window.location.reload()
                }
                setTimeout(delay, 2000)
            }
        }).catch(err => {
            setErr('Unable to delete Manager')
            const delay = () => {
                window.location.reload()
            }
            setTimeout(delay, 2000)
        })
    }
}




allUser.map((val,key) => {
    return options.push({value: String(val.username), label: val.username})
})



  return (
    <div className='App'>
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-12 mb-4 text-center">
        <h1 className="mt-4 header-title text-center">MANAGER REGISTER</h1>
        <Link to={'/admin'}>Admin Panel</Link> <span>/ Manager Register</span>
        </div>
        <div className='col-md-5'>
        {succ && (<div class="alert alert-success" role="alert">
            {succ}
            </div>)}
            {err && (<div class="alert alert-danger" role="alert">
            {err}
            </div>)}
        <div className='card'>
            <div className='card-body'>
            <label>Username</label>
          <Select placeholder='Insert Username' onChange={setUser} options={options}  />
          <div className="d-grid gap-2 my-2">
            <button className="btn btn-primary mt-3" onClick={handleSubmit}>Register Manager</button>
          </div>
            </div>
        </div>
        </div>

        <div className='col-md-8'>
        <div className='card'>
            <div className='card-body'>
                <div className='table-responsive'>
                <table class="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">LG Code</th>
                    <th scope="col">Name</th>
                    <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {allManager.map((val, key) => {
                        return (
                            <tr>
                            <th scope="row">{key+1}</th>
                            <td>{val.username}</td>
                            <td>{val.name}</td>
                            <td><button className='btn btn-sm btn-danger' onClick={() => deleteManager(val.id)} >X</button></td>
                            </tr>
                        )
                    })}

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

export default AdminManagerRegister