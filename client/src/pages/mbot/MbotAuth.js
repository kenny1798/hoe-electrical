import React, { useEffect, useState } from 'react';
import axios, { mbotAxios } from '../../api/axios';
import { useAuthContext } from '../../hooks/useAuthContext';
import QRCode from 'react-qr-code';
import io from 'socket.io-client';
import LoadingImg from '../../components/loading.gif';
import { useNavigate } from 'react-router-dom';

const socket = io.connect(process.env.REACT_APP_MBOT);

function MbotAuth() {

  const {user} = useAuthContext();
  const navigate = useNavigate();
  const [buttonHide, setButtonHide] = useState("");
  const [reconButton, setReconButton] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [logMsg, setLogMsg] = useState("Press Generate QR to begin");
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [subStatus, setSubStatus] = useState("")
  const [message, setMessage ] = useState("");

  socket.on('qrvalue', (val) => {
      setQrValue(val)
    })
  
    socket.on('loading', (val) => {
      setLoading(val)
    })
  
    socket.on('btnhide', (val) => {
      setButtonHide(val)
    })
  
    socket.on('message', (msg) => {
      setLogMsg(msg)
    })

    socket.on('error', (val) => {
      setError(val)
      const refresh = () => {
        window.location.reload()
      }
      setTimeout(refresh, 3000)
    })

    socket.on('success', (val) => {
      setError('')
      setSuccess(val)
      const delayNav = () => {
        navigate('/mbot')
      }
      setTimeout(delayNav, 3000)
    })

    console.log(qrValue)

    useState(() => {
      mbotAxios.get('/api/user/wsauth/check', {headers: {
        accessToken: user.token
      }}).then((response) => {
        const json = response.data.status;
        if(json === 'connected'){
          setLogMsg('WhatsApp Connected');
          setButtonHide("Hide");
          setReconButton("Show");
        }
      })
    }, [user.token])

    useEffect(() => {
      axios.get('/api/user/mbot/check/subscription', {headers: {
        accessToken: user.token
      }}).then((response) => {
        const json = response.data;
        if(json.Nothing){
          navigate('/mbot')
        }
        else if(json.status){
          setSubStatus(json.status);
          setMessage(json.message);
        }else{
          setSubStatus("");
        }
      })
    }, [navigate, user.token])


    const generateQR = (e) =>{
      e.preventDefault();
      setButtonHide("Hide")
      setLoading('load');
        mbotAxios.get('/whatsapp-auth', {headers: {
          accessToken: user.token
        }})
    }

    const reconWs = () => {
      setReconButton("")
      setLoading('load')
      mbotAxios.get('/api/user/wsauth/delete', {headers: {
        accessToken: user.token
      }}).then((response) => {
        if(response.data.message){
          setLogMsg(response.data.message);
          const delayReload = () => {
            window.location.reload();
          }
          setTimeout(delayReload, 2000)
        }else{
          setLogMsg(response.data.error);
          const delayReload = () => {
            window.location.reload();
          }
          setTimeout(delayReload, 2000)
        }
      })
    }


return (
  <div className='App'>
  <div className="container mt-3">
    <div className="row justify-content-center text-center">
      <div className="col-lg-12">
      <h1 className="mt-4 header-title">CONNECT WHATSAPP</h1>
      </div>
      <div className='row justify-content-center'>

      {subStatus === "" ? (<></>) 
      : subStatus === "Subscription" ? (<>
      <div className="col-md-8">
      {error && (<div class="alert alert-danger" role="alert">
      {error}
      </div>)}
      {success && (<div class="alert alert-success" role="alert">
      {success}
      </div>)}
        <div className="card text-center my-3">
        <div className="card-header">
        <p className="card-text">Message: {logMsg}</p>
      </div>
      <div className="card-body">
      {!buttonHide ? (<button className='btn btn-primary btn-sm' onClick={generateQR}> Generate QR </button>) : (<></>)}
          {reconButton ? (<button className='btn btn-danger btn-sm' onClick={reconWs}> Reconnect WhatsApp </button>) : (<></>)}
        {loading && (<img src={LoadingImg} alt='Loading' width='50' />)}
        {qrValue && (<QRCode size={300} bgColor='white' fgColor='black' value={qrValue} />)}
      </div>
    </div>
  </div>
          </>) 
        : subStatus === "Expired" && (<>
        <div className='row justify-content-center text-center mb-2'>
          <div className='col-lg-6'>
            <div class="alert alert-danger" role="alert">
              {message}
            </div>
          </div>
        </div>
        </>)}
  </div>
      </div>
      </div>
    </div>
)
}

export default MbotAuth