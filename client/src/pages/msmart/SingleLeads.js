import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../hooks/useAuthContext'
import { useNavigate, useParams } from 'react-router-dom';
import { msmartAxios } from '../../api/axios';


function SingleLeads() {

    const {user} = useAuthContext();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const {id} = useParams();
    const {teamName} = useParams();
    const [leadName, leadNameSet] = useState("");
    const [leadPhoneNumber, leadPhoneNumberSet] = useState("");
    const [source, sourceSet] = useState("");
    const [tag, tagSet] = useState("");
    const [status, statusSet] = useState("");
    const [statusRemark, statusRemarkSet] = useState("");
    const [presentation, presentationSet] = useState("");
    const [presentationRemark, presentationRemarkSet] = useState("");
    const [followUp, followUpSet] = useState("");
    const [followUpRemark, followUpRemarkSet] = useState("");
    const [addFB, addFBSet] = useState();
    const [addFB2, addFBSet2] = useState();
    const [followTT, followTTSet] = useState();
    const [followTT2, followTTSet2] = useState();
    const [saveNumber, saveNumberSet] = useState();
    const [saveNumber2, saveNumberSet2] = useState();
    const [engFB, engFBSet] = useState();
    const [engTT, engTTSet] = useState();
    const [engWS, engWSSet] = useState();
    const [engFB2, engFBSet2] = useState();
    const [engTT2, engTTSet2] = useState();
    const [engWS2, engWSSet2] = useState();
    const [close, closeSet] = useState("");
    const [rejectionType, rejectionTypeSet] = useState("");
    const [rejectionRemark,rejectionRemarkSet] = useState("");
    const [isPresent, setIsPresent] = useState(false);
    const navigate = useNavigate();

    const delayNav = () => {
      navigate(`/msmart/db/manage/${teamName}`)
      }

    const toggleSwitch = () => {
      if(addFB === false){
        addFBSet(true)
      }else{
        addFBSet(false)
      }
    }

    const toggleSwitch1 = () => {
      if(followTT === false){
        followTTSet(true)
      }else{
        followTTSet(false)
      }}
  
    const toggleSwitch2 = () => {
        if( saveNumber === false){
                saveNumberSet(true)
              }else{
                saveNumberSet(false)
              }
        }
    
    const toggleSwitch3 = () => {
          if( engFB === false){
            engFBSet(true)
          }else{
            engFBSet(false)
          }
        }
      
    const toggleSwitch4 = () => {
          if( engTT === false){
            engTTSet(true)
          }else{
            engTTSet(false)
          }
        }

    const toggleSwitch5 = () => {
          if( engWS === false){
                  engWSSet(true)
                }else{
                  engWSSet(false)
                }
              }
    
    const switchPresent = () => {
      if(presentation === false){
        presentationSet(true);
      }else{
        presentationSet(false);
        presentationRemarkSet("");
      }
    }

  useEffect(() => {
      msmartAxios.get(`/api/msmart/lead/${id}`, {headers: {
        accessToken: user.token
      }}).then((response) => {
        const json = response.data.db;
        leadNameSet(json.leadName);
        leadPhoneNumberSet(json.leadPhoneNumber);
        sourceSet(json.leadSource)
        tagSet(json.leadTag);
        statusSet(json.leadStatus);
        statusRemarkSet(json.prospectingRemark);
        setIsPresent(json.leadPresent);
        presentationSet(json.leadPresent);
        presentationRemarkSet(json.presentRemark);
        addFBSet(json.con_addFB);
        followTTSet(json.con_followTT);
        saveNumberSet(json.con_savePhone);
        engFBSet(json.eng_facebook);
        engTTSet(json.eng_tiktok);
        engWSSet(json.eng_wsStatus);
        addFBSet2(json.con_addFB);
        followTTSet2(json.con_followTT);
        saveNumberSet2(json.con_savePhone);
        engFBSet2(json.eng_facebook);
        engTTSet2(json.eng_tiktok);
        engWSSet2(json.eng_wsStatus);
        closeSet(json.closingStatus);
        rejectionTypeSet(json.rejectionType);
        rejectionRemarkSet(json.rejectionRemark);
        followUpSet(json.followUpDate);
        followUpRemarkSet(json.followUpRemarkSet)

      })

    }, [user, id])

    const submitUpdate = () => {
      const data = {leadName: leadName, leadPhoneNumber: leadPhoneNumber, leadTag: tag, leadSource: source, leadStatus: status, prospectingRemark: statusRemark, leadPresent: presentation, presentRemark: presentationRemark, addFB: addFB, followTT: followTT, savePhone: saveNumber, engFB: engFB, engTT: engTT, engWS: engWS, closingStatus: close, rejectionType: rejectionType, rejectionRemark: rejectionRemark,followUpDate: followUp, followUpRemark: followUpRemark};
      msmartAxios.put(`/api/msmart/lead/${teamName}/${id}`, data, {headers: {
        accessToken: user.token
      }}).then((response) => {
        if(response.data.succMsg){
          setSuccess(response.data.succMsg);
          setTimeout(delayNav, 3000)
        }else{
          setError(response.data.error)
        }
      })
    }

  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">M-SMART</h1>
        <p style={{fontSize:"1rem"}}>No more 1000 files on your desk and desktop. Say hello to M-Smart 😎</p>
        </div>
        </div>
        </div>

        {!success ?(<></>): (<div class="alert alert-success text-center" role="alert">
          {success}
        </div>)}
        {!error ?(<></>): (<div class="alert alert-danger text-center" role="alert">
          {error}
        </div>)}


      <div className='row mt-3 justify-content-center'>
        <div className='col-lg-8'>
          <div className='container'>
            <div className='card'>
              <div className='card-body'>

            <div className='row justify-content-center' >
              <div className='stat-header text-center mb-3'>PROSPECTING</div>
              <div className='col-lg-4 mt-4'>
                
                <label>Name</label>
                <input type="text" defaultValue={leadName} onChange={(event) => {leadNameSet(event.target.value)}} className='form-control form-control shadow-none' maxLength="254" />
              </div>
              <div className='col-sm-1 mt-2'></div>
              <div className='col-lg-4 mt-4'>
                <label>Phone Number</label>
                <input type="text" defaultValue={leadPhoneNumber} onChange={(event) => {leadPhoneNumberSet(event.target.value)}} className='form-control form-control shadow-none' required maxLength="254" />
              </div>
            </div>
           
            <div className='row justify-content-center' >
              <div className='col-lg-4 mt-4'>
                <label>Source</label>
                <input type="text" defaultValue={source} className='form-control form-control shadow-none' onChange={(event) => {sourceSet(event.target.value)}} maxLength="254" />
              </div>
              <div className='col-sm-1 mt-2'></div>
              <div className='col-lg-4 mt-4'>
                <label>Tag (Separate by comma , )</label>
                <textarea type="text" defaultValue={tag} className='form-control form-control shadow-none' onChange={(event) => {tagSet(event.target.value)}} maxLength="1000" rows='2'/>
              </div>
            </div>

            <div className='row justify-content-center mt-4'>
              <div className='col-lg-4 mt-4'>
                <label>Status</label>
                <select class="form-select form-control-sm" defaultValue={status} onChange={(event) => {statusSet(event.target.value)}}>
                  <option value={status} selected>{status}</option>
                  <option value="Connecting">Connecting</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Result">Result</option>
                </select>
              </div>
              <div className='col-sm-1 mt-2'></div>
              <div className='col-lg-4 mt-4'>
                <label>Status Remark</label>
                <textarea type="text" defaultValue={statusRemark} onChange={(event) => {statusRemarkSet(event.target.value)}} className='form-control form-control-sm shadow-none' required maxLength="1000" rows='3'/>
              </div>
            </div>

            {isPresent === false ?(<div className='row justify-content-center mt-4'>
              <div className='col-lg-4 mt-4'>
              <div class="form-check form-switch">
              <div><input class="form-check-input" type="checkbox" onClick={switchPresent} /> <label class="form-check-label" for="flexSwitchCheckDefault"> Presentation</label></div>
              </div>
              </div>
              <div className='col-sm-1 mt-2'></div>
              {presentation === true ? (<div className='col-lg-4 mt-4'>
                <label>Present Remark</label>
                <textarea type="text" defaultValue={presentationRemark} onChange={(event) => {presentationRemarkSet(event.target.value)}} className='form-control form-control-sm shadow-none' required maxLength="1000" rows='3'/>
              </div>): (<div className='col-lg-4 mt-4'>
              </div>)}
              
            </div>) : (<div className='row justify-content-center mt-4'>
              <div className='col-lg-4 mt-4'>
              <div class="form-check form-switch">
              <div><label class="form-check-label" for="flexSwitchCheckDefault">✅ Presentation</label></div>
              </div>
              </div>
              <div className='col-sm-1 mt-2'></div>
              <div className='col-lg-4 mt-4'>
                <label>Present Remark</label>
                <textarea type="text" defaultValue={presentationRemark} onChange={(event) => {presentationRemarkSet(event.target.value)}} className='form-control form-control-sm shadow-none' required maxLength="1000" rows='3'/>
              </div>
              
            </div>)}
            

            <div className='row justify-content-center mt-4'>
              <div className='col-lg-4 mt-4'>
                <label>Follow Up Date</label>
                <input type="datetime-local" defaultValue={followUp} onChange={(event) => {followUpSet(event.target.value)}} className='form-control form-control-sm shadow-none' required maxLength="254" />
              </div>
              <div className='col-sm-1 mt-2'></div>
              <div className='col-lg-4 mt-4'>
                <label>Follow Up Remark</label>
                <textarea type="text" defaultValue={followUpRemark} onChange={(event) => {followUpRemarkSet(event.target.value)}} className='form-control form-control-sm shadow-none' required maxLength="254" rows='3' />
              </div>
              </div>

            <div className="row justify-content-center text-center mt-4">
            <div className='col-lg-4 mt-4'>
            <div className="d-grid my-3 gap-2">
              <button className='btn btn-primary mt-2' onClick={submitUpdate}>Update Database</button>
              </div>
              </div>
            </div>
            
            </div>
            </div>
          </div>
        </div>

      </div>

      <div className='row mt-3 justify-content-center'>
        <div className='col-lg-4'>
          <div className='container'>
            <div className='card'>
              <div className='card-body'>

            <div className='row justify-content-center' >
              <div className='stat-header text-center'>CONNECTING</div>
            </div>


            <div className='row justify-content-center mt-4'>
              <div className='col-lg-8 mt-4'>
              <div class="form-check form-switch">
              {addFB2 === false ? (<div><input class="form-check-input" type="checkbox" onClick={toggleSwitch} /> <label class="form-check-label" for="flexSwitchCheckDefault">Add Friend @ Facebook</label></div>) : (<label class="form-check-label" for="flexSwitchCheckDefault"> ✅ Add Friend @ Facebook</label>)}
              </div>
              <div class="form-check form-switch mt-2">
                {followTT2 === false ? (<div><input class="form-check-input" type="checkbox" onClick={toggleSwitch1}/> <label class="form-check-label" for="flexSwitchCheckDefault">Follow @ Tiktok</label></div>) : (<label class="form-check-label" for="flexSwitchCheckDefault"> ✅ Follow @ Tiktok</label>)}
                
              </div>
              <div class="form-check form-switch mt-2">
              {saveNumber2 === false ? (<div><input class="form-check-input" type="checkbox" onClick={toggleSwitch2} /> <label class="form-check-label" for="flexSwitchCheckDefault">Save Phone Number</label></div>) : (<label class="form-check-label" for="flexSwitchCheckDefault"> ✅ Save Phone Number</label>)}
              </div>
              </div>
            </div>


            <div className="row justify-content-center text-center mt-4">
            <div className='col-lg-8 mt-4'>
            <div className="d-grid my-3 gap-2">
              <button className='btn btn-primary mt-2' onClick={submitUpdate}>Update Database</button>
              </div>
              </div>
            </div>
            
            </div>
            </div>
          </div>
        </div>

        <div className='col-lg-4'>
          <div className='container'>
            <div className='card'>
              <div className='card-body'>

            <div className='row justify-content-center' >
              <div className='stat-header text-center'>ENGAGEMENT</div>
            </div>


            <div className='row justify-content-center mt-4'>
              <div className='col-lg-8 mt-4'>
              <div class="form-check form-switch">
              {engFB2 === false ? (<div><input class="form-check-input" type="checkbox" onClick={toggleSwitch3} /> <label class="form-check-label" for="flexSwitchCheckDefault">Engaged @ Facebook</label></div>) : (<label class="form-check-label" for="flexSwitchCheckDefault"> ✅ Engaged @ Facebook</label>)}
              </div>
              <div class="form-check form-switch mt-2">
              {engTT2 === false ? (<div><input class="form-check-input" type="checkbox" onClick={toggleSwitch4} /> <label class="form-check-label" for="flexSwitchCheckDefault">Engaged @ Tiktok</label></div>) : (<label class="form-check-label" for="flexSwitchCheckDefault"> ✅ Engaged @ Tiktok</label>)}
              </div>
              <div class="form-check form-switch mt-2">
              {engWS2 === false ? (<div><input class="form-check-input" type="checkbox" onClick={toggleSwitch5} /> <label class="form-check-label" for="flexSwitchCheckDefault">Engaged @ Whatsapp Status</label></div>) : (<label class="form-check-label" for="flexSwitchCheckDefault"> ✅ Engaged @ WhatsApp Status</label>)}
              </div>
              </div>
            </div>


            <div className="row justify-content-center text-center mt-4">
            <div className='col-lg-8 mt-4'>
            <div className="d-grid my-3 gap-2">
              <button className='btn btn-primary mt-2' onClick={submitUpdate}>Update Database</button>
              </div>
              </div>
            </div>
            
            </div>
            </div>
          </div>
        </div>
        

      </div>

      <div className='row mt-3 justify-content-center'>
        <div className='col-lg-8'>
          <div className='container'>
            <div className='card'>
              <div className='card-body'>

            <div className='row justify-content-center' >
              <div className='stat-header text-center mb-3'>RESULT</div>
            </div>

            <div className='row justify-content-center mt-4'>
              <div className='col-lg-4 mt-4'>
                <label>Closing Status</label>
                <select class="form-select form-control-sm" defaultValue={close} onChange={(event) => {closeSet(event.target.value)}}>
                  <option value={close}>{close}</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Booked">Booked</option>
                  <option value="CLOOOOOSED!🥳">CLOOOOOSED!🥳</option>
                </select>
          {close === 'Rejected' ? (<div>
                <label className='mt-5'>Type of Rejection</label>
                <select class="form-select form-control-sm" defaultValue={rejectionType} onChange={(event) => {rejectionTypeSet(event.target.value)}}>
                  <option defaultValue={rejectionType}>{rejectionType}</option>
                  <option value="Price">Price</option>
                  <option value="Not Interested">Not Interested</option>
                  <option value="Discuss">Discuss First</option>
                </select>
                <label className='mt-5'>Rejection Remark</label>
                <textarea type="text" className='form-control form-control-sm shadow-none' required maxLength="254" rows='3' defaultValue={rejectionRemark} onChange={(event) => {rejectionRemarkSet(event.target.value)}} />
              </div>) : (<></>)}
                
              </div>      
            </div>

            <div className="row justify-content-center text-center mt-4">
            <div className='col-lg-4 mt-4'>
            <div className="d-grid my-3 gap-2">
              <button className='btn btn-primary mt-2' onClick={submitUpdate}>Update Database</button>
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

export default SingleLeads