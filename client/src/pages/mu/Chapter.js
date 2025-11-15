import React, { useEffect, useRef, useState } from "react";
import { muAxios } from "../../api/axios";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Link, useParams } from "react-router-dom";

function Chapter() {

    const {user} = useAuthContext();
    const [logo, setLogo] = useState("");
    const [title, setTitle] = useState("");
    const [lastLessonCount, setLastLessonCount] = useState("");
    const [vidOrder, setVidOrder] = useState([]);
    const [allLesson, setAllLesson] = useState([]);
    const [progress,setProgress] = useState(0);
    const {course} = useParams();
    const {chapter} = useParams();

    useEffect(() => {
        muAxios.get(`/api/mu/get/${course}/progress`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            const json = response.data
            if(json){
                setProgress(json.progress)
            }
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

    useEffect(() => {
        muAxios.get(`/api/mu/get/chapter/${course}/${chapter}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            const json = response.data
            if(json){
                setLastLessonCount(json.lastLessonCount)
                setVidOrder(json.vidOrder)
            }
        })
    }, []);

    useEffect(() => {
        muAxios.get(`/api/mu/get/lesson/all/${course}/${chapter}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            const json = response.data
            if(json){
                setAllLesson(json)
            }
        })
    }, []);


  return (
    <div>
    <div className="container-fluid">
      <div className="row justify-content-center text-center">
      <div>
            <img src={logo} className="img-fluid rounded-start mt-5" width="400" alt={title} />
          <h3 style={{fontWeight:"bold"}} className="my-2">{title}</h3>
          </div>
          
        <div className="col-lg-10">
            <div className="my-4">
            <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/courses">Courses</a></li>
            <li class="breadcrumb-item"><a href={`/courses/${course}`}>{title}</a></li>
            <li class="breadcrumb-item active" >Chapter {chapter}</li>
        </ol>
        </nav>
            </div>
          <div class="card text-center mt-3">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                <li class="nav-item">
                    <a class="nav-link active">Overview</a>
                </li>
                {vidOrder.map((value)=> {
                    let tabClass;

                    if(progress < value){
                        tabClass = 'nav-link disabled'
                    }else{
                        tabClass = 'nav-link'
                    }
                    return(
                        <li class="nav-item">
                            <Link className={tabClass} to={`/courses/${course}/${chapter}/${value}`}>Lesson {value}</Link>
                        </li>
                    )
                })}
                </ul>
            </div>
            <div class="card-body">
                <div className="table-responsive">          
                    <table class="table table-hover">
                    <thead>
                        <tr>
                        <th scope="col">Lesson</th>
                        <th scope="col">Topic</th>
                        <th scope="col">Status</th>
                        <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {allLesson.map((value, key) => {
                            return(
                                <tr>
                                <th scope="row">{value.lesson}</th>
                                <td>{value.lessonTitle}</td>
                                <td>{progress < value.lesson ? (<span style={{color:'grey'}}>Locked</span>) : progress == value.lesson ? (<span style={{color:'blue'}}>Progress</span>) : (<span style={{color:'green'}}>Completed</span>)}</td>
                                <td>
                                {progress < value.lesson ? (<></>) : (<Link className="btn btn-success btn-sm" to={`/courses/${course}/${chapter}/${value.lesson}`}>Lesson</Link>)}
                                </td>
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

export default Chapter