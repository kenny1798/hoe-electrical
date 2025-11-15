import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuthContext } from '../../../../hooks/useAuthContext';
import { msmartAxios } from '../../../../api/axios';
import 'flatpickr/dist/flatpickr.min.css';
import Flatpickr from 'react-flatpickr';
import { useToast } from '../../../../context/ToastContext';

function SuperTeamFollowUp() {
    const { user } = useAuthContext();
    const { teamId } = useParams();
    const { notifyError, notifySuccess } = useToast();

    const [success, setSuccess] = useState("");
    const [team, setTeam] = useState([]);
    const [lead, setLead] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Jumlah baris per halaman

    const [searchKeyword, setSearchKeyword] = useState("");
    const [filteredLead, setFilteredLead] = useState([]);

    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const formattedDate = today.toISOString().split('T')[0];
    const [filterDateRange, setFilterDateRange] = useState({
        startDate: formattedDate,
        endDate: formattedDate,
      });

    const [editedRemark, setEditedRemark] = useState("");


    useEffect(() => {
        if (filterDateRange.startDate && filterDateRange.endDate) {
            fetchData(filterDateRange.startDate, filterDateRange.endDate);
        }
    }, [filterDateRange]);

    useEffect(() => {
      const userMap = {};
      team.forEach(member => {
        userMap[member.username] = member.nameInTeam;
      });
    
      const filtered = lead.filter(item => {
        const memberName = userMap[item.username]?.toLowerCase() || "";
        return memberName.includes(searchKeyword.toLowerCase());
      });
    
      setFilteredLead(filtered);
      setCurrentPage(1);
    }, [searchKeyword, lead, team]);
    

    const fetchData = async (startDate, endDate) => {
        setLoading(true);
        const data = { startDate, endDate };
        try {
            const response = await msmartAxios.post(`/api/msmart/supermanager/get/followup/${teamId}`, data, {
                headers: { accessToken: user.token },
            });
            setLead(response.data.lead);
            setTeam(response.data.team);
        } catch (err) {
            notifyError("Unable to fetch follow up.");
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (selectedDates) => {
        if (selectedDates.length === 2) {
          const start = selectedDates[0];
          const end = selectedDates[1];
    
          const formattedStartDate = `${start.getFullYear()}-${String(
            start.getMonth() + 1
          ).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
    
          const formattedEndDate = `${end.getFullYear()}-${String(
            end.getMonth() + 1
          ).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
    
          setFilterDateRange({ startDate: formattedStartDate, endDate: formattedEndDate });
    
          // Call fetch function with date range
          fetchData(formattedStartDate, formattedEndDate);
        }
      };

    // Pagination calculations
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredLead.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredLead.length / rowsPerPage);

    const changePage = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const getNameInTeam = (username) => {
        const member = team.find((m) => m.username === username);
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
        msmartAxios.put(`/api/msmart/supermanager/edit/remark/${teamId}/${selectedLead.id}`, data, {headers: {
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
          console.log(err);
          notifyError("Unable to update remark");
        });
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
                    <Link class="nav-link active" aria-current="true" href="#">Follow Up</Link>
                    </li>
                    <li class="nav-item">
                    <Link className="nav-link" to={`/msmart/team/admin/leads/${teamId}`}>Leads</Link>
                    </li>
                  </ul>
                </div>
                
                <div class="card-body">
                <div>
                <div className="row my-3 g-3">

                  {/* Flatpickr Date Range */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <Flatpickr
                        id="filterDate"
                        className="form-control"
                        options={{ 
                          mode: "range", 
                          dateFormat: "d-m-Y" 
                        }}
                        value={
                          filterDateRange.startDate && filterDateRange.endDate
                            ? [new Date(filterDateRange.startDate), new Date(filterDateRange.endDate)]
                            : []
                        }
                        onChange={handleDateChange}
                      />
                      <label htmlFor="filterDate" style={{color: 'grey'}}>Select Date</label>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="col-md-6">
                    <div className="form-floating">
                      <input
                        type="text"
                        id="searchKeyword"
                        className="form-control"
                        placeholder="Search by Member's Name"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                      <label htmlFor="searchKeyword" style={{color: 'grey'}}>Search by Member's Name</label>
                    </div>
                  </div>


                </div>
                </div>

                        {loading ? (
                            <div className="text-center my-4">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className='table-responsive' style={{fontSize: '0.9rem'}}>
                                <div className="d-flex justify-content-end align-items-center p-3">
                                    <button
                                        className="btn btn-sm btn-light me-2"
                                        onClick={() => changePage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i class="bi bi-caret-left"></i>
                                    </button>
                                    <span>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        className="btn btn-sm btn-light ms-2"
                                        onClick={() => changePage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <i class="bi bi-caret-right"></i>
                                    </button>
                                </div>
                                    <table className="table table-bordered table-hover">
                                        <thead className='bg-light'>
                                            <tr>
                                                <th scope="col">#</th>
                                                <th scope="col">Member</th>
                                                <th scope="col">Time</th>
                                                <th scope="col">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentRows.length === 0 && <tr><td colSpan={4}>No Follow Up found.</td></tr>}
                                            {currentRows.map((item, index) => {
                                                const name = team.find(val => val.username === item.username);
                                                const followUpDate = new Date(item.followUpDate).toLocaleString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                  });
                                                return (
                                                    <tr key={item.id}>
                                                        <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                                                        <td>{name?.nameInTeam || "Unknown"}</td>
                                                        <td>{followUpDate}</td>
                                                        <td>
                                                            <button type="button" className="btn btn-sm btn-dark" onClick={() => handleEditRemark(item)} data-bs-toggle="modal" data-bs-target="#leadDetail">
                                                                <i className="bi bi-list"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="d-flex justify-content-center align-items-center p-3">
                                    <button
                                        className="btn btn-sm btn-light me-2"
                                        onClick={() => changePage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <i className="bi bi-caret-left"></i>
                                    </button>
                                    <span>Page {currentPage} of {totalPages}</span>
                                    <button
                                        className="btn btn-sm btn-light ms-2"
                                        onClick={() => changePage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <i className="bi bi-caret-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
          
              
                </div>
              </div>
      
              <div className="modal fade" id="leadDetail" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Lead Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            
            {selectedLead ? (
                          <div className='modal-body text-start mx-2'>
                          <p><strong>Team Member:</strong> {getNameInTeam(selectedLead.username)}</p>
                          <p><strong>Name:</strong> {selectedLead.name}</p>
                          <p><strong>Phone:</strong> {`${selectedLead.country}${selectedLead.phone}`}</p>
                          <p><strong>Status:</strong> {selectedLead.status}</p>
                          <p><strong>Created At:</strong> {new Date(selectedLead.createdAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}</p>
                          <p><strong>Last Update:</strong> {new Date(selectedLead.updatedAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}</p>
                            <p><strong>Follow Up Date:</strong> {new Date(selectedLead.followUpDate).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}</p>
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

    );
}

export default SuperTeamFollowUp;
