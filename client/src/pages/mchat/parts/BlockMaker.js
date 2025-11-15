import React, { useEffect, useState } from 'react';
import ReactPlayer from 'react-player'
import { useAuthContext } from '../../../hooks/useAuthContext';
import { useParams } from 'react-router-dom';
import { mchatAxios } from '../../../api/axios';


export function BlockMaker({ data, setList }) {

  
  const {id} = useParams();
  const {user} = useAuthContext();

  //blocks
  const [blockType, setBlockType] = useState("");
  const [blockContent, setBlockContent] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editBlockType, setEditBlockType] = useState("");
  const [editBlockContent, setEditBlockContent] = useState(null);
  const [addErr, setAddErr] = useState("");
  const [addSucc, setAddSucc] = useState("");
  const [saveButton, setSaveButton] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [saveSucc, setSaveSucc] = useState("");
  const [editErr, setEditErr] = useState("");
  const [editSucc, setEditSucc] = useState("");

  //actions
  const [actionType, setActionType] = useState("");
  const [buttonName, setButtonName] = useState("");
  const [linkFlow, setLinkFlow] = useState(null);
  const [newFlowAction, setNewFlowAction] = useState("");
  const [actionLink, setActionLink] = useState("");
  const [inputType, setInputType] = useState("");
  const [inputName, setInputName] = useState("");
  const [actionButton, setActionButton] = useState(true);
  const [actionErr, setActionErr] = useState("");
  const [actionSucc, setActionSucc] = useState("");
  



  const pathMedia = process.env.REACT_APP_MCHAT + 'media/'


  const editBlockTypeList = [
                              {value:'Text', title:'Text'},
                              {value:'Image', title:'Image'},
                              {value:'Video', title:'Video'}
                            ];


  

  const blocks = data.data[data.current].blocks || [];
  const actions = data.data[data.current].actions || [];
  const flowId = data.data[data.current].id;
  const singleFlow = data.data[data.current];
  const flows = data.data;

  useEffect(() => {
    const hasUserInput = actions.some(item => item.type === 'userinput');
    const limitButtons = actions.length;
    if (hasUserInput) {
      setActionButton(false);
    }
    if(limitButtons > 4){
      setActionButton(false);
    }
  }, [actions]);

  const actionChange = (val) => {
    setActionType(val)
    setButtonName("");
    setLinkFlow(null);
    setNewFlowAction("");
    setActionLink("");
    setInputType("");
    setInputName("");
  }

  const onFileChange = (e) => {
    if(e.target.files && e.target.files.length > 0) {
      setBlockContent(e.target.files[0]);
    }
  };

  const onEditFileChange = (e) => {
    if(e.target.files && e.target.files.length > 0) {
      setEditBlockContent(e.target.files[0]);
    }
  };

  const moveUp = (id) => {
    setSaveButton(true)
    if (!blocks || blocks.length === 0) return;

    let updatedBlocks = [...blocks];
    let index = updatedBlocks.findIndex(item => item.id === id);

    if (index > 0) {
      [updatedBlocks[index], updatedBlocks[index - 1]] = [updatedBlocks[index - 1], updatedBlocks[index]];
      let updatedList = [...data.data];
      updatedList[data.current] = { ...updatedList[data.current], blocks: updatedBlocks };
      setList(updatedList);
    }
  };

  const moveDown = (id) => {
    setSaveButton(true)
    if (!blocks || blocks.length === 0) return;

    let updatedBlocks = [...blocks];
    let index = updatedBlocks.findIndex(item => item.id === id);

    if (index < blocks.length - 1) {
      [updatedBlocks[index], updatedBlocks[index + 1]] = [updatedBlocks[index + 1], updatedBlocks[index]];
      let updatedList = [...data.data];
      updatedList[data.current] = { ...updatedList[data.current], blocks: updatedBlocks };
      setList(updatedList);
    }
  };

  const handleAddText = (e) => {
    e.preventDefault();
      const data = {blockType: blockType, blockContent: blockContent}
      mchatAxios.put(`/api/mchat/block/add/text/${flowId}/${id}`, data, {headers: {
        accessToken: user.token
      }}).then((response) => {
        if(response.data.succ){
          setAddSucc(response.data.succ)
          const delay = () => {
            document.getElementById('closeAdd').click();
            setAddSucc('');
          }
          setTimeout(delay, 2000)
        }else{
          setAddErr('Unable to add block. Please try again.')
          const delay = () => {
            document.getElementById('closeAdd').click();
            setAddErr('');
          }
          setTimeout(delay, 2000)
        }
      }).catch((err) => {
        setAddErr('Unable to add block. Please try again.')
        const delay = () => {
          document.getElementById('closeAdd').click();
          setAddErr('');
        }
        setTimeout(delay, 2000)
      })



  }
  
  const handleAddImage = (e) => {
    e.preventDefault();
      const formData = new FormData();
      formData.append('image', blockContent);
      formData.append('blockType', blockType);
      mchatAxios.put(`/api/mchat/block/add/image/${flowId}/${id}`, formData, {
        headers: {
          accessToken: user.token,
          'Content-Type': 'multipart/form-data',
        }
      }).then((response) => {
        if(response.data.succ){
          setAddSucc(response.data.succ);
          const delay = () => {
            document.getElementById('closeAdd').click();
            setAddSucc('');
          }
          setTimeout(delay, 2000);
        } else if (response.data.error) {
          setAddErr(response.data.error);
          const delay = () => {
            document.getElementById('closeAdd').click();
            setAddErr('');
            setBlockContent(null);
          }
          setTimeout(delay, 2000);
        }
        else {
          setAddErr(response.data.error);
          const delay = () => {
            document.getElementById('closeAdd').click();
            setAddErr('');
            setBlockContent(null);
          }
          setTimeout(delay, 2000);
        }
      }).catch((err) => {
        setAddErr('Unable to add block. Please try again.');
        const delay = () => {
          document.getElementById('closeAdd').click();
          setAddErr('');
          setBlockContent(null);
        }
        setTimeout(delay, 2000);
        console.log(err)
      });
    

  }

  const handleSaveImageEdit = () => {
    const formData = new FormData();
    formData.append('image', editBlockContent);
    formData.append('blockType', editBlockType);

    mchatAxios.put(`/api/mchat/block/update/image/${flowId}/${id}/${editId}`, formData, {
      headers: { accessToken: user.token },
      'Content-Type': 'multipart/form-data',
    })
    .then(response => {
      if (response.data.succ) {
        setEditSucc(response.data.succ);
        const delay = () => {
          setEditSucc('');
          setEditBlockContent(null);
          setEditBlockType('');
          document.getElementById('closeEdit').click();
        }
        setTimeout(delay, 2000)
      } else {
        setEditErr(response.data.error);
        const delay = () => {
          setEditErr('');
          document.getElementById('closeEdit').click();
        }
        setTimeout(delay, 2000)
      }
    })
    .catch(error => {
      setEditErr('Error updating block. Please try again');
      console.log(error)
      const delay = () => {
        setEditErr('');
        document.getElementById('closeEdit').click();
      }
      setTimeout(delay, 2000)
    });
  };

  const handleSavePosition = (e) => {
    e.preventDefault()
    setSaveButton(false)
    mchatAxios.put(`/api/mchat/block/update/position/${flowId}/${id}`, { blocks }, { headers: { accessToken: user.token } })
      .then(response => {
        if (response.data.succ) {
          setSaveSucc(response.data.succ);
          const delay = () => {
            setSaveSucc('');
          }
          setTimeout(delay, 2000);
        } else {
          setAddErr('Unable to save block positions. Please try again.');
          const delay = () => {
            setSaveErr('');
          }
          setTimeout(delay, 2000);
        }
      }).catch(err => {
        setAddErr('Unable to save block positions. Please try again.');
        const delay = () => {
          setSaveErr('');
        }
        setTimeout(delay, 2000);
      });
  };

  const handleSaveTextEdit = () => {
    const updatedBlock = { blockType: editBlockType, blockContent: editBlockContent };

    mchatAxios.put(`/api/mchat/block/update/text/${flowId}/${id}/${editId}`, updatedBlock, {
      headers: { accessToken: user.token },
    })
    .then(response => {
      if (response.data.succ) {
        setEditSucc(response.data.succ);
        const delay = () => {
          setEditSucc('');
          setEditBlockContent(null);
          setEditBlockType('');
          document.getElementById('closeEdit').click();
        }
        setTimeout(delay, 2000)
      } else {
        setEditErr(response.data.error);
        const delay = () => {
          setEditErr('');
          document.getElementById('closeEdit').click();
        }
        setTimeout(delay, 2000)
      }
    })
    .catch(error => {
      setEditErr('Error updating block. Please try again');
      console.log(error)
      const delay = () => {
        setEditErr('');
        document.getElementById('closeEdit').click();
      }
      setTimeout(delay, 2000)
    });
  };

  const handleAddAction = () => {
    const data = {actionType: actionType, content: buttonName, triggerFlow: linkFlow, newFlowName: newFlowAction, link: actionLink, inputType: inputType, inputName: inputName};

    mchatAxios.put(`/api/mchat/action/add/${id}/${flowId}`, data, {headers: {
      accessToken: user.token
    }}).then((response) => {
      if(response.data.succ){
        setActionSucc(response.data.succ)
        const delay = () => {
          setActionType("")
          setButtonName("");
          setLinkFlow(null);
          setNewFlowAction("");
          setActionLink("");
          setInputType("");
          setInputName("");
          setActionSucc("")
          document.getElementById('action').click();
        }
        setTimeout(delay, 2000)
      }else{
        setActionErr(response.data.err)
        const delay = () => {
          setActionType("")
          setButtonName("");
          setLinkFlow(null);
          setNewFlowAction("");
          setActionLink("");
          setInputType("");
          setInputName("");
          setActionErr("")
          document.getElementById('action').click();
        }
        setTimeout(delay, 2000)
      }
    })
    .catch(err => {
      console.log(err)
      setActionErr('Add action error. Please try again')
        const delay = () => {
          setActionType("")
          setButtonName("");
          setLinkFlow(null);
          setNewFlowAction("");
          setActionLink("");
          setInputType("");
          setInputName("");
          setActionErr("")
          document.getElementById('action').click();
        }
        setTimeout(delay, 2000)
    })
  }

  console.log(actionType)


  return (
    <div>
      {saveErr && (<div class="alert alert-danger mb-4" role="alert">
                    {saveErr}
                    </div>)}
        {saveSucc && (<div class="alert alert-success mb-4" role="alert">
                    {saveSucc}
                    </div>)}
      {saveButton === true && (<div className='text-end'>
      <button className='btn btn-primary btn-sm mt-3' onClick={handleSavePosition}>Save Position</button>
      </div>)}

      
      {blocks.map((item, key) => {

        const handleClick = (id, type, content) => {
           setEditId(id);
           setEditBlockType(type);
           setEditBlockContent(content);
          }
        

        return(
          <div key={item.id} className="text mt-3" style={{ padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <span style={{paddingRight:'10px', fontSize:'80%', fontFamily:'Arial', fontWeight:'bolder', color:'gray'}}>{key+1}</span>
          <div className='row'>
            <div className="col-auto text-start">
            
            <button className="btn btn-sm btn-light" onClick={() => moveUp(item.id)} style={{ fontWeight: 'bolder' }}><i className="bi bi-arrow-up"></i></button>
              <button className="btn btn-sm btn-light" onClick={() => moveDown(item.id)} style={{ fontWeight: 'bolder' }}><i className="bi bi-arrow-down"></i></button>
            </div>
            <div className='col text-end'>
            <button className="btn btn-sm btn-light" style={{ fontWeight: 'bolder' }} onClick={() => handleClick(item.id, item.category, item.content)} data-bs-toggle="modal" data-bs-target="#editBlock"><i className="bi bi-pencil"></i></button>
            <button className="btn btn-sm btn-light" style={{ fontWeight: 'bolder', color:'red' }}><i className="bi bi-trash3"></i></button>
            </div>
          </div>
            {item.category === 'Video' ? (<div className='justify-content-center mt-2 mx-2'>
              <ReactPlayer url={item.content}  width={'100%'} height={'30vh'}/>
            </div>) : item.category === 'Image' ? (<>
              <img src={pathMedia + item.content} />
            </>) : (<div className='text-start mt-2 mx-2'>{item.content}</div>)}
            

          
        </div>
        )
      })}

      <hr/>
      {actions.map((item,key) => {

        if(item.type === 'button'){
          return (
            <div className='text-end'><button className='btn btn-sm btn-danger'><i class="bi bi-trash3"></i> Delete Button</button><div className='d-grid'><button className='btn btn-sm btn-primary mb-3'>{item.buttonContent}</button></div></div>
          )
        }else if(item.type === 'contact'){
          return (
            <div className='text-end'><button className='btn btn-sm btn-danger'><i class="bi bi-trash3"></i> Delete Button</button><div className='d-grid'><a href={item.link} target='_blank' rel="noopener noreferrer" className='btn btn-sm btn-success mb-3'>{item.buttonContent}</a></div></div>
          )
        }else if(item.type === 'userinput'){

          return (<div className='text-end'><button className='btn btn-sm btn-danger mb-2 mx-1'><i class="bi bi-trash3"></i> Delete User Input</button>
          <div className="d-grid">
            <input className='form-control' placeholder={item.inputName} type={item.inputType} />
          </div>
          </div>)
          
        }

        
      })}

      {actionButton === true ? (<><div className='card mt-3' style={{borderStyle: 'dashed', boxShadow:'none', cursor: 'pointer'}} data-bs-toggle="modal" data-bs-target="#action"><span className='mchat-title'>+Action</span></div></>) : (<></>)}

      


<div class="modal fade" id="editBlock" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Edit Block</h5>
        <button type="button" id='closeEdit' class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-start">
      {editErr && (<div class="alert alert-danger mb-4" role="alert">
                    {editErr}
                    </div>)}
        {editSucc && (<div class="alert alert-success mb-4" role="alert">
                    {editSucc}
                    </div>)}
  <div class="mb-3">
    <label class="form-label">Block Type</label>
    <select className='form-select' onChange={(event) => {setEditBlockType(event.target.value)}} defaultValue={editBlockType}>
    <option value={editBlockType}>{editBlockType}</option>
      {editBlockTypeList.map((val,key) => {

        if(val.value != editBlockType){
          return(
            <option value={val.value}>{val.title}</option>
          )
        }

      })}
    </select>
  </div>
  {editBlockType === 'Text' ? (<>  
  <div class="mb-3">
    <label class="form-label">Text</label>
    <textarea className='form-control' onChange={(event) => {setEditBlockContent(event.target.value)}} value={editBlockContent}>{editBlockContent}</textarea>
    
  </div>
  <div className="d-grid">
  <button type="button" class="btn btn-primary my-4" onClick={handleSaveTextEdit}>Save Changes</button>
  </div>
  </>) 
  : editBlockType === 'Image' ? (<>
    <div class="mb-3">
      <div className="text-center mb-4">
      <img src={pathMedia + editBlockContent} width={'80%'}/>
      </div>
    <label class="form-label">Replace Image</label>
    <input class="form-control form-control-sm" type="file"  onChange={onEditFileChange} />
  </div>
  <div className="d-grid">
  <button type="button" class="btn btn-primary my-4" onClick={handleSaveImageEdit}>Save Changes</button>
  </div>
  </>) 
  : editBlockType === 'Video' ? (<>
  
  <div class="mb-3">
      <div className="mb-3">
        <ReactPlayer url={editBlockContent} width={'100%'} height={'30vh'}/>
      </div>
    <label class="col-form-label"><span style={{color:'red'}}><i class="bi bi-youtube"></i></span> Youtube Link </label>
    <input class="form-control form-control-sm" type="text" value={editBlockContent} onChange={(event) => {setEditBlockContent(event.target.value)}} />
  </div>

  <div className="d-grid">
  <button type="button" class="btn btn-primary my-4" onClick={handleSaveTextEdit}>Save Changes</button>
  </div>

  

  </>) 
  : (<></>) }

      </div>
        
    </div>
  </div>
</div>

<div class="modal fade" id="block" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Add Block</h5>
        <button type="button" id='closeAdd' class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-start">
      {addErr && (<div class="alert alert-danger mb-4" role="alert">
                    {addErr}
                    </div>)}
        {addSucc && (<div class="alert alert-success mb-4" role="alert">
                    {addSucc}
                    </div>)}
  <div class="mb-3">
    <label class="form-label">Block Type</label>
    <select class="form-select" required onChange={(event) => {setBlockType(event.target.value); setBlockContent(null)}}>
      <option selected value="">Select Type</option>
      <option value="Text">Text</option>
      <option value="Image">Image</option>
      <option value="Video">Video</option>
    </select> 
  </div>

  {blockType === 'Text' ? (
    <div class="mb-3">
    <label for="exampleFormControlTextarea1" class="form-label" >Text</label>
    <textarea class="form-control" id="exampleFormControlTextarea1" rows="3" onChange={(event) => {setBlockContent(event.target.value)}}></textarea>
    <div className="d-grid"><button type="button" class="btn btn-primary mt-4" onClick={handleAddText}>Save changes</button></div>
  </div>
  ) : blockType === 'Image' ? (
    <div class="mb-3">
      <label for="formFile" class="form-label">Upload an Image</label>
      <input class="form-control" type="file" onChange={onFileChange}/>
      <div className="d-grid"><button type="button" class="btn btn-primary mt-4" onClick={handleAddImage}>Save changes</button></div>
    </div>
  ) : blockType === 'Video' ? (
    <div class="mb-3">
    <label class="col-form-label"><span style={{color:'red'}}><i class="bi bi-youtube"></i></span> Youtube Link </label>
    <div class="col">
      <input type="text" class="form-control" onChange={(event) => {setBlockContent(event.target.value)}} />
    </div>
    <div className="d-grid"><button type="button" class="btn btn-primary mt-4" onClick={handleAddText}>Save changes</button></div>
  </div>
  ) : (<></>)}



      </div>
        
    </div>
  </div>
</div>

<div class="modal fade" id="action" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Add Action</h5>
        <button type="button" id='closeAction' class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-start">
      {actionErr && (<div class="alert alert-danger mb-4" role="alert">
                    {actionErr}
                    </div>)}
        {actionSucc && (<div class="alert alert-success mb-4" role="alert">
                    {actionSucc}
                    </div>)}
  <div class="mb-3">
    <label class="form-label">Action Type</label>
    <select class="form-select" required onChange={(event) => {actionChange(event.target.value);}}>
      <option selected value="">Select Type</option>
      <option value="button">Flow Button</option>
      <option value="contact">Link Button</option>
      <option value="userinput">User Input</option>
    </select> 
  </div>

  {actionType === 'button' ? (<>
    <div class="mb-3">
    <label class="form-label">Button Caption</label>
    <input type="text" class="form-control" value={buttonName} onChange={(event)  => {setButtonName(event.target.value)}} />
  </div>
  <div class="mb-3">
    <label class="form-label">Link to flow</label>
    <select class="form-select" required value={linkFlow} onChange={(event) => {setLinkFlow(event.target.value)}}>
      <option selected></option>
      <option style={{color:'#7d7d7d'}}  value={null}>None</option>
      <option style={{color:'#00b205'}} value={0}>+New Flow</option>
      {flows.map((item) => {
        return (<option value={item.id}>{item.flowName}</option>)
      })}
    </select> 
  </div>
  
  {linkFlow === '0' ? (<>
    <div class="mb-3">
    <label class="form-label">Flow Name</label>
    <input type="text" class="form-control" value={newFlowAction} onChange={(event)  => {setNewFlowAction(event.target.value)}} />
  </div>
  </>) : (<></>)}
  
  {!buttonName || !linkFlow ? (<><div className="d-grid"><button type="button" class="btn btn-primary my-4" disabled>Add Action</button></div></>) : 
  !newFlowAction && linkFlow === '0' ? (<><div className="d-grid"><button type="button" class="btn btn-primary my-4" disabled>Add Action</button></div></>) :
  (<> <div className="d-grid"><button type="button" class="btn btn-primary my-4" onClick={handleAddAction}>Add Action</button></div></>)}

  </>) : 
  
  actionType === 'userinput' ? (<>
  <div className="mb-3">
    <span style={{color:'red', fontSize:'80%'}}>*Warning: using User Input action will result in deleting all current action on this flow*</span>
  </div>
  <div class="mb-3">
    <label class="form-label">Input Type</label>
    <select class="form-select" required value={inputType} onChange={(event) => {setInputType(event.target.value)}}>
      <option></option>
      <option selected value="Text">Text</option>
      <option value='Number'>Numbers</option>
    </select> 
  </div>
  <div class="mb-3">
    <label class="form-label">Input Name</label>
    <input type="text" class="form-control" value={inputName} onChange={(event)  => {setInputName(event.target.value)}} />
  </div>
  <div class="mb-3">
    <label class="form-label">Link to flow</label>
    <select class="form-select" required value={linkFlow} onChange={(event) => {setLinkFlow(event.target.value)}}>
      <option selected></option>
      <option style={{color:'#7d7d7d'}}  value={null}>None</option>
      <option style={{color:'#00b205'}} value={0}>+New Flow</option>
      {flows.map((item) => {
        return (<option value={item.id}>{item.flowName}</option>)
      })}
    </select> 
  </div>
 
  {linkFlow === '0' ? (<>
    <div class="mb-3">
    <label class="form-label">Flow Name</label>
    <input type="text" class="form-control" value={newFlowAction} onChange={(event)  => {setNewFlowAction(event.target.value)}} />
  </div>
  </>) : (<></>)}

  {!inputType || ! inputName || !linkFlow ? (<><div className="d-grid"><button type="button" class="btn btn-primary my-4" disabled>Add Action</button></div></>) : 
  !newFlowAction && linkFlow === '0' ? (<><div className="d-grid"><button type="button" class="btn btn-primary my-4" disabled>Add Action</button></div></>) :
  (<> <div className="d-grid"><button type="button" class="btn btn-primary my-4" onClick={handleAddAction}>Add Action</button></div></>)}
  
  </>) : 
  
  actionType === 'contact' ? (<>
  <div class="mb-3">
    <label class="form-label">Button Caption</label>
    <input type="text" class="form-control" value={buttonName} onChange={(event)  => {setButtonName(event.target.value)}} />
  </div>
  <div class="mb-3">
    <label class="form-label"><span style={{color:'#2525ff'}}><i class="bi bi-link-45deg"></i></span>Link</label>
    <input type="text" class="form-control" value={actionLink} onChange={(event) => {setActionLink(event.target.value)}} />
  </div>

  {!buttonName || ! actionLink ? (<><div className="d-grid"><button type="button" class="btn btn-primary my-4" disabled>Add Action</button></div></>) : (<>
    <div className="d-grid"><button type="button" class="btn btn-primary my-4" onClick={handleAddAction}>Add Action</button></div></>)}
  </>) : (<></>)}

      </div>
    </div>
  </div>
</div>

    </div>
  );
}
