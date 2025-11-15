import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import { mchatAxios } from '../../../api/axios';
import { useAuthContext } from '../../../hooks/useAuthContext';

function CreateChat() {

    const {user} = useAuthContext();
    const [errMsg, setErrMsg] = useState("");
    const [succMsg, setSuccMsg] = useState("");
    const [name, setName] = useState("");
    const [link,setLink] = useState("");
    const [open, setOpen] = useState(false);
    const [hideBtn, setHideBtn] = useState("");
  
    const onOpenModal = () =>{
      setOpen(true);
    } 
    const onCloseModal = () => {
      setErrMsg("");
      setSuccMsg("");
      setHideBtn("");
      setOpen(false);
    }



    const handleCreate = (e) => {

        e.preventDefault()
        const data = {bot_name: name, link: link}
        mchatAxios.post(`/api/mchat/chat`, data, {headers:{
          accessToken: user.token
        }}).then((response) => {
          if(response.data.succ){
            setSuccMsg(response.data.succ)
            const delay = () => {
                setOpen(false);
            }
            setTimeout(delay, 2000)
          }else{
            setErrMsg(response.data.err)
          }
        })
      }

  return (
    <div>
        <button className='btn btn-sm btn-success mt-2 mx-2' onClick={onOpenModal}>+Chat</button>
        <Modal open={open} onClose={onCloseModal} center classNames={{
          overlay: 'customOverlay',
          modal: 'customModal',
        }}>
         <div className="container">
            <div className='row'>
        <div className='col-lg-12'>
        <h2 className='mt-4'>Create A Chat</h2>
        <br/>
        {succMsg && (<div class="alert alert-success mb-4" role="alert">
                    {succMsg}
                    </div>)}
        {errMsg && (<div class="alert alert-danger mb-4" role="alert">
                    {errMsg}
                    </div>)}
        <form onSubmit={handleCreate}>
      <div class="modal-body">
      <div class="mb-3">
        <label>Bot Name</label>
        <input type="text" class="form-control" onChange={(event) => {setName(event.target.value)}} required />
    </div>
      <div class="mb-3">
        <label>Bot Link</label>
        <input type="text" class="form-control" onChange={(event) => {setLink(event.target.value)}} required />
        <p>https://teameagles.my/{link}/`id`</p>
    </div>
      </div>
      <div class="d-grid gap-2 mx-3 mb-3">
        <button class="btn btn-primary" type="submit">Create Chat</button>
      </div>
      </form>
        </div>
        </div>
            </div>

        </Modal>
    </div>
  )
}

ReactDOM.createPortal(<CreateChat/>, document.getElementById('root'))

export default CreateChat