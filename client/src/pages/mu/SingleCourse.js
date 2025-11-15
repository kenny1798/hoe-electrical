import React, { useEffect, useRef, useState } from "react";
import { muAxios } from "../../api/axios";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Link, useParams } from "react-router-dom";
import RightReserve from "./RightsReserve";



function SingleCourse() {

    const {user} = useAuthContext();
    const [logo, setLogo] = useState("");
    const [title, setTitle] = useState("");
    const [chapter, setChapter] = useState([]);
    const [progress,setProgress] = useState(0);
    const [script,setScript] = useState("");
    const [chapTitle, setChapTitle] = useState([]);
    const {course} = useParams();

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
        muAxios.get(`/api/mu/get/chapter/${course}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            const json = response.data
            if(json){
            setChapter(response.data.chapter);
            setChapTitle(response.data.chapterTitle);
            }
        })
    }, []);

    useEffect(() => {
        muAxios.get(`/api/mu/check/script/${course}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            if(response.data.progress){
                setScript("Progress");
            }
        })
    }, [])


  return (
    <div>
        <div>
            <RightReserve />
        </div>
    <div className="container-fluid">
      <div className="row justify-content-center text-center">
        <div className="col-lg-8">
        <div>
            <img src={logo} className="img-fluid rounded-start mt-5" width="400" alt={course} />
          <h3 style={{fontWeight:"bold"}} className="my-3">{title}</h3>
          </div>
          <div className="row justify-content-center text-center">

            {script && (
                            <div className="row justify-content-center text-center">
                            <div className="col-lg-8">
                            <div className="mb-4">
                            <div class="alert alert-success" role="alert">
                            Congratulation on completing the course. You can now view your custom script: <Link to={`/courses/${course}/script`} className="btn btn-sm btn-success">View My Scripts</Link>
                            </div>
                            </div>
                            </div>
                            </div>
            )}

        <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
            <li class="breadcrumb-item"><a href="/courses">Courses</a></li>
            <li class="breadcrumb-item">{title}</li>
        </ol>
        </nav>



            {chapter.map((value,i) => {

                const toChapter = `/courses/${course}/${value.chapter}`
                const lesson = value.lessonId
                const lessonCount = lesson.split(',').length;
                const accLesson = value.lastLessonCount;
                let completedLesson
                if(progress < accLesson){
                    completedLesson =  lessonCount - (accLesson - progress)
                }else{
                    completedLesson = lessonCount;
                }
                return(
                    <div className="col-lg-4">
                    <div class="card">
                    <h5 class="card-header chapter-title">CHAPTER {value.chapter}</h5>
                    <div class="card-body">
                        <h5 style={{textTransform:'capitalize', fontWeight:'bold'}}>{chapTitle[i]}</h5>
                        <p>Chapter Progress: <b>{completedLesson > 0 ? (<>{completedLesson}</>): (<>0</>)} / {lessonCount}</b></p>
                        <div className="d-grid gap-2 mt-4">
                            <Link className="btn btn-outline-dark" to={toChapter}>View Chapter</Link>
                        </div>
                    </div>
                    </div>
                    </div>
                )
            })}

            
            </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default SingleCourse