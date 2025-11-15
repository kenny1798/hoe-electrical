import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useParams } from 'react-router-dom';
import { muAxios } from '../../api/axios';

function CompiledScript() {

    const {user} = useAuthContext();
    const {course} = useParams();
    const [logo, setLogo] = useState("");
    const [title, setTitle] = useState("");
    const [script, setScript] = useState([]);
    
    useEffect(() => {
        muAxios.get(`api/mu/get/${course}/script`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            setScript(response.data.script)
        })
    }, []);

    useEffect(() => {
        muAxios.get(`/api/mu/get/course/${course}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            const json = response.data
            if(json){
            setLogo(process.env.REACT_APP_MU + json.logo);
            setTitle(json.title);
            }
        })
    }, []);

  return (
    <div className='App'>
         <div className="container-fluid" style={{backgroundColor:'whitesmoke'}}>
      <div className="row justify-content-center text-center">
        <div className="col-lg-8">
        <div>
            <img src={logo} className="img-fluid rounded-start mt-5" width="510" alt={course} />
          <h3 className='mb-4' style={{fontWeight:"bold"}}>{title} ({course})</h3>
          <div className="row justify-content-center text-start">
            <div className='col-lg-8'>
            <nav aria-label="breadcrumb text-center">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/courses">Courses</a></li>
            <li class="breadcrumb-item"><a href={`/courses/${course}`}>{title}</a></li>
            <li class="breadcrumb-item active" >Script</li>
        </ol>
        </nav>
            <div className='card'>
            <div className='card-body'>
            {script.map((val,i) => {
                return (
                    <div className='my-5'><h5 style={{fontWeight:'bold'}}>{val.lesson}</h5><p className='question' style={{whiteSpace:'pre-wrap'}}>{val.script}</p></div>
                )
            })}
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

export default CompiledScript