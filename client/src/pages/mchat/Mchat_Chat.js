import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useAuthContext } from '../../hooks/useAuthContext';
import {mchatAxios} from '../../api/axios';
import CreateChat from './parts/CreateChat';
import DeleteChat from './parts/DeleteChat';
import io from 'socket.io-client';

function Mchat_Chat() {

    const socket = io.connect(process.env.REACT_APP_MCHAT);

    const {user} = useAuthContext();
    const [tableData, setTableData] = useState([]);
    const [socketId, setSocketId] = useState(null);
    const [errMsg, setErrMsg] = useState("");
    const [succMsg, setSuccMsg] = useState("");
    const [name, setName] = useState("");
    const [link,setLink] = useState("");

    useEffect(() => {
      socket.on('connect', async () => {
        console.log('Connected with socket ID: ', socket.id);
        setSocketId(socket.id);
        socket.emit('register', user.username);
    });

      socket.on('userChat', (data) => {
        setTableData(data);

    });

    socket.on('newData', (newData) => {
      console.log('New data received from server:', newData);
      setTableData((prevData) => [...prevData, newData]);
  });

    return () => {
        socket.off('userChat');
        socket.off('newData');
    };
  }, [user.username]);

  const fetchChat = (currentSocketId) => {
    try {
      const username = user.username
      console.log('Fetching data with:', { username, currentSocketId });
      const resLink = `/api/mchat/chat/${currentSocketId}`
      mchatAxios.get(resLink, {headers: {
        accessToken: user.token
      }}).then((response) => {
        
      if (response.status === 200) {
        console.log('Data fetched');
    } else {
        console.error('Failed to fetch data');
    }
      })



  } catch (error) {
      console.error('Error:', error);
  }
  }

  useEffect(() => {
    if (socketId) {
        fetchChat(socketId);
    }
}, [socketId]);

    const clearMsg = () => {
      setErrMsg("");
      setSuccMsg("");
    }

console.log(tableData)

  return (
    <div className='App'>
        <div className="container mt-3">
            <div className="row justify-content-center">
                <div className="col-lg-12 text-center">
                <h1 className="mt-4 header-title">MCHAT</h1>

                    <div className='row justify-content-center'>
                        <div className="col-sm-10">
                            <div className="row">
                            <div className="col text-start mx-2">
                                    <h4 className='my-2'>Chat List</h4>
                                </div>
                                <div className="col text-end">
                                    <CreateChat />
                                </div>
                            </div>

                            <div class="card">
                                <div class="card-body">
                                    <div className="table-responsive">
                                        <table class="table table-striped">
                                            <thead>
                                                <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Name</th>
                                                <th scope="col">Link</th>
                                                <th scope="col">Data</th>
                                                <th scope="col">Edit Design</th>
                                                <th scope="col">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                              {tableData.map((val, key) => {
                                                return(
                                                  <tr>
                                                  <th scope="row" className='align-middle'>{key+1}</th>
                                                  <td className='align-middle'>{val.bot_name}</td>
                                                  <td className='align-middle'>{val.link}</td>
                                                  <td style={{alignContent:'center'}}><Link to={`/mchat/chat/${val.id}`} className='btn btn-sm btn-primary'><i class="bi bi-pencil-fill"></i></Link></td>
                                                  <td style={{alignContent:'center'}}><Link to={`/mchat/chat/${val.id}`} className='btn btn-sm btn-primary'><i class="bi bi-pencil-fill"></i></Link></td>
                                                  <td><Link to={`/mchat/chat/${val.id}`} className='btn btn-sm btn-primary'><i class="bi bi-pencil-fill"></i></Link><DeleteChat data={{id: val.id}} /></td>
                                                  
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
        </div>
    </div>
  )
}

export default Mchat_Chat