import React, { useEffect, useState } from 'react';
import { useAuthContext } from '../../hooks/useAuthContext';
import axios, { msmartAxios } from '../../api/axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import "flatpickr/dist/themes/material_green.css"; 
import Flatpickr from 'react-flatpickr';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SalesTartget from './SalesTarget';
import { useToast } from '../../context/ToastContext';


function StatSummary() {

    const {user} = useAuthContext();
      const {teamId} = useParams();
      const { notifyError } = useToast();

      const [summary, setSummary] = useState({
        totalLeadsAdded: {
          total: 0,
          countByDate: {},
        },
        totalPresentations: {
          total: 0,
          countByDate: {},
        },
        followUpScheduled: {
          total: 0,
          countByDate: {},
        },
        finalStatus: {
          Booking: {
            total: 0,
            countByDate: {},
          },
          Closed: {
            total: 0,
            countByDate: {},
          },
          Rejected: {
            total: 0,
            countByDate: {},
          },
          "Follow Up": {
            total: 0,
            countByDate: {},
          },
        },
        avgFollowUpPerLead: {
          total: 0,
        },
        followUpPerCloseRatio: {
          total: 0,
        },
        followUpToClosedRate: {
          total: 0,
          totalFollowUpLeads: 0,
          totalClosedLeads: 0,
        },
        followUpToRejectedRate: {
          total: 0,
          totalFollowUpLeads: 0,
          totalRejectedLeads: 0,
        },
        followUpToBookingRate: {
          total: 0,
          totalFollowUpLeads: 0,
          totalBookingLeads: 0,
        },
        bookingToClosedRate: {
          total: 0,
          totalBookingLeads: 0,
          totalClosedFromBooking: 0,
        },
        bookingToRejectedRate: {
          total: 0,
          totalBookingLeads: 0,
          totalRejectedFromBooking: 0,
        },
        salesGapSummary: {
            targetAmount: 0.00,
            actualSalesAmount: 0,
            salesGap: 0.00,
            percentageAchieved: 0,
          }

        
      });
      const [loading, setLoading] = useState(false);
      const [view, setView] = useState(false);
    
      const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const [filterDate, setFilterDate] = useState([new Date(), new Date()]);


    
      useEffect(() => {
          setLoading(true);
          msmartAxios.get('/api/msmart/get/user/team', {
              headers: {
                  accessToken: user.token
              }
          }).then((response) => {
              if (response.status === 201){
                  setView(response.data.teamId === teamId);
              } else {
                  setView(false);
              }
          }).catch(() => {
            notifyError("Error fetching data");
          }).finally(() => setLoading(false));
      }, [user.token, teamId]);
    
      useEffect(() => {
        if (filterDate.length === 1) {
          const start = filterDate[0];
          const end = filterDate[0];
      
          const formattedStart = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
          const formattedEnd = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
      
          fetchData({ startDate: formattedStart, endDate: formattedEnd });
        }
        if (filterDate.length === 2) {
          const start = filterDate[0];
          const end = filterDate[1];
      
          const formattedStart = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
          const formattedEnd = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
      
          fetchData({ startDate: formattedStart, endDate: formattedEnd });
        }
      }, [filterDate]);

      const exportToExcel = async (data, startDate, endDate) => {
        const workbook = new ExcelJS.Workbook();
      
        // ========= SHEET 1: SUMMARY ========= //
        const summarySheet = workbook.addWorksheet("Summary");
        summarySheet.addRow(["Indicator", "Total", "Details"]);
      
        summarySheet.addRow([
          "Total Leads Added",
          data.totalLeadsAdded.total,
          "",
        ]);
      
        summarySheet.addRow([
          "Total Presentations",
          data.totalPresentations.total,
          "",
        ]);
      
        summarySheet.addRow([
          "Follow Up Scheduled",
          data.followUpScheduled.total,
          "",
        ]);
      
        const statuses = ["Booking", "Closed", "Rejected", "Follow Up"];
        statuses.forEach((status) => {
          const stat = data.finalStatus[status] || {};
          summarySheet.addRow([
            `${status}`,
            stat.total,
            "",
          ]);
        });
      
        summarySheet.addRow(["Avg Follow Up / Lead", data.avgFollowUpPerLead.total, ""]);
        summarySheet.addRow(["Avg Follow Up / Closed Lead", data.followUpPerCloseRatio.total, ""]);
      
        summarySheet.addRow([
          "Follow Up ➝ Closed Rate",
          `${data.followUpToClosedRate.total}%`,
          `Follow Up: ${data.followUpToClosedRate.totalFollowUpLeads}, Closed: ${data.followUpToClosedRate.totalClosedLeads}`,
        ]);
      
        summarySheet.addRow([
          "Follow Up ➝ Rejected Rate",
          `${data.followUpToRejectedRate.total}%`,
          `Follow Up: ${data.followUpToRejectedRate.totalFollowUpLeads}, Rejected: ${data.followUpToRejectedRate.totalRejectedLeads}`,
        ]);
      
        summarySheet.addRow([
          "Follow Up ➝ Booking Rate",
          `${data.followUpToBookingRate.total}%`,
          `Follow Up: ${data.followUpToBookingRate.totalFollowUpLeads}, Booking: ${data.followUpToBookingRate.totalBookingLeads}`,
        ]);
      
        summarySheet.addRow([
          "Booking ➝ Closed Rate",
          `${data.bookingToClosedRate.total}%`,
          `Booking: ${data.bookingToClosedRate.totalBookingLeads}, Closed: ${data.bookingToClosedRate.totalClosedFromBooking}`,
        ]);
      
        summarySheet.addRow([
          "Booking ➝ Rejected Rate",
          `${data.bookingToRejectedRate.total}%`,
          `Booking: ${data.bookingToRejectedRate.totalBookingLeads}, Rejected: ${data.bookingToRejectedRate.totalRejectedFromBooking}`,
        ]);

        summarySheet.addRow([
          "Total Targeted Sales",
          data.salesGapSummary.targetAmount,
          "",
        ]);

        summarySheet.addRow([
          "Total Actual Sales",
          data.salesGapSummary.actualSalesAmount,
          "",
        ]);

        summarySheet.addRow([
          "Total Sales Gap",
          data.salesGapSummary.salesGap  * -1,
          "",
        ]);
      
        // ========= SHEET 2: COUNT BY DATE ========= //
        const countSheet = workbook.addWorksheet("Summary By Date");
      
        // Header
        const headerRow = ["Date", "Leads Added", "Presentation", "Follow Up", "Closed", "Rejected", "Booking", "Targeted Sales", "Actual Sales", "Sales Gap"];
        countSheet.addRow(headerRow);
      
        // Convert date range to list of dates
        const dateList = getDateRangeList(startDate, endDate);
      
        dateList.forEach((date) => {
          countSheet.addRow([
            date,
            data.totalLeadsAdded.countByDate?.[date] || 0,
            data.totalPresentations.countByDate?.[date] || 0,
            data.followUpScheduled.countByDate?.[date] || 0,
            data.finalStatus.Closed.countByDate?.[date] || 0,
            data.finalStatus.Rejected.countByDate?.[date] || 0,
            data.finalStatus.Booking.countByDate?.[date] || 0,
            data.salesGapSummary.countByDate?.[date].targetAmount || 0,
            data.salesGapSummary.countByDate?.[date].actualSalesAmount || 0,
            data.salesGapSummary.countByDate?.[date].salesGap * -1 || 0,
          ]);
        });
      
        // Save
        const buffer = await workbook.xlsx.writeBuffer();
        const username = await user.username;
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const shortStartDate = `${startDate}`.slice(4, 15).split("-").reverse().join();
        const shortEndDate = `${endDate}`.slice(4, 15).split("-").reverse().join();
        saveAs(blob, `Msmart Summary (${username}) ${shortStartDate} to ${shortEndDate}.xlsx`);
      };
      
      // Helper: Generate all dates in range
      function getDateRangeList(start, end) {
        const result = [];
        const current = new Date(start);
        const last = new Date(end);
      
        while (current <= last) {
          const formatted = current.toLocaleDateString("sv-SE"); // sv-SE = 'YYYY-MM-DD'
          result.push(formatted);
          current.setDate(current.getDate() + 1);
        }
      
        return result;
      }
      
    
      const fetchData = async ({ startDate, endDate }) => {
        setLoading(true);
        try {
          const response = await msmartAxios.post(`/api/msmart/stats/individual/${teamId}`, { startDate: startDate, endOfDate: endDate }, {
            headers: { accessToken: user.token }
          });
          setSummary(response.data);
        } catch {
          notifyError("Unable to fetch follow up.");
        } finally {
          setLoading(false);
        }
      };
      
    
      const handleDateChange = (selectedDates) => {
        if (selectedDates.length === 2) {
          setFilterDate(selectedDates); // terus simpan sebagai array
        }
      };
    
      console.log(summary)
    
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
                <Link className="nav-link" to={`/msmart/db/manage/${teamId}`}>Manage</Link>
                </li>
                <li class="nav-item">
                <Link className="nav-link" to={`/msmart/db/followup/${teamId}`}>Follow Up</Link>
                </li>
                <li class="nav-item">
                <Link class="nav-link active" aria-current="true" href="#">Summary</Link>
                </li>
              </ul>
                
            </div>
            
            <div class="card-body">
          
            {view === null ? (<></>) : view === false ? (
                  <div className="text-center my-4">
                  <div className="spinner-border text-dark" role="status">
                      <span className="visually-hidden">Loading...</span>
                  </div>
              </div>
              ) : (
                  <>
                      <div className='row justify-content-center mt-3'>
                          <div className=' text-center'>
                              <div className='container'>
                                  <div className="row justify-content-center align-items-end">
                                    <div className="col-12 col-lg-10">
                                      <div className="form-floating mb-3">
                                        <Flatpickr
                                          id="filterDate"
                                          className="form-control shadow-none"
                                          value={filterDate}
                                          placeholder="Select date range"
                                          options={{
                                            dateFormat: "d-m-Y",
                                            mode: "range",
                                            disableMobile: true,
                                          }}
                                          onChange={handleDateChange}
                                        />
                                        <label htmlFor="filterDate">Select Date Range</label>
                                      </div>
                                    </div>
                                    
                                    {summary && (
                                      <div className="col-auto">
                                        <div className="d-grid mb-3">
                                          <button
                                            data-bs-toggle="modal"
                                            data-bs-target="#setSalesTarget"
                                            className="btn btn-outline-dark"
                                          >
                                            <i className="bi bi-gear"></i> Set Targeted Sales
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>


    
                                  {loading ? (
                                      <div className="text-center my-4">
                                          <div className="spinner-border text-dark" role="status">
                                              <span className="visually-hidden">Loading...</span>
                                          </div>
                                      </div>
                                  ) : (
                                    <div className="container-fluid p-3">

                                      <div className="row my-3">
                                        <h3 style={{textTransform:"capitalize"}}>Personal Summary</h3>
                                        <small className="text-muted">{`${filterDate[0]}`.slice(4,15)} to {`${filterDate[1]}`.slice(4,15)}</small>
                                      </div>

                                    <div className="row g-3">

                                    <div className="col-12 col-md-4">
                                        <div className="card text-center p-3">
                                          <i className="bi bi-cash-coin" style={{ fontSize: "2rem", color: "green" }}></i>
                                          <h4 className="mb-0">RM {!summary ? '0.00' : Number(summary.salesGapSummary.targetAmount).toLocaleString('en-MY', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                          })}</h4>
                                          <small className="text-muted">Targeted Sales</small>
                                        </div>
                                      </div>
                              
                                      
                                      <div className="col-12 col-md-4">
                                        <div className="card text-center p-3">
                                          <i className="bi bi-cash-coin" style={{ fontSize: "2rem", color: "green"}}></i>
                                          <h4 className="mb-0">RM {!summary ? '0.00' : Number(summary.salesGapSummary.actualSalesAmount).toLocaleString('en-MY', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                          })}</h4>
                                          <small className="text-muted">Actual Sales</small>
                                        </div>
                                      </div>
                              
                                      
                                      <div className="col-12 col-md-4">
                                        <div className="card text-center p-3">
                                          {!summary ? (<></>): (<>
                                          {summary.salesGapSummary.percentageAchieved >= 95 ? (<>
                                          <i className="bi bi-cash-coin" style={{ fontSize: "2rem", color: "green"}}></i>
                                          <h4 className="mb-0" style={{color: "green"}}>RM {!summary ? '0.00' : Number(summary.salesGapSummary.salesGap * -1).toLocaleString('en-MY', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                          })}</h4>
                                          </>) : (<>
                                            <i className="bi bi-cash-coin" style={{ fontSize: "2rem", color: "red"}}></i>
                                          <h4 className="mb-0" style={{color: "red"}}>RM {!summary ? '0.00' : Number(summary.salesGapSummary.salesGap * -1).toLocaleString('en-MY', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                          })}</h4>
                                          </>)}
                                          
                                          </>)}
                                          <small className="text-muted">Sales Gap</small>
                                        </div>
                                      </div>
                                      
                                      <div className="col-12 col-md-4">
                                        <div className="card text-center p-3">
                                          <i className="bi bi-cloud-plus-fill" style={{ fontSize: "2rem" }}></i>
                                          <h4 className="mb-0">{!summary ? 0 : summary.totalLeadsAdded.total}</h4>
                                          <small className="text-muted">Database Uploaded</small>
                                        </div>
                                      </div>
                              
                                      
                                      <div className="col-12 col-md-4">
                                        <div className="card text-center p-3">
                                          <i className="bi bi-easel2-fill" style={{ fontSize: "2rem"}}></i>
                                          <h4 className="mb-0">{!summary ? 0 : summary.totalPresentations.total}</h4>
                                          <small className="text-muted">Leads Presented</small>
                                        </div>
                                      </div>
                              
                                      
                                      <div className="col-12 col-md-4">
                                        <div className="card text-center p-3">
                                          <i className="bi bi-person" style={{ fontSize: "2rem"}}></i>
                                          <h4 className="mb-0">{!summary ? 0 : summary.followUpScheduled.total}</h4>
                                          <small className="text-muted">Follow Up</small>
                                        </div>
                                      </div>

                                      <div className="col-12 col-md-4">
                                        <div className="card text-center p-3">
                                          <i className="bi bi-clipboard2-check" style={{ fontSize: "2rem", color: 'green' }}></i>
                                          <h4 className="mb-0" style={{color: 'green'}}>{!summary ? 0 : summary.finalStatus['Closed'].total}</h4>
                                          <small className="text-muted">Closed</small>
                                        </div>
                                      </div>

                                      <div className="col-12 col-md-4">
                                        <div className="card text-center p-3">
                                          <i className="bi bi-clipboard2-plus" style={{ fontSize: "2rem", color: '#a49000' }}></i>
                                          <h4 className="mb-0" style={{color: '#a49000'}}>{!summary ? 0 : summary.finalStatus['Booking'].total}</h4>
                                          <small className="text-muted">Booked</small>
                                        </div>
                                      </div>

                                      <div className="col-12 col-md-4">
                                        <div className="card text-center p-3">
                                          <i className="bi bi-clipboard2-x" style={{ fontSize: "2rem", color: 'red' }}></i>
                                          <h4 className="mb-0" style={{color: 'red'}}>{!summary ? 0 : summary.finalStatus['Rejected'].total}</h4>
                                          <small className="text-muted">Rejected</small>
                                        </div>
                                      </div>
                              
                                      {/* Statistics Chart Placeholder */}
                                      {/* <div className="col-12">
                                        <div className="card p-3">
                                          <h5>Statistics</h5>
                                          <div style={{ height: "200px", backgroundColor: "#f8d7da" }} className="d-flex justify-content-center align-items-center">
                                            <span className="text-muted">[Chart Here]</span>
                                          </div>
                                        </div>
                                      </div> */}
                              
                                      {/* Bottom 3 Panels */}
                                      <div className="col-12 col-md-12">
                                        <div className="card p-3">
                                          <h6 className="text-dark" style={{fontWeight: 'bold'}}>Follow Up</h6>
                                          <div className="d-flex justify-content-between align-items-center my-3">
                                            <span style={{fontSize: '0.9rem'}}>to Booking Rate (%)</span>
                                            <h5 className="mb-0 text-dark">{!summary ? 0 : summary.followUpToBookingRate.total}%</h5>
                                          </div>
                                          <div className="d-flex justify-content-between align-items-center my-3">
                                            <span style={{fontSize: '0.9rem'}}>to Closed Rate (%)</span>
                                            <h5 className="mb-0 text-dark">{!summary ? 0 : summary.followUpToClosedRate.total}%</h5>
                                          </div>
                                          <div className="d-flex justify-content-between align-items-center my-3">
                                            <span style={{fontSize: '0.9rem'}}>to Rejected Rate (%)</span>
                                            <h5 className="mb-0 text-dark">{!summary ? 0 : summary.followUpToRejectedRate.total}%</h5>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="col-12 col-md-6">
                                        <div className="card p-3">
                                          <h6 className="text-dark" style={{fontWeight: 'bold'}}>Average Follow Up</h6>
                                          <div className="d-flex justify-content-between align-items-center my-3">
                                            <span style={{fontSize: '0.9rem'}}>Per Lead</span>
                                            <h5 className="mb-0 text-dark">{!summary ? 0 : summary.avgFollowUpPerLead.total}</h5>
                                          </div>
                                          <div className="d-flex justify-content-between align-items-center my-3">
                                            <span style={{fontSize: '0.9rem'}}>Per Closed Lead</span>
                                            <h5 className="mb-0 text-dark">{!summary ? 0 : summary.followUpPerCloseRatio.total}</h5>
                                          </div>
                                        </div>
                                      </div>
                              
                                      <div className="col-12 col-md-6">
                                        <div className="card p-3">
                                          <h6 className="text-dark" style={{fontWeight: 'bold'}}>Booking</h6>
                                          <div className="d-flex justify-content-between align-items-center my-3">
                                            <span style={{fontSize: '0.9rem'}}>to Closed Rate (%)</span>
                                            <h5 className="mb-0 text-dark">{!summary ? 0 : summary.bookingToClosedRate.total}%</h5>
                                          </div>
                                          <div className="d-flex justify-content-between align-items-center my-3">
                                            <span style={{fontSize: '0.9rem'}}>to Rejected Rate (%)</span>
                                            <h5 className="mb-0 text-dark">{!summary ? 0 : summary.bookingToRejectedRate.total}%</h5>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="col-12 col-md-12">
                                        <div className="card p-3">
                                          <h6 className="text-dark" style={{fontWeight: 'bold'}}>Summary by Date</h6>
                                          <div className="table-responsive mt-4" style={{fontSize: '0.8rem', whiteSpace: 'nowrap', maxHeight: '300px', overflow: 'auto'}}>
                                            <table className="table table-bordered table-hover table-sm">
                                              <thead className="table-light">
                                                <tr>
                                                  <th>Date</th>
                                                  <th>Leads Added</th>
                                                  <th>Presentation</th>
                                                  <th>Follow Up</th>
                                                  <th>Closed</th>
                                                  <th>Rejected</th>
                                                  <th>Booking</th>
                                                  <th>Targeted Sales</th>
                                                  <th>Actual Sales</th>
                                                  <th>Sales Gap</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {getDateRangeList(filterDate[0], filterDate[1]).map((date) => {
                                                  const dateStr = new Date(date).toISOString().split("T")[0];
                                                  if(loading === true){
                                                    return ;
                                                  }else {
                                                    const targetAmount = summary.salesGapSummary.countByDate?.[dateStr]?.targetAmount || 0;
                                                    const actualSales = summary.salesGapSummary.countByDate?.[dateStr]?.actualSalesAmount || 0;
                                                    const salesGap = summary.salesGapSummary.countByDate?.[dateStr]?.salesGap *-1 || 0;
                                                  
                                                    return (
                                                      <tr key={dateStr}>
                                                        <td>{dateStr}</td>
                                                        <td style={{ color: summary.totalLeadsAdded.countByDate?.[dateStr] ? '' : 'red' }}>
                                                          {summary.totalLeadsAdded.countByDate?.[dateStr] || 0}
                                                        </td>
                                                        <td style={{ color: summary.totalPresentations.countByDate?.[dateStr] ? '' : 'red' }}>
                                                          {summary.totalPresentations.countByDate?.[dateStr] || 0}
                                                        </td>
                                                        <td style={{ color: summary.followUpScheduled.countByDate?.[dateStr] ? '' : 'red' }}>
                                                          {summary.followUpScheduled.countByDate?.[dateStr] || 0}
                                                        </td>
                                                        <td style={{ color: summary.finalStatus.Closed.countByDate?.[dateStr] ? '' : 'red' }}>
                                                          {summary.finalStatus.Closed.countByDate?.[dateStr] || 0}
                                                        </td>
                                                        <td style={{ color: summary.finalStatus.Rejected.countByDate?.[dateStr] ? '' : 'red' }}>
                                                          {summary.finalStatus.Rejected.countByDate?.[dateStr] || 0}
                                                        </td>
                                                        <td style={{ color: summary.finalStatus.Booking.countByDate?.[dateStr] ? '' : 'red' }}>
                                                          {summary.finalStatus.Booking.countByDate?.[dateStr] || 0}
                                                        </td>
                                                        <td style={{ color: targetAmount === 0 ? 'red' : '' }}>
                                                          RM {Number(targetAmount).toLocaleString('en-MY', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          })}
                                                        </td>
                                                        <td style={{ color: actualSales >= targetAmount ? 'green' : 'red' }}>
                                                          RM {Number(actualSales).toLocaleString('en-MY', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          })}
                                                        </td>
                                                        <td style={{ color: salesGap < 0 ? 'red' : salesGap > 0 ? 'green' : '' }}>
                                                          RM {Number(salesGap).toLocaleString('en-MY', {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                          })}
                                                        </td>
                                                      </tr>
                                                    );
                                                  }
                                                  

                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="col text-start">
                                        {summary && <>
                                      <div className="d-grid"><button onClick={() => exportToExcel(summary, filterDate[0], filterDate[1])} className="btn btn-md btn-dark">
                                        <i class="bi bi-download"></i> Export
                                    </button></div>
                                    </>}          
                                        </div>



                                    </div>
                                  </div>

                                  
                                      
                                  )}
                              </div>
                          </div>
                      </div>
    
                      <div className="modal fade" id="setSalesTarget" tabIndex="-1" aria-labelledby="setSalesTarget" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="setSalesTarget">Set Sales Target</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div className="modal-body text-start">
                    <SalesTartget teamId={teamId} />
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

export default StatSummary