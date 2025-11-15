import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../../hooks/useAuthContext';
import axios, { msmartAxios } from '../../../api/axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import 'flatpickr/dist/flatpickr.min.css';
import Flatpickr from 'react-flatpickr';
import { NumericFormat } from 'react-number-format';
import { useToast } from '../../../context/ToastContext';

function ManagerFollowUp() {

    const {user} = useAuthContext();
      const {teamId} = useParams();
      const { notifyError, notifySuccess } = useToast();

      const [lead, setLead] = useState([]);
      const [view, setView] = useState(null);
      const [loading, setLoading] = useState(false); // Untuk loading state
      const [currentPage, setCurrentPage] = useState(1); // Halaman semasa
      const rowsPerPage = 10; // Jumlah baris per halaman
      const [editedStatus, setEditedStatus] = useState("");
      const [editedRemark, setEditedRemark] = useState("");
      const [edittedFuDate, setEditedFuDate] = useState(null);
      const [editClosedAmount, setEditClosedAmount] = useState('');
      const [searchName, setSearchName] = useState("");
    
      const today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        const todayStr = today.toISOString().split('T')[0];
        const [filterDate, setFilterDate] = useState({
        startDate: todayStr,
        endDate: todayStr
        });
      const [selectedLead, setSelectedLead] = useState(null);
    
      const statusOption = [{value: 'No Status', Label: 'No Status'},
        {value: 'Closed', Label: 'Closed'},
        {value: 'Booking', Label: 'Booking'},
        {value: 'Rejected', Label: 'Rejected'},
        {value: 'Follow Up', Label: 'Follow Up'} ]

        const filteredLeads = lead.filter((item) =>
          item.name.toLowerCase().includes(searchName.toLowerCase())
        );
    
      useEffect(() => {
          setLoading(true);
          msmartAxios.get('/api/msmart/get/user/team', {
              headers: {
                  accessToken: user.token
              }
          }).then((response) => {
              if (response.status === 201){
                  setView(response.data.teamId == teamId);
              } else {
                  setView(false);
              }
          }).catch(() => {
              notifyError("Error fetching data");
          }).finally(() => setLoading(false));
      }, [user.token, teamId]);
    
      useEffect(() => {
        if (filterDate.startDate && filterDate.endDate) {
          fetchData(filterDate.startDate, filterDate.endDate);
        }
      }, [filterDate]);
      
      
    
      const fetchData = async (startDate, endDate) => {
          setLoading(true);
          const data = { startDate, endDate };
          try {
              const response = await msmartAxios.post(`/api/msmart/get/followup/${teamId}`, data, {
                  headers: {
                      accessToken: user.token
                  }
              });
              setLead(response.data);
          } catch {
            notifyError("Unable to fetch follow up.");
          } finally {
              setLoading(false);
          }
      };

      const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };
    
      const handleDateChange = (selectedDates) => {
        if (selectedDates.length === 2) {
          const start = selectedDates[0];
          const end = selectedDates[1];
      
          const formattedStart = formatLocalDate(start);
          const formattedEnd = formatLocalDate(end);
      
          setFilterDate({
            startDate: formattedStart,
            endDate: formattedEnd
          });
      
          fetchData(formattedStart, formattedEnd);
          console.log(formattedStart, formattedEnd);
        }
      };
      
    
      const handleEditedFollowUp = (selectedDates) => {
        const date = selectedDates[0];
      
        if (!date) {
          setEditedFuDate('');
          return;
        }
      
        const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      
        setEditedFuDate(formatted);
        setEditedStatus("Follow Up"); // ready untuk hantar ke backend
      };
      
    
      const handleLeadClick = (leadId) => {
          const foundLead = lead.find(item => item.id === leadId);
          console.log(foundLead)
          setEditedStatus(foundLead.status)
          setEditedRemark(foundLead.remark)
          setSelectedLead(foundLead);
          setEditClosedAmount(foundLead.salesAmount);
      };
    
      const handleSubmit = (id) => {

        if(editedStatus === "Follow Up" && !edittedFuDate){
          notifyError("Error: No Next Follow Up Date, please select other status than 'Follow Up'");
        }else if(editedStatus === "No Status" && edittedFuDate){
          notifyError("Follow Up Date detected. Please select status other than 'No Status'");
        }
        else{
          const data = {editedRemark: editedRemark, editedStatus: editedStatus, edittedFuDate: edittedFuDate, editClosedAmount: editClosedAmount}
    
        msmartAxios.put(`/api/msmart/edit/followup/${teamId}/${id}`, data, {
          headers: {
            accessToken: user.token
          }
        }).then((response) => {
            const closeModal = document.getElementById("closemodal");
            closeModal.click();
          if (response.status === 201){
            notifySuccess(response.data.succ);
            setEditedStatus("");
            setEditedRemark("");
            setEditedFuDate(null);
            const delay = async () => {
              await fetchData(filterDate.startDate || filterDate, filterDate.endDate);
            }
    
            setTimeout(() => {
                fetchData(filterDate.startDate || filterDate, filterDate.endDate);
                const closeModal = document.getElementById("closemodal");
                closeModal.click();
              }, 1000);              
          } else {
            notifyError(response.data.error);
          }
        }).catch((err) => {
          notifyError("Error updating lead");
        })
        }

        
      }
    
    
      // Pagination calculations
      const indexOfLastRow = currentPage * rowsPerPage;
      const indexOfFirstRow = indexOfLastRow - rowsPerPage;
      const currentRows = filteredLeads.slice(indexOfFirstRow, indexOfLastRow);
      const totalPages = Math.ceil(filteredLeads.length / rowsPerPage);

    
      const changePage = (newPage) => {
          if (newPage > 0 && newPage <= totalPages) {
              setCurrentPage(newPage);
          }
      };
    
      const setDefault = () => {
        setEditedStatus("");
        setEditedRemark("");
        setEditedFuDate(null)
      }
    
      
    
    
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
                                  <Link class="nav-link" to={`/msmart/team/summary/${teamId}`}>Team</Link>
                                  <Link class="nav-link active" href="#">Personal</Link>
                                </nav>
                                  </div>

                                </div>       
                          
                          <div class="card text-center mt-4">
                          
                            <div class="card-header text-start">
                              <ul class="nav nav-tabs card-header-tabs">
                                <li class="nav-item">
                                <Link className="nav-link" to={`/msmart/manager/database/${teamId}`}>Database</Link>
                                </li>
                                <li class="nav-item">
                                <Link class="nav-link active" aria-current="true" href="#">Follow Up</Link>
                                </li>
                                <li class="nav-item">
                                <Link className="nav-link" to={`/msmart/manager/summary/${teamId}`}>Summary</Link>
                                </li>
                              </ul>
                                
                            </div>
            
            <div class="card-body">
          
            {view === null ? (<></>) : view === false ? (
                  <div className='row justify-content-center mt-3'>
                      <div className="col-lg-6">
                          <div className="alert alert-danger text-center" role="alert">
                              You do not have permission to access this team M-Smart page
                          </div>
                      </div>
                  </div>
              ) : (
                  <>
                      <div className='row justify-content-center mt-3'>
                          <div className=' text-center'>
                              <div className='container'>
    
                                  <div className="row mb-4">
                                  <div className="col-lg-4"></div>

                                  <div className="col-lg-4 text-start">
                                      <div className="form-floating">
                                        <Flatpickr
                                          id="floatingDate"
                                          className="form-control my-2"
                                          placeholder="Select date"
                                          value={
                                            filterDate.startDate && filterDate.endDate
                                              ? [new Date(filterDate.startDate), new Date(filterDate.endDate)]
                                              : []
                                          }
                                          options={{ mode: "range", dateFormat: "d-m-Y" }}
                                          onChange={handleDateChange}
                                        />
                                        <label htmlFor="floatingDate">Select Date</label>
                                      </div>
                                      </div>

                                  <div className="col-lg-4">
                                  <div className="form-floating">
                                  <input
                                    type="text"
                                    className="form-control my-2"
                                    id="floatingSearch"
                                    placeholder="Search by name"
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                  />
                                  <label htmlFor="floatingSearch" style={{ color: "grey" }}>Search by Name</label>
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
                                              <table className="table table-bordered">
                                                  <thead className='bg-light'>
                                                      <tr>
                                                          <th scope="col">#</th>
                                                          <th scope="col" className='text-start'>Name</th>
                                                          <th scope="col" className='text-start'>Phone</th>
                                                          <th scope="col">Date Time</th>
                                                          <th scope="col">Action</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody>
                                                      {currentRows.length === 0 && <tr><td colSpan={6}>No Follow Up found.</td></tr>}
    
                                                      {currentRows.map((item, index) => {
                                                          const followUpDate = new Date(item.followUpDate).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true
                                                          });
    
                                                          return (
                                                              <tr key={item.id}>
                                                                  <td>{index + 1 + (currentPage - 1) * rowsPerPage}</td>
                                                                  <td className='text-start'>{item.name}</td>
                                                                  <td className='text-start'>{item.country}{item.phone}</td>
                                                                  <td>{followUpDate}</td>
                                                                  <td>
                                                                      <div className='d-flex gap-2 justify-content-center'>
                                                                          <a className='btn btn-sm btn-primary' href={`tel:${item.country}${item.phone}`}><i className="bi bi-telephone-forward"></i></a>
                                                                          <a className='btn btn-sm btn-success' href={`https://wa.me/${item.country}${item.phone}`}><i className="bi bi-whatsapp"></i></a>
                                                                          <button type="button" className="btn btn-sm btn-dark" onClick={() => { handleLeadClick(item.id) }} data-bs-toggle="modal" data-bs-target="#leadDetail">
                                                                          <i class="bi bi-check-lg"></i>
                                                                      </button>
                                                                      </div>
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
                                                  <i class="bi bi-caret-left"></i>
                                              </button>
                                              <span>Page {currentPage} of {totalPages}</span>
                                              <button
                                                  className="btn btn-sm btn-light ms-2"
                                                  onClick={() => changePage(currentPage + 1)}
                                                  disabled={currentPage === totalPages}
                                              >
                                                  <i class="bi bi-caret-right"></i>
                                              </button>
                                          </div>
                                        </div>
                                      
                                  )}
                              </div>
                          </div>
                      </div>
    
                      <div className="modal fade" id="leadDetail" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
                        <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content">
                            <div className="modal-header">
                              <h5 className="modal-title" id="exampleModalLabel">Database Details</h5>
                              <button type="button" id='closemodal' className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={setDefault}></button>
                            </div>
                            <div>
                              {selectedLead ? (
                                <>
                                  <div className="modal-body text-start mx-3" style={{ wordWrap: "break-word" }}>
                                    <p><strong>Name:</strong> {selectedLead.name}</p>
                                    <p><strong>Phone:</strong> {selectedLead.country}{selectedLead.phone}</p>
                                    <p><strong>Created At:</strong> {new Date(selectedLead.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                    <p><strong>Last Update:</strong> {new Date(selectedLead.updatedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>

                                    {/* Status - Floating */}
                                    <div className="form-floating mb-3">
                                      <select
                                        id="editStatus"
                                        value={editedStatus}
                                        onChange={(e) => setEditedStatus(e.target.value)}
                                        className="form-select"
                                      >
                                        <option value={editedStatus}>{editedStatus}</option>
                                        {statusOption.map((item) =>
                                          item.value !== editedStatus && (
                                            <option key={item.value} value={item.value}>
                                              {item.Label}
                                            </option>
                                          )
                                        )}
                                      </select>
                                      <label htmlFor="editStatus">Status</label>
                                    </div>

                                    {/* Closed Amount */}
                                    {editedStatus === 'Closed' && (
                                      <div className="form-floating mb-3">
                                        <NumericFormat
                                          id="closeValue"
                                          className="form-control"
                                          value={editClosedAmount}
                                          thousandSeparator
                                          prefix="RM "
                                          allowNegative={false}
                                          decimalScale={2}
                                          fixedDecimalScale
                                          onValueChange={(values) => {
                                            setEditClosedAmount(values.value);
                                          }}
                                          placeholder="RM 0.00"
                                        />
                                        <label htmlFor="closeValue" style={{ color: "gray" }}>Close Value</label>
                                      </div>
                                    )}

                                    {/* Remark - Floating */}
                                    <div className="form-floating mb-3">
                                      <textarea
                                        id="editRemark"
                                        className="form-control"
                                        style={{ height: '150px' }}
                                        value={editedRemark}
                                        onChange={(e) => setEditedRemark(e.target.value)}
                                      />
                                      <label htmlFor="editRemark">Remark</label>
                                    </div>

                                    {/* Next Follow Up Date */}
                                    <div className="form-floating mb-3">
                                      <input
                                        id="editFuDate"
                                        type="datetime-local"
                                        className="form-control"
                                        value={edittedFuDate || ''}
                                        min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                        onChange={(e) => setEditedFuDate(e.target.value)}
                                      />
                                      <label htmlFor="editFuDate">Next Follow Up Date</label>
                                    </div>
                                  </div>

                                  <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={setDefault}>
                                      Close
                                    </button>
                                    <button type="button" className="btn btn-primary" onClick={() => handleSubmit(selectedLead.id, selectedLead.status)}>
                                      Submit
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <p>No details available.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                  </>
              )}
                   
          
            </div>
          </div>
          
          
                    </div>    
                  </div>
      );
}


export default ManagerFollowUp