import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios, { msmartAxios } from '../../../api/axios';
import { useAuthContext } from '../../../hooks/useAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../../../context/ToastContext';

function ManagerLeadList() {
   const {user} = useAuthContext();
   const {teamId} = useParams();
   const { notifyError, notifySuccess } = useToast();
   const [dbData, setDbData] = useState([]);
   const [members, setMembers] = useState([]);
  
            // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const leadsPerPage = 25;
  
    // Search State
    const [searchName, setSearchName] = useState("");
    const [searchStatus, setSearchStatus] = useState("");
  
    // Modal State
    const [selectedLead, setSelectedLead] = useState(null);
    const [editedRemark, setEditedRemark] = useState("");
  
          useEffect(() => {
              const fetchLeads = async () => {
                try {
                  const response = await msmartAxios.get(`/api/msmart/manager/get/leads/${teamId}`, {headers: {
                    accessToken: user.token
                  }});
                  setDbData(response.data.leads);
                  setMembers(response.data.members);
                } catch (err) {
                  notifyError("Unable to fetch leads.");        
                  console.log(err);
                }
              };
              fetchLeads();
          }, [user, teamId]);
  
          // Function to find nameInTeam from members list
    const getNameInTeam = (username) => {
      const member = members.find((m) => m.username === username);
      return member ? member.nameInTeam : "-";
    };
  
    // Handle Edit Remark
    const handleEditRemark = (lead) => {
      setSelectedLead(lead);
    };
  
    const saveEditedRemark = () => {
      const data = {remark: selectedLead.remark, updatedRemark: editedRemark, remarkDate: `${new Date(Date.now()).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}`};
      msmartAxios.put(`/api/msmart/manager/edit/remark/${teamId}/${selectedLead.id}`, data, {headers: {
        accessToken: user.token
      }}).then((response) => {
        if(response.data.succ){
          notifySuccess(response.data.succ);
          const delay = () => {
          window.location.reload();
          };
          setTimeout(delay, 500);
        }
      }).catch((err) => {
        notifyError(err.response.data.err);
      });
    };
  
    // Filter data based on search
    const filteredData = dbData.filter(
      (lead) =>
        getNameInTeam(lead.username).toLowerCase().includes(searchName.toLowerCase()) &&
        lead.status.toLowerCase().includes(searchStatus.toLowerCase())
    );
  
    // Pagination Logic
    const indexOfLastLead = currentPage * leadsPerPage;
    const indexOfFirstLead = indexOfLastLead - leadsPerPage;
    const currentLeads = filteredData.slice(indexOfFirstLead, indexOfLastLead);
  
  
  
    return (

          <div>
                            <div className="container mt-4">
                        <div className="row justify-content-center text-center">
                          <div className="col-lg-12">
                          <h1 className="mt-4 header-title">M-SMART</h1>
                          </div>
                          </div>
                  
    <div className="row justify-content-center">
              <div className="col-md-6">
              <nav class="nav nav-pills nav-justified my-4" style={{backgroundColor: "#e9ecef", borderRadius: "10px"}}>
              <Link class="nav-link active" href="#">Team</Link>
              <Link class="nav-link" to={`/msmart/manager/database/${teamId}`}>Personal</Link>
            </nav>
              </div>

            </div>
            
    
    <div class="card text-center mt-4">
    
      <div class="card-header text-start">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/summary/${teamId}`}>Summary</Link>
           </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/manage/${teamId}`}>Manage</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/activity/${teamId}`}>Activities</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/followup/${teamId}`}>Follow Up</Link>
          </li>
          <li class="nav-item">
          <Link class="nav-link active" aria-current="true" href="#">Leads</Link>
          </li>
        </ul>
          
      </div>
                    
                    <div class="card-body">
                  
        {/* Search Filters */}
        <div className="row my-3 mb-5 g-3">
          {/* Search by Team Member */}
          <div className="col-md-6">
            <div className="form-floating">
              <input
                type="text"
                id="searchName"
                className="form-control"
                placeholder="Search by Team Member"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <label htmlFor="searchName" style={{color: 'grey'}}>Search by Team Member</label>
            </div>
          </div>

          {/* Search by Status */}
          <div className="col-md-6">
            <div className="form-floating">
              <select
                id="searchStatus"
                className="form-select"
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="No Status">No Status</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Rejected">Rejected</option>
                <option value="Booking">Booking</option>
                <option value="Closed">Closed</option>
              </select>
              <label htmlFor="searchStatus">Search by Status</label>
            </div>
          </div>
        </div>


         <div className="table-responsive">
                  <div className="d-flex justify-content-end align-items-center mb-3">
                  <button
                    className="btn btn-sm btn-light me-2"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <i className="bi bi-caret-left"></i>
                  </button>

                  <span>Page {currentPage} of {Math.ceil(filteredData.length / leadsPerPage)}</span>

                  <button
                    className="btn btn-sm btn-light ms-2"
                    disabled={currentPage === Math.ceil(filteredData.length / leadsPerPage)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <i className="bi bi-caret-right"></i>
                  </button>
                </div>

          <table className="table table-hover table-bordered text-center">
            <thead className="bg-light">
              <tr style={{fontSize: '0.9rem'}}>
                <th>#</th>
                <th>Team Member</th>
                <th>Leads Phone Number</th>
                <th>Status</th>
                <th>Last Update</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentLeads.length > 0 ? (
                currentLeads.map((lead, index) => (
                  <tr key={lead.id} style={{fontSize: '0.9rem'}}>
                    <td >{indexOfFirstLead + index + 1}</td>
                    <td>{getNameInTeam(lead.username)}</td>
                    <td>{`${lead.country}${lead.phone}`}</td>
                    <td>{lead.status}</td>
                    <td>{new Date(lead.updatedAt).toLocaleString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}</td>
                    
                    <td>
                      <button
                        className="btn btn-sm btn-dark"
                        data-bs-toggle="modal"
                        data-bs-target="#editRemarkModal"
                        onClick={() => handleEditRemark(lead)}
                      >
                        <i class="bi bi-megaphone"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No leads found.</td>
                </tr>
              )}
            </tbody>
          </table>

         <div className="d-flex justify-content-center align-items-center mt-3">
          <button
            className="btn btn-sm btn-light me-2"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <i className="bi bi-caret-left"></i>
          </button>

          <span>Page {currentPage} of {Math.ceil(filteredData.length / leadsPerPage)}</span>

          <button
            className="btn btn-sm btn-light ms-2"
            disabled={currentPage === Math.ceil(filteredData.length / leadsPerPage)}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <i className="bi bi-caret-right"></i>
          </button>
        </div>
        
        
        </div>
   
                  
                    </div>
                  </div>
          
                  {/* Edit Remark Modal */}
                  <div className="modal fade" id="editRemarkModal" tabIndex="-1" aria-hidden="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Remark</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              
              {selectedLead ? (
                            <div className='modal-body text-start mx-2' style={{fontSize: '0.9rem'}}>
                            <p><strong>Team Member:</strong> {getNameInTeam(selectedLead.username)}</p>
                            <p><strong>Name:</strong> {selectedLead.name}</p>
                            <p><strong>Phone:</strong> {`${selectedLead.country}${selectedLead.phone}`}</p>
                            <p><strong>Status:</strong> {selectedLead.status}</p>

                            {/* Follow Up Date */}
                            <p><strong>Follow Up Date:</strong> {selectedLead.followUpDate === null ? "No Follow Up" :
                              (<>
                                {new Date(selectedLead.followUpDate).toLocaleString('en-GB', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                  hour: '2-digit', minute: '2-digit', hour12: true
                                })} 
                                <small className="text-muted"> ({formatDistanceToNow(new Date(selectedLead.followUpDate), { addSuffix: true })})</small>
                              </>)}
                            </p>

                            {/* Created At */}
                            <p><strong>Created At:</strong> {new Date(selectedLead.createdAt).toLocaleString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', hour12: true
                              })}
                              <small className="text-muted"> ({formatDistanceToNow(new Date(selectedLead.createdAt), { addSuffix: true })})</small>
                            </p>

                            {/* Last Update */}
                            <p><strong>Last Update:</strong> {new Date(selectedLead.updatedAt).toLocaleString('en-GB', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', hour12: true
                              })}
                              <small className="text-muted"> ({formatDistanceToNow(new Date(selectedLead.updatedAt), { addSuffix: true })})</small>
                            </p>
                              <p><strong>Remark:</strong></p>
                              <div className="card">
                              <div className="card-header">
                                <div className="mx-2 my-2">
                                <p style={{whiteSpace: 'pre-wrap'}}>{!selectedLead.remark ? 'No Remark' : selectedLead.remark}</p>
                                </div>
                              </div>
                              </div>
                              
  
                            <label><strong>Your Remark:</strong></label>
                            <textarea className='form-control' rows='4' value={editedRemark } onChange={(e) => setEditedRemark(e.target.value)} />
                          </div>
              ) : (
                <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
              </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  data-bs-dismiss="modal"
                  onClick={saveEditedRemark}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
          </div>
                  
                  
          
                            </div>    
                          </div>
    )
}

export default ManagerLeadList