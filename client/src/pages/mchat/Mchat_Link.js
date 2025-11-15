import React, { useEffect, useRef, useState } from 'react';
import './chat.css'
import io from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import {Helmet} from "react-helmet";
import AP from './img/tradein.png'
import { mchatAxios } from '../../api/axios';
import { CookiesProvider, useCookies } from 'react-cookie';


const socket = io.connect(process.env.REACT_APP_MCHAT);

function Mchat_Link({setNavbar, setFoo}) {

  useEffect(() => {
    setNavbar(false);
    setFoo(false)
})


  const {chatId} = useParams();
  const chatBoxRef = useRef(null);
  const [cookies, setCookie, removeCookie] = useCookies(['user']);

  //Chat
  const [profilePic, setProfilePic] = useState("");
  const [botName, setBotName] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  //welcome
  const [getStartFlow, setGetStartFlow] = useState(null);
  const [salutationField, setSalutationField] = useState(null);
  const [nameField, setNameField] = useState("");
  const [name, setName] = useState("");
  const [salutation, setSalutation] = useState("");
  const [getStart, setGetStart] = useState(null);
  const [startErr, setStartErr] = useState("");
  const [getStartButton, setGetStartButton] = useState(true)

  //Flow
  const [flow, setFlow] = useState([])
  const [messages, setMessages] = useState([]);
  const [inputValues, setInputValues] = useState("");
  const [showInputBox, setShowInputBox] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showDivItem, setShowDivItem] = useState(false);
  const [divs, setDivs] = useState([]);
  const inputRef = useRef(null);


useEffect(()=> {

  try {
    const resLink = `/api/mchat/public/getStart/${chatId}`
    mchatAxios.get(resLink).then((response) => {

      if (response.status === 200) {
       setNameField(response.data.data.nameField)
       setSalutationField(response.data.data.salutationList.split(','))
       setGetStartFlow(response.data.data.trigger_flow_id)
    } else {
        console.error('Failed to fetch data');
    }

    })
  }catch(error){
    console.error('Failed to fetch data');
  }

}, [])

useEffect(()=> {

  // if(!cookies.user){

    try {
      const resLink = `/api/mchat/public/chat/${chatId}`
      mchatAxios.get(resLink).then((response) => {
  
        if (response.status === 200) {
         setFlow(response.data.data)
      } else {
          console.error('Failed to fetch data');
      }
  
      })
    }catch(error){
      console.error('Failed to fetch data');
    }

  // } else{

  //   try {
  //     const resLink = `/api/mchat/public/chat/history/${chatId}/${cookies.user}`
  //     mchatAxios.get(resLink).then((response) => {
  
  //       if (response.status === 200) {
  //         if(response.data.chat != null){
  //           setMessages(response.data.chat)
  //           console.log(response.data.chat)
  //         }
  //     } else {
  //         console.error('Failed to fetch data');
  //     }
  
  //     })
  //   }catch(error){
  //     console.error('Failed to fetch data');
  //   }

  // }



}, [])

const handleGetStart = (e) => {
  e.preventDefault();
  setGetStartButton(false)
  const delay = () => {
    setGetStartButton(true);
    setName("");
    setSalutation("");
  }
  setTimeout(delay, 2000)
  const data = {name: name, salutation: salutation, triggerFlow: getStartFlow};
  mchatAxios.post(`/api/mchat/getStart/${chatId}`, data).then((response) => {
    if(response.status === 200){
      const expirationTime = new Date();
      expirationTime.setDate(expirationTime.getDate() + 2); // Tambah 2 hari

      setCookie('user', `${response.data.succ}`, { path: '/', expires: expirationTime });
      document.getElementById('closeWelcome').click();
      findFlow(getStartFlow)
    }
  })
}

console.log(getStartFlow)

const handleButton = () => {
  const data = {chat: messages}
  mchatAxios.get(`/api/mchat`, messages)
}

const sendMessage = (message, user, type) => {
  setMessages(messages => [...messages, { user: user, type: type , content:  message}]);
  }

const findFlow = (id) => {
  setShowInputBox(false)
  setShowGrid(false)
  setShowDivItem(false)
  setDivs([]);

 flow.map((val, key) => {
  if(val.id === id){
    if(val.blocks.length > 0){
      val.blocks.map((item, index) => {
        const execMessage = () => {
          let content;
          if(item.category === 'Image'){
            content = process.env.REACT_APP_MCHAT + 'media/' + item.content
          }else{
            content = item.content
          }
          sendMessage(content, 'bot', item.category)
        }
        setTimeout(execMessage, 3000*(index+1));

        const timer = (3000 * val.blocks.length) + 1

        console.log(val.actions[0].type)

        const showAction = () => {
          if(val.actions[0].type === 'userinput'){
            setShowInputBox(true)
            setShowDivItem(true)
          }else if(val.actions[0].type === 'button' || val.actions[0].type === 'contact'){
            setShowInputBox(true)
            setShowGrid(true)
            setShowDivItem(true)
          }
        }
        
        setTimeout(showAction, timer);
      
      })
    }
    if(val.actions.length > 0){
      let buttons = []
      for(var i=0; i<val.actions.length; i++){
        const singleItem = val.actions[i];
        buttons.push(singleItem)
      }
      console.log(buttons)

      if(buttons.length > 0){
        buttons.map((bval, bkey) => {
          if(bval.type === 'button'){
             return flowButton(bval.buttonContent, bval.triggerFlow)
          }else if(bval.type === 'contact'){
             return contactButton(bval.buttonContent, bval.link)
          }else if (bval.type === 'userinput'){
             return userInput(bval.inputName, bval.triggerFlow)
          }
        })
      }


    }
  }
 })

 const data = {messages: messages}

 mchatAxios.put(`/api/mchat/public/chat/history/${chatId}/${cookies.user}`, messages).catch((err) => {
  console.error(err)
 })
}
    
const handleSend = (inputName, triggerFlow) => {
  const message = inputRef.current.value; // Ambil nilai terus dari inputRef
  console.log(message);
  if (message.trim()) {
    findFlow(triggerFlow)
    sendMessage(message, 'user', 'Text');
    setInputValues(""); // Reset inputValues jika perlu
    inputRef.current.value = ""; // Kosongkan textarea
  }
};


const flowButton = (name, flow) => {
  setDivs(prevDivs => [
      ...prevDivs, 
      <button 
          key={prevDivs.length} 
          className="choice-button my-1" 
          type="button" 
          onClick={(e) => handleButton(e, flow)}
      >
          {name}
      </button>
  ]);
}

const userInput = (inputName, triggerFlow) => {
  setDivs(prevDivs => [
    ...prevDivs,
    <>
      <textarea
        ref={inputRef}
        className="form-control my-2"
        placeholder={inputName}
        rows="2"
        onChange={(e) => {
          inputRef.current.value = e.target.value;  // Update dengan ref terus
          setInputValues(e.target.value);
        }}
      />
      <button
        className="send-button mx-2 my-2"
        onClick={() => handleSend(inputName, triggerFlow)}
      >
        <i className="bi bi-send-fill"></i>
      </button>
    </>
  ]);
};


const contactButton = (name, href) => {
  setDivs(prevDivs => [
      ...prevDivs, 
      <a  key={divs.length} className="contact-button my-1" href={href} target='_blank' rel="noopener noreferrer">{name}</a>
  ]);
}



useEffect(() => {
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
}, [messages]);

document.onreadystatechange = function () {
  document.getElementById('welcome').click()
};




  return (
  <div className='body d-flex justify-content-center'>
    <Helmet>
    <style>
      {`body { 
        background: ${`linear-gradient(90deg, rgba(163,236,255,1) 0%, rgba(233,145,255,1) 100%)`};
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        font-family: Arial, sans-serif;
        }

        textarea{
          resize: none;
        }

        .form-control {
          flex: 1;
          border: 0;
          outline: 0;
      }

      .form-control:focus {
        box-shadow: none;
    }

      .input-box button {
          padding: 10px 15px 10px;
          border: none;
          background-color: #007bff;
          color: #fff;
          cursor: pointer;
      }

      .input-box button:hover {
        background-color: #0056b3;
    }
      
      .input-box a {
          padding: 10px 15px 10px;
          border: none;
          text-decoration: none;
          background-color: #00a733;
          color: #fff;
          cursor: pointer;
      }

        .send-button {
          border-radius: 5px;
          border: none;
          background-color: transparent;
          color: ${'#007bff'};
          cursor: pointer;
          height: 70%;
        }

        .choice-button {
          border-radius: 5px;
          padding: 2px;
          border: none;
          background-color: #007bff;
          color: ${'#fff'};
          cursor: pointer;
          
        }

        .contact-button {
          border-radius: 5px;
          padding: 2px;
          border: none;
          background-color: #00a733;
          color: ${'#fff'};
          cursor: pointer;
          text-align: center;
          
        }
        
        `}
    </style>
    </Helmet>
        <div  className="chat-container">
                <div className="header-box">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-10">
                                <div className="avatar">
                                    <img src={AP} className='profile-pic'/><span className="align-middle" style={{fontWeight:600, marginLeft: "1vh"}}>Yi Loong Ma</span>
                                </div>
                            </div>
                            <div className="col-2 text-end">
                                <div style={{marginTop: "1vh"}} className="align-baseline">🟢</div>
                            </div>
        
                                
                        </div>
                    </div>
        
                </div>
                <div className="chat-box" ref={chatBoxRef}>
                  {messages.map((msg, index) => {
                    return(
                    msg.type === 'Text' ? (
                      <div key={index} className={`message ${msg.user}`}>
                      <div className={msg.type} style={{whiteSpace:"pre-wrap"}}>
                        {msg.content}
                      </div>
                  </div>
                    ) : msg.type === 'Image' ? (
                    <div key={index} className={`message ${msg.user}`}> 
                    <div className={msg.type}>
                      <img src={msg.content} width={'100%'} />
                      </div>
                    </div>) : msg.type === 'Video' ? (
                      <div key={index} className={`message ${msg.user}`}> 
                    <div className={msg.type}>
                      <iframe width="100%" height="auto" src={msg.content} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
                      </div></div>
                      ) : (<></>))
                      
                    
                  }
                 )}
                  
                </div>


                  {showInputBox === true ? (<>
                  <div className="input-box" style={{alignItems:'center'}}>
                    {showGrid === true ? (<>
                      <div className="d-grid gap-2 mt-2 mx-3 w-100" >
                        {showDivItem === true ? (<>{divs}</>): (<></>)}
                      </div>
                    </>) : (<>
                      {showDivItem === true ? (<>{divs}</>): (<></>)}
                    </>)}
                  </div>
                             
                  </>) : (<></>)}

                
               
            </div>

<button id='welcome' type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#staticBackdrop" hidden>
  Welcome
</button>

<div class="modal fade" id="staticBackdrop" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">

        <button id='closeWelcome' type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" hidden></button>

      <div class="modal-body">
        <p style={{fontSize:'110%'}}>{nameField}</p>
        <div class="minimal-form">
            <select class="minimal-select" onChange={(event) => {setSalutation(event.target.value)}}>
              <option></option>
              {salutationField && salutationField.map((val, key) => {
                return(
                  <option key={key} value={val}>{val}</option>
                )
              })}
            </select>

            <input type="text" class="minimal-input" onChange={(event) => {setName(event.target.value)}} />
          </div>
          <div className="d-grid">
            {getStartButton === true ? (<><button className='btn btn-sm btn-primary' onClick={handleGetStart}><i class="bi bi-box-arrow-in-right"></i> Submit</button></>) : (<>
              <button className='btn btn-sm btn-primary' disabled><i class="bi bi-box-arrow-in-right"></i> Submit</button></>)}
          </div>


      </div>
    </div>
  </div>
</div>
  </div>

  )
}

export default Mchat_Link