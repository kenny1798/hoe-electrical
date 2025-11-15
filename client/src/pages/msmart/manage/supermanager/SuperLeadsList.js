import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios, { msmartAxios } from '../../../../api/axios';
import { useAuthContext } from '../../../../hooks/useAuthContext';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '../../../../context/ToastContext';
import ExcelJS from 'exceljs';

function SuperLeadsList() {

  const { user } = useAuthContext();
  const { teamId } = useParams();
  const { notifySuccess, notifyError } = useToast();
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
        const response = await msmartAxios.get(`/api/msmart/supermanager/get/leads/${teamId}`, {
          headers: {
            accessToken: user.token
          }
        });
        setDbData(response.data.leads);
        setMembers(response.data.members);
      } catch (err) {
        notifyError("Unable to fetch leads.");
        console.log(err);
      }
    };
    fetchLeads();
  }, [user, teamId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, searchStatus]);

  const getNameInTeam = (username) => {
    const member = members.find((m) => m.username === username);
    return member ? member.nameInTeam : "-";
  };

  const handleEditRemark = (lead) => {
    setSelectedLead(lead);
  };

  const saveEditedRemark = () => {
    const data = {
      remark: selectedLead.remark,
      updatedRemark: editedRemark,
      remarkDate: `${new Date(Date.now()).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
      })}`
    };

    msmartAxios.put(`/api/msmart/supermanager/edit/remark/${teamId}/${selectedLead.id}`, data, {
      headers: {
        accessToken: user.token
      }
    }).then((response) => {
      if (response.data.succ) {
        notifySuccess("Remark updated successfully");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }).catch((err) => {
      console.log(err);
      notifyError("Unable to update remark");
    });
  };

  const filteredData = dbData.filter(
    (lead) =>
      getNameInTeam(lead.username).toLowerCase().includes(searchName.toLowerCase()) &&
      lead.status.toLowerCase().includes(searchStatus.toLowerCase())
  );

  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredData.slice(indexOfFirstLead, indexOfLastLead);

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Leads');
  
    worksheet.columns = [
      { header: 'Team Member', key: 'teamMember', width: 25 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Remark', key: 'remark', width: 30 },
      { header: 'Created At', key: 'createdAt', width: 25 },
      { header: 'Last Update', key: 'updatedAt', width: 25 },
    ];
    
  
    filteredData.forEach((lead) => {
      worksheet.addRow({
        teamMember: getNameInTeam(lead.username),
        name: lead.name,
        phone: `${lead.country}${lead.phone}`,
        status: lead.status,
        remark: lead.remark || '-',
        createdAt: new Date(lead.createdAt).toLocaleString('en-GB'),
        updatedAt: new Date(lead.updatedAt).toLocaleString('en-GB'),
      });      
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Leads_Export.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };



  return (
        <div>
                                <div className="container mt-4">
                            <div className="row justify-content-center text-center">
                              <div className="col-lg-12">
                              <h1 className="mt-4 header-title">M-SMART</h1>
                              </div>
                              </div>
                      
                      <div class="card text-center mt-4">
                  
                        
                      
                        <div class="card-header text-start">
                          <ul class="nav nav-tabs card-header-tabs">
                            <li class="nav-item">
                            <Link className="nav-link" to={`/msmart/team/admin/summary/${teamId}`}>Summary</Link>
                            </li>
                            <li class="nav-item">
                            <Link className="nav-link" to={`/msmart/team/admin/manager/${teamId}`}>Manage</Link>
                            </li>
                            <li class="nav-item">
                            <Link className="nav-link" to={`/msmart/team/admin/activity/${teamId}`}>Activities</Link>
                            </li>
                            <li class="nav-item">
                            <Link className="nav-link" to={`/msmart/team/admin/followup/${teamId}`}>Follow Up</Link>
                            </li>
                            <li class="nav-item">
                            <Link class="nav-link active" aria-current="true" href="#">Leads</Link>
                            </li>
                          </ul>
                        </div>
                        
                        <div class="card-body">

                    <div className="row my-3 g-3">
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

                    <div className="text-end">
                      <button className="btn btn-outline-dark btn-sm " onClick={exportToExcel}>
                      <i className="bi bi-download"></i> Export current list to Excel
                    </button>
                    </div>



                      
                        {/* Table */}
        <div className="table-responsive mt-3" style={{fontSize: '0.9rem'}}>
        <nav className="mt-3">
        <ul className="pagination justify-content-end">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
          </li>
          <li className="page-item">
            <span className="page-link">{currentPage}</span>
          </li>
          <li className={`page-item ${indexOfLastLead >= filteredData.length ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>
        <table className="table table-hover table-bordered text-center">
          <thead className="bg-light">
            <tr>
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
                <tr key={lead.id}>
                  <td>{indexOfFirstLead + index + 1}</td>
                  <td>{getNameInTeam(lead.username)}</td>
                  <td>{`${lead.country}${lead.phone.slice(0, -2) + '**'}`}</td>
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
      </div>

      <nav className="mt-3">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
          </li>
          <li className="page-item">
            <span className="page-link">{currentPage}</span>
          </li>
          <li className={`page-item ${indexOfLastLead >= filteredData.length ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
          </li>
        </ul>
      </nav>

                      
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
                          <div className='modal-body text-start mx-2'>
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

export default SuperLeadsList