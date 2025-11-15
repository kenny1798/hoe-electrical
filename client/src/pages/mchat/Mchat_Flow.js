import React, { useEffect, useState } from 'react';
import { BlockMaker } from "./parts/BlockMaker";
import { mchatAxios } from '../../api/axios';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../hooks/useAuthContext';
import io from 'socket.io-client';

function Mchat_Flow() {
  
  const socket = io.connect(process.env.REACT_APP_MCHAT);
  const {id} = useParams();
  const {user} = useAuthContext();

  const [socketId, setSocketId] = useState(null);
  const [currFlow, setCurrFlow] = useState(null);
  const [flowName, setFlowName] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [succMsg, setSuccMsg] = useState("");
  const [list, setList] = useState([]);
  const [salutation, setSalutation] = useState("");
  const [nameField, setNameField] = useState("");
  const [getStartFlow, setGetStartFlow] = useState(0);
  const [getStartFlowErr, setGetStartFlowErr] = useState("");
  const [getStartFlowSucc, setGetStartFlowSucc] = useState("");

  console.log(list)



    useEffect(() => {

    socket.on('connect', async () => {
      setSocketId(socket.id);
      socket.emit('register', user.username);
    })

    socket.on('userFlow', (data) => {
      setList(data)
    })

    socket.on('newFlow', (newData) => {
      setList((prevData)=> [...prevData, newData])
    })

    return () => {
        socket.off('userFlow');
        socket.off('newFlow');
    };

    }, [user.username])

    const fetchFlow = (currentSocketId) => {
      try {
        const username = user.username;
        const resLink = `/api/mchat/flow/${currentSocketId}/${id}`
        mchatAxios.get(resLink, {headers: {
          accessToken: user.token
        }}).then((response) => {

          if (response.status === 200) {
            console.log('Data fetched');
        } else {
            console.error('Failed to fetch data');
        }

        })
      }catch(error){

      }
    }

    useEffect(() => {
      if (socketId) {
          fetchFlow(socketId);
      }
  }, [socketId]);

    useEffect(() => {
      mchatAxios.get(`/api/mchat/getStart/${id}`, {headers: {
        accessToken: user.token
      }}).then((response) => {
        console.log(response.data)
        if(response.data.data){
          setSalutation(response.data.data.salutationList);
          setNameField(response.data.data.nameField);
          setGetStartFlow(parseInt(response.data.data.trigger_flow_id, 10));
        }
      })
    }, [])

  const handleNewFlow = (e) => {
    e.preventDefault()
    const data = {flowName: flowName}
    mchatAxios.post(`/api/mchat/flow/${id}`, data, {headers: {
      accessToken: user.token
    }}).then((response) => {
      if(response.data.succ){
        setSuccMsg(response.data.succ)
        const delay = () => {
          document.getElementById('closeFlow').click();
        }
        setTimeout(delay, 2000)
      }
      
    })
  }

  const handleGetStart = (e) => {
    e.preventDefault();
    const data = {salutationList: salutation, nameField: nameField, triggerFlow: getStartFlow}
    mchatAxios.put(`/api/mchat/getStart/${id}`, data, {headers: {
      accessToken: user.token
    }}).then((response) => {
      if(response.data.succ){
        setGetStartFlowSucc(response.data.succ)
        const delay = () => {
          document.getElementById("closeGetStart").click()
        }
        setTimeout(delay, 2000)
      }else{
        setGetStartFlowErr("Unable to update message");
      }
    }).catch((error) => {
        setGetStartFlowErr("Unable to update message");
    })
  }



  const closeGetStart = (e) => {
     e.preventDefault();
     setGetStartFlowErr("");
     setGetStartFlowSucc("");
  }

  console.log(list)

  return (
    <div className='App'>
      <div className="container mt-3">
        <div className="row justify-content-center">
          <div className="col-lg-12 text-center">
            <h1 className="mt-4 mb-2 header-title">MCHAT</h1>
            <div className="row">
              <div className="col-sm-6">
                <div className="card p-1">
                <div className="row">
                      <div className="col">
                      <h1 className="mchat-title mt-2 text-start mx-2">FLOW</h1>
                      </div>
                      <div className="col text-end">
                      <button className='btn btn-sm btn-success mt-2 mx-3' data-bs-toggle="modal" data-bs-target="#flow">+Flow</button>
                      </div>
                    </div>
                  <div className="container mt-2">
                  <div className="input-group my-2">
                          <span className="form-control text-start mchat-title2">Welcome Message</span>
                          <button className="input-group-text" style={{ fontWeight: 'bolder' }} data-bs-toggle="modal" data-bs-target="#getStarted" ><i className="bi bi-pencil-fill"></i></button>
                        </div>
                    {list.map((val, key) => {
                      return (
                        <div className="input-group my-2" key={key}>
                          <span className="form-control text-start mchat-title2">{val.flowName}</span>
                          <button className="input-group-text" style={{ fontWeight: 'bolder' }} onClick={() => setCurrFlow(key)}><i className="bi bi-pencil-fill"></i></button>
                          <button className="input-group-text" style={{ fontWeight: 'bolder' }}><i className="bi bi-trash3"></i></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                {currFlow !== null && (
                  <div className="card p-1">
                    <div className="row">
                      <div className="col">
                      <h1 className="mchat-title mt-2 text-start mx-2">BLOCK </h1>
                      </div>
                      <div className="col text-end">
                      <button className='btn btn-sm btn-success mt-2 mx-3' data-bs-toggle="modal" data-bs-target="#block">+Block</button>
                      </div>
                    </div>
                    <div className="message-editor bot mx-2 mb-2">
                      <BlockMaker data={{ data: list, current: currFlow }} setList={setList} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>


<div class="modal fade" id="flow" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" >
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" >Add Flow</h5>
        <button type="button" class="btn-close" id='closeFlow' data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-start">
  <div class="mb-3">
    <label class="form-label">Flow Name</label>
    <input className='form-control' onChange={(event) => {setFlowName(event.target.value)}} />
  </div>
      </div>
        <button type="button" class="btn btn-primary mx-3 mb-4" onClick={handleNewFlow}>Save changes</button>
    </div>
  </div>
</div>

<div class="modal fade" id="getStarted" tabindex="-1" aria-labelledby="getStartedLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" aria-labelledby="getStartedLabel" >Welcome Message</h5>
        <button type="button" class="btn-close" id='closeGetStart' onClick={closeGetStart} data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-start">
      {getStartFlowErr && (<div class="alert alert-danger mb-4" role="alert">
                    {getStartFlowErr}
                    </div>)}
        {getStartFlowSucc && (<div class="alert alert-success mb-4" role="alert">
                    {getStartFlowSucc}
                    </div>)}
  <div class="mb-3">
    <label class="form-label">Salutation List</label>
    <input className='form-control' value={salutation}  onChange={(event) => {setSalutation(event.target.value)}}/>
    <span style={{fontSize:'70%'}}> *seperate salutations by commas</span>
  </div>
  <div class="mb-3">
    <label class="form-label">Welcome Message</label>
    <textarea className='form-control' value={nameField} onChange={(event) => {setNameField(event.target.value)}}></textarea>
    <span style={{fontSize:'70%'}}> *capturing visitor's name</span>
  </div>
  <div class="mb-3">
    <label class="form-label">Flow After Welcome Message</label>
    <select className='form-select' onChange={(event) => {setGetStartFlow(event.target.value)}} required>
      {!getStartFlow ? (<>
        <option>Select Flow</option>
        {list.map((val, key) => {
        return(
          <option value={parseInt(val.id, 10)}>{val.flowName}</option>
        )
      })}
      </>) : (<>
        {list.map((val, key) => {
          const userValue = list.find(item => item.id === parseInt(getStartFlow, 10))
          if(val.id === userValue.id){
            return (<option value={parseInt(val.id, 10)}>{val.flowName}</option>)
          }
        })}
        {list.map((val, key) => {
          const userValue = list.find(item => item.id === parseInt(getStartFlow, 10))
          if(val.id != userValue.id){
            return (<option value={parseInt(val.id, 10)}>{val.flowName}</option>)
          }
        })}
      </>)} 

    </select>
  </div>
      </div>
        <button type="button" class="btn btn-primary mx-3 mb-4" onClick={handleGetStart}>Save changes</button>
    </div>
  </div>
</div>


      </div>
    </div>
  );
}

export default Mchat_Flow;
