import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios, { msmartAxios } from "../../../api/axios";
import { useAuthContext } from "../../../hooks/useAuthContext";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css"; // Import Flatpickr theme
import { useToast } from '../../../context/ToastContext';

function TeamActivity() {
  const { user } = useAuthContext();
  const { teamId } = useParams();
  const { notifyError } = useToast();

  const [activityData, setActivityData] = useState([]);
  const [filteredActivityData, setFilteredActivityData] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false); // State for loading
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25; // Number of rows per page
  const [modalData, setModalData] = useState([]); // State for modal data
  const [modalTitle, setModalTitle] = useState(""); // State for modal title
  const [showModal, setShowModal] = useState(false); // State for modal visibility


  // Format today's date
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedDate = `${year}-${month}-${day}`;
  const [dateRange, setDateRange] = useState({ startDate: formattedDate, endDate: formattedDate });


  // Fetch data from backend
useEffect(() => {
    const fetchActivityData = async () => {
      if (!dateRange.startDate || !dateRange.endDate) return;

      setLoading(true);
      try {
        const response = await msmartAxios.post(
          `/api/msmart/manager/get/activity/${teamId}`,
          { startDate: dateRange.startDate, endDate: dateRange.endDate },
          {
            headers: { accessToken: user.token },
          }
        );

        // Kira total points dan susun data berdasarkan total points (descending)
        const dataWithRank = response.data
          .map((item) => ({
            ...item,
            totalPoints:
              item.totalClosed * 3 +
              item.totalBooking * 1.5 +
              item.totalCreated * 1 +
              item.totalFollowUp * 1 +
              item.totalRejected * 0.25,
          }))
          .sort((a, b) => b.totalPoints - a.totalPoints)
          .map((item, index) => ({
            ...item,
            rank: index + 1,
          }));

        setActivityData(dataWithRank);
        setFilteredActivityData(dataWithRank);
      } catch (err) {
        notifyError("Failed to fetch activity data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [dateRange, teamId, user.token]);

  // Filter data by search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredActivityData(activityData);
    } else {
      setFilteredActivityData(
        activityData.filter((data) =>
          data.nameInTeam.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    setCurrentPage(1); // Reset to first page after filtering
  }, [searchQuery, activityData]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredActivityData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredActivityData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Medal Icons
  const getMedal = (rank, totalPoints) => {
    if (totalPoints === 0) return ""; // No medal if total points are 0
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return "";
  };

  const handleViewDetails = (data, category, name) => {
    setModalData(data);
    setModalTitle(`${name} - ${category}`);
    setShowModal(true);
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

      setDateRange({ startDate: formattedStartDate, endDate: formattedEndDate });
    }
  };



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
          <Link class="nav-link active" aria-current="true" href="#">Activities</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/followup/${teamId}`}>Follow Up</Link>
          </li>
          <li class="nav-item">
          <Link className="nav-link" to={`/msmart/team/leads/${teamId}`}>Leads</Link>
          </li>
        </ul>
          
      </div>
          
          <div class="card-body">
    
              <div className="row my-3 g-3">
                {/* Select Date (Flatpickr) */}
                <div className="col-md-6">
                  <div className="form-floating">
                    <Flatpickr
                      id="filterDate"
                      className="form-control"
                      placeholder="Select Date"
                      options={{
                        mode: "range",
                        dateFormat: "d-m-Y",
                      }}
                      value={
                        dateRange.startDate && dateRange.endDate
                          ? [new Date(dateRange.startDate), new Date(dateRange.endDate)]
                          : []
                      }
                      onChange={handleDateChange}
                    />
                    <label htmlFor="filterDate" style={{color: 'grey'}}>Select Date</label>
                  </div>
                </div>

                {/* Search by Name */}
                <div className="col-md-6">
                  <div className="form-floating">
                    <input
                      type="text"
                      id="searchQuery"
                      className="form-control"
                      placeholder="Enter name"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <label htmlFor="searchQuery" style={{color: 'grey'}}>Search by Name</label>
                  </div>
                </div>
              </div>


                {loading ? (
                  <div className="d-flex justify-content-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <div className="table-responsive">
                <div className="d-flex justify-content-end align-items-center mt-3">
                      <button
                        className="btn btn-light me-2"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <i class="bi bi-caret-left"></i>
                      </button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="btn btn-light ms-2"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <i class="bi bi-caret-right"></i>
                      </button>
                    </div>

                    <table className="table table-bordered text-center mt-3" style={{fontSize:"0.9rem"}}>
                      <thead className="bg-light">
                        <tr>
                          <th>Rank</th>
                          <th className="text-start">Name</th>
                          <th>Added Database</th>
                          <th>Closed</th>
                          <th>Booked</th>
                          <th>Rejected</th>
                          <th>Follow Up</th>
                        </tr>
                      </thead>
                      <tbody>
                      {currentItems.map((data) => (
                <tr key={data.username}>
                  <td style={{fontSize: '0.9rem'}}>
                    {getMedal(data.rank, data.totalPoints)} {data.rank}
                  </td>
                  <td className="text-start" style={{fontSize: '0.9rem'}}>{data.nameInTeam}</td>
                  <td style={{fontSize: '0.9rem'}}>
  {data.totalCreated}{" "}
  <button
    className="btn btn-light btn-sm"
    onClick={() =>
      handleViewDetails(data.createdLeads, "Added Database", data.nameInTeam)
    }
  >
    <i class="bi bi-eye"></i>
  </button>
</td>
<td style={{fontSize: '0.9rem'}}>
  {data.totalClosed}{" "}
  <button
    className="btn btn-light btn-sm"
    onClick={() =>
      handleViewDetails(data.closedLeads, "Closed Leads", data.nameInTeam)
    }
  >
    <i class="bi bi-eye"></i>
  </button>
</td>
<td style={{fontSize: '0.9rem'}}>
  {data.totalBooking}{" "}
  <button
    className="btn btn-light btn-sm"
    onClick={() =>
      handleViewDetails(data.bookingLeads, "Booked Leads", data.nameInTeam)
    }
  >
    <i class="bi bi-eye"></i>
  </button>
</td>
<td style={{fontSize: '0.9rem'}}>
  {data.totalRejected}{" "}
  <button
    className="btn btn-light btn-sm"
    onClick={() =>
      handleViewDetails(data.rejectedLeads, "Rejected Leads", data.nameInTeam)
    }
  >
    <i class="bi bi-eye"></i>
  </button>
</td>
<td style={{fontSize: '0.9rem'}}>
  {data.totalFollowUp}{" "}
  <button
    className="btn btn-light btn-sm"
    onClick={() =>
      handleViewDetails(data.followUpLeads, "Follow Up Leads", data.nameInTeam)
    }
  >
    <i class="bi bi-eye"></i>
  </button>
</td>

                </tr>
              ))}
                      </tbody>
                    </table>

                    <div className="d-flex justify-content-center align-items-center mt-3">
                      <button
                        className="btn btn-light me-2"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        <i class="bi bi-caret-left"></i>
                      </button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        className="btn btn-light ms-2"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        <i class="bi bi-caret-right"></i>
                      </button>
                    </div>

                  </div>
                )}

         
        
          </div>
        </div>


        {showModal && (
  <>
    {/* Backdrop (Overlay) */}
    <div className="modal-backdrop fade show"></div>

    {/* Modal Window */}
    <div className="modal fade show" tabIndex="-1" style={{ display: "block" }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{modalTitle}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowModal(false)}
            ></button>
          </div>
          <div className="modal-body">
            {modalData.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover table-bordered text-center">
                  <thead className="bg-light">
                    <tr>
                      <th>#</th>
                      <th className="text-start">Name</th>
                      <th className="text-start">Phone</th>
                      <th>Status</th>
                      <th>Activity Datetime</th>
                      <th>Last Update Lead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.map((item, index) => (
                      <tr key={index}>
                        <td style={{fontSize: '0.9rem'}}>{index + 1}</td>
                        <td className="text-start" style={{fontSize: '0.9rem'}}>{item.name}</td>
                        <td className="text-start" style={{fontSize: '0.9rem'}}>{item.country}{item.phone}</td>
                        <td style={{fontSize: '0.9rem'}}>{item.status || "N/A"}</td>
                        <td style={{fontSize: '0.9rem'}}>{new Date(item.createdAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}</td>
                            <td style={{fontSize: '0.9rem'}}>{new Date(item.updatedAt).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No data available.</p>
            )}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}
        

                  </div>    
                </div>
  );
}

export default TeamActivity;
