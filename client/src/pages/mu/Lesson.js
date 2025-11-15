import React, { useEffect, useRef, useState } from "react";
import { muAxios } from "../../api/axios";
import { useAuthContext } from "../../hooks/useAuthContext";
import { Link, useNavigate, useParams } from "react-router-dom";
import ReactPlayer from "react-player";

function Lesson() {

    const {user} = useAuthContext();

    const [logo, setLogo] = useState("");
    const [title, setTitle] = useState("");
    const [lessonTitle, setLessonTitle] = useState("");
    const [vidFile, setVidFile] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [succMsg, setSuccMsg] = useState("");
    const [vidOrder, setVidOrder] = useState([]);
    const [progress,setProgress] = useState(0);
    const [questionAnswer, setQuestionAnswer] = useState([]);
    const [userAnswers, setUserAnswers] = useState([]);
    const [finish, setFinish] = useState(false);
    const [script, setScript] = useState("");
    const [userScript, setUserScript] = useState("");
    const [instruction, setInstruction] = useState("");

    const {course} = useParams();
    const {chapter} = useParams();
    const {lesson} = useParams();
    const parsedChapter = parseInt(chapter, 10)
    const parsedLesson = parseInt(lesson, 10)
    const videoRef = useRef();
    const nav = useNavigate();
    let playerHeight;





    if (vidFile.startsWith("https://")) {
        playerHeight = "60vh";
    } else {
        playerHeight = "auto";
    }

    let questionList = [];
    let buttonContent;

    const vidUrl = `${process.env.REACT_APP_MU}/${vidFile}`;


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
                setVidOrder(json.vidOrder)
            }
        })
    }, []);

    useEffect(() => {
        muAxios.get(`/api/mu/get/data/${course}/${chapter}/${lesson}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            const json = response.data
            if(json){
                setLessonTitle(json.lessonTitle)
                setVidFile(json.vidFile)
            }
        })
    }, []);

    useEffect(() => {
        muAxios.get(`/api/mu/get/data/${course}/${chapter}/${lesson}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            const json = response.data
            if(json){
                setLessonTitle(json.lessonTitle)
                setVidFile(json.vidFile)
            }
        })
    }, []);

    useEffect(() => {
        muAxios.get(`/api/mu/get/question/${course}/${lesson}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            setQuestionAnswer(response.data);
        })
    }, []);

    useEffect(() => {
        muAxios.get(`/api/mu/get/script/${course}/${lesson}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            setInstruction(response.data.instruction)
            setScript(response.data.script)
            setUserScript(response.data.userScript)
        })
    },[])

    

const handleChange = (onChangeValue,i) => {
    const inputData = [...userAnswers]
    inputData[i] = onChangeValue.target.value;
    setUserAnswers(inputData)
}

const importScript = (e) => {
    e.preventDefault();
    muAxios.get(`/api/mu/get/script/${course}/${lesson}`, {headers: {
        accessToken: user.token
    }}).then((response) => {
        setUserScript(response.data.script)
    })
}

const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const data = {questions: questionList, answers: userAnswers, script: userScript};
    await muAxios.post(`/api/mu/submitLesson/${course}/${chapter}/${lesson}`, data, {headers: {
        accessToken:user.token
    }}).then((response) => {
        const json = response.data;
        console.log(json)
        if(json.success){
            setErrMsg("")
            setSuccMsg(json.success)
            const delayNav = () => {
                if(json.isLastVideo === 'Yes' && json.isLastSession === 'No'){
                    nav(`/courses/${course}/${parsedChapter+1}`)
                    const reload = () => {
                        window.location.reload()
                    }
                    setTimeout(reload, 300)
                }else if(json.isLastVideo === 'Yes' && json.isLastSession === 'Yes'){
                    nav(`/courses/${course}`)
                    const reload = () => {
                        window.location.reload()
                    }
                    setTimeout(reload, 300)
                }else if(json.isLastVideo === 'No'){
                    nav(`/courses/${course}/${chapter}/${parsedLesson+1}`)
                    const reload = () => {
                        window.location.reload()
                    }
                    setTimeout(reload, 300)
                }
                
            }
            setTimeout(delayNav, 3000)
        }else if(json.qError){
            setErrMsg(json.qError)
        }
    })
}

if(questionAnswer.length === 0 && instruction === ""){
    buttonContent = 'Proceed'
}else{
    buttonContent = 'Submit & Proceed'
}


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
    <li class="breadcrumb-item"><a href={`/courses/${course}/${chapter}`}>Chapter {chapter}</a></li>
    <li class="breadcrumb-item active" >Lesson {lesson}</li>
  </ol>
</nav>
            </div>
          <div class="card text-center mt-3">
            <div class="card-header">
                <ul class="nav nav-tabs card-header-tabs">
                <li class="nav-item">
                    <Link className="nav-link" to={`/courses/${course}/${chapter}`}>Overview</Link>
                </li>
                {vidOrder.map((value,i)=> {
                    let tabClass;
                    if(progress < value){
                        tabClass = 'nav-link disabled'
                    }else if(value == lesson){
                        tabClass = 'nav-link active'
                    }else{
                        tabClass = 'nav-link'
                    }
                    return(
                        <li class="nav-item">
                            <a className={tabClass} href={`/courses/${course}/${chapter}/${value}`}>Lesson {value}</a>
                        </li>
                    )
                })}
                </ul>
            </div>
            {progress === 0 ? (<><div class="card-body">
            <div className="row justify-content-center">
            <div className="col-lg-10"><div class="alert alert-danger" role="alert">
            You dont have access for this lesson. 
            </div>
            </div>
            </div>
            </div></>) : progress < parsedLesson ? (<><div class="card-body">
            <div className="row justify-content-center">
            <div className="col-lg-10"><div class="alert alert-warning" role="alert">
            You dont have access for this lesson. Complete {parsedLesson - progress} more lesson to unlock this lesson.
            </div>
            </div>
            </div>
            </div>
            </>) : (<div class="card-body">
            <div className="row justify-content-center">
            <div className="col-lg-10 my-3">
            <h1 className="mb-4" style={{fontWeight: 'bolder', textTransform: 'uppercase'}}>{lessonTitle}</h1>
                <div class="embed-responsive embed-responsive-16by9" style={{display:'flex', justifyContent:'center'}}>

                <ReactPlayer
                playsinline 
                controls
                className="embed-responsive-item my-3"
                width="100%"
                height={playerHeight}
                muted={true}
                url={vidUrl}
                pip={true}
                config={{ file: { attributes: { controlsList: 'nodownload' } },
                hls: { enableWorker: false },
                attributes: { preload: 'auto' }, }}
                onEnded={() =>setFinish(true)}
                onContextMenu={e => e.preventDefault()}
                />
                
                </div>
                    </div>
                    
                    <div className="col-lg-7 text-start mt-3">
                    <form onSubmit={handleSubmit}>
                  {questionAnswer.length === 0 ? (<></>) : (<><div className="mb-4"><b>QUESTION SECTION</b></div>
                        {questionAnswer.map((val,i) => {
                            const answers = val.answers;
                            questionList.push(val.question);
                            return(
                                <>
                                <div className="question" style={{whiteSpace:'pre-wrap', backgroundColor:'whitesmoke'}}>{i+1}. {val.question}</div>
                                <select className="form-select form-select-sm mb-4" onChange={e=>handleChange(e,i)} required>
                                <option value="" disabled selected>Select your answer</option>  
                                {answers.map((val,j) => {
                                    return(                              
                                        <option value={val}>{val}</option>    
                                    )
                                })}
                                </select>
                                </>
                            )
                        })}</>)}

                    {instruction === "" ? (<></>): (<><div className="my-4"><b>BUILD YOUR OWN SCRIPT</b></div>
                    <span className="question" style={{whiteSpace:'pre-wrap'}}>{instruction}</span>
                    <div className="my-2">
                    {script === "" ? (<></>) : (<button className="btn btn-sm btn-outline-info my-2" onClick={importScript}>Import Course Script</button>)}
                    <textarea className="form-control" rows="7" value={userScript} onChange={(e) => {setUserScript(e.target.value)}} required />
                    </div></>)}

                    <div className="d-grid gap-2 mt-4 mb-4"><button type="submit" className="btn btn-success">{buttonContent}</button></div>

                    {succMsg && (<div class="alert alert-success mb-4" role="alert">
                    {succMsg}
                    </div>)}
                    {errMsg && (<div class="alert alert-danger mb-4" role="alert">
                    {errMsg}
                    </div>)}

                    </form>
                    </div>
                </div>
            </div>)}
            
            </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Lesson