import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import { mchatAxios } from '../../../api/axios';
import { useAuthContext } from '../../../hooks/useAuthContext';

function DeleteChat({data}) {

    const {user} = useAuthContext();
    const [errMsg, setErrMsg] = useState("");
    const [succMsg, setSuccMsg] = useState("");
    const [open, setOpen] = useState(false);
  
    const onOpenModal = () =>{
      setOpen(true);
    } 
    const onCloseModal = () => {
      setErrMsg("");
      setSuccMsg("");
      setOpen(false);
    }
    const onCloseModal2 = () => {
        setErrMsg("");
        setSuccMsg("");
        setOpen(false);
        window.location.reload()
      }

    const handleDelete = () => {
        const id = data.id
        mchatAxios.delete(`/api/mchat/chat/${id}`, {headers: {
            accessToken: user.token
        }}).then((response) => {
            if(response.data.succ){
                return onCloseModal2()
            }else{
                setErrMsg(response.data.err)
                setTimeout(onCloseModal, 2000)
            }
        })
    }

  return (
    <div>
        <button className='btn btn-sm btn-danger my-1 mx-1' onClick={onOpenModal}><i class="bi bi-trash3"></i></button>
        <Modal open={open} onClose={onCloseModal} center classNames={{
          overlay: 'customOverlay',
          modal: 'customModal',
        }}>
         <div className="container">
            <div className='row'>
        <div className='col-lg-12'>
        <br/>
        {succMsg && (<div class="alert alert-success mb-4" role="alert">
                    {succMsg}
                    </div>)}
                    {errMsg && (<div class="alert alert-danger mb-4" role="alert">
                    {errMsg}
                    </div>)}
      <p>Are you sure you want to delete this chat?</p>
        <div class="d-grid gap-2 d-md-block text-center">
            <button class="btn btn-danger mx-1" type="button" onClick={handleDelete}>Yes</button>
            <button class="btn btn-secondary mx-1" type="button" onClick={onCloseModal}>No</button>
        </div>
        </div>
        </div>
            </div>

        </Modal>

    </div>
  )
}

ReactDOM.createPortal(<DeleteChat/>, document.getElementById('root'))

export default DeleteChat