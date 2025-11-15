import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminContext } from '../../hooks/useAdminContext';
import { msmartAxios } from '../../api/axios';
import Select from 'react-select';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_green.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// NOTE: kalau icon tak keluar, pastikan bootstrap-icons dimuatkan global (CDN atau import css)

function AdminMonitorTeam() {
  const { admin } = useAdminContext();

  // ====== State utama ======
  const [team, setTeam] = useState('');
  const [teamName, setTeamName] = useState('');
  const [getTeam, setGetTeam] = useState([]);
  const [managerName, setManagerName] = useState('');
  const [managers, setManagers] = useState([]);
  const [errMsg, setErrMsg] = useState('');

  const [date, setDate] = useState(''); // dari API /monitor/manager
  const [dataDate, setDataDate] = useState({ start: '', end: '' }); // hantar ke API
  const [selectedDates, setSelectedDates] = useState([]); // Date[] untuk Flatpickr UI

  const [message, setMessage] = useState('');
  const [database, setDatabase] = useState([]);
  const [followUp, setFollowUp] = useState([]);
  const [teamData, setTeamData] = useState([]);
  const [teamTraining, setTeamTraining] = useState([]);
  const [training, setTraining] = useState([]);
  const [totalTeam, setTotalTeam] = useState(0);
  const [overall, setOverall] = useState({});
  const [followUpTeam, setFollowUpTeam] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);

  // ====== Activity View (Team) ======
  const [activityView, setActivityView] = useState([]);
  const [actLoading, setActLoading] = useState(false);
  const [actErr, setActErr] = useState('');

  // ====== Modal details (Eye view) ======
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalData, setModalData] = useState([]);

  // ====== Scoring & Ranking ======
  const scoreItem = (item) =>
    item.totalClosed * 3 +
    item.totalBooking * 1.5 +
    item.totalCreated * 1 +
    item.totalFollowUp * 1 +
    item.totalRejected * 0.25;

  function rankWithTies(items, scoreFn) {
    const scored = items.map((it) => ({ ...it, totalPoints: scoreFn(it) }));
    scored.sort((a, b) => b.totalPoints - a.totalPoints);
    let currentRank = 0;
    let prevPoints = null;
    let itemsSeen = 0;
    for (const it of scored) {
      itemsSeen += 1;
      if (prevPoints === null || it.totalPoints !== prevPoints) {
        currentRank = itemsSeen;
        prevPoints = it.totalPoints;
      }
      it.rank = currentRank;
    }
    return scored;
  }

  const getMedal = (rank, totalPoints) => {
    if (!totalPoints || totalPoints <= 0) return '';
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  // ====== Effects ======
  useEffect(() => {
    msmartAxios
      .get(`/api/msmart/admin/get/team/list`, {
        headers: { adminToken: admin.token.adminToken },
      })
      .then((response) => setGetTeam(response.data))
      .catch((err) => setErrMsg(err.message));
  }, [admin?.token?.adminToken]);

  // ====== Utils ======
  const setDefault = () => {
    setTeamData([]);
    setFollowUp([]);
    setDatabase([]);
    setTraining([]);
    setMessage('');
    setShowSummary(false);
  };

  const onTeamChange = (id, label) => {
    setTeam(id);
    setTeamName(label);
    setDate([]);
    setDefault();
    setActivityView([]);
  };

  const handleDateChange = (dates) => {
    setDefault();
    setActivityView([]);
    setSelectedDates(dates);

    if (!dates || dates.length === 0) {
      setDataDate({ start: '', end: '' });
      return;
    }
    const fmt = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
    const start = dates[0];
    const end = dates[1] || dates[0];
    setDataDate({ start: fmt(start), end: fmt(end) });
  };

  const handleMonitor = () => {
    setDefault();
    setLoading(true);
    setMessage('');
    const data = { date: dataDate };

    // /monitor/manager
    msmartAxios
      .post(`/api/msmart/monitor/manager/${team}`, data, {
        headers: { adminToken: admin.token.adminToken },
      })
      .then((response) => {
        if (response.status === 201) {
          setDate(response.data.date);
          setDatabase(response.data.database);
          setFollowUp(response.data.followUp);
          setTraining(response.data.training);
          setOverall(response.data.overall);
          setTotalTeam(response.data.totalTeam);
          if (
            response.data.training.length === 0 ||
            response.data.database.length === 0 ||
            response.data.followUp.length === 0
          ) {
            setMessage('No data found');
          }
          setShowSummary(true);
        } else if (response.status === 404) {
          setErrMsg(response.data.error);
        }
      })
      .catch((err) => setErrMsg(err.message))
      .finally(() => setLoading(false));

    // /monitor/team
    msmartAxios
      .post(`/api/msmart/monitor/team/${team}`, data, {
        headers: { adminToken: admin.token.adminToken },
      })
      .then((response) => {
        if (response.status === 201) {
          setTeamData(response.data.teamData);
          setTeamTraining(response.data.trainingData);
          setFollowUpTeam(response.data.followUpData);
          setManagers(response.data.manager);
        }
      })
      .catch((err) => setErrMsg(err.message))
      .finally(() => setLoading(false));
  };

  const loadTeamActivityView = async () => {
    setActErr('');
    setActLoading(true);
    try {
      const payload = { startDate: dataDate.start, endDate: dataDate.end };
      const res = await msmartAxios.post(
        `/api/msmart/monitor/activity/${team}`,
        payload,
        { headers: { adminToken: admin.token.adminToken } }
      );
      setActivityView(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setActErr(e?.response?.data?.error || e.message || 'Failed to load activity');
    } finally {
      setActLoading(false);
    }
  };

  const fmtDT = (d) => {
    const x = new Date(d);
    if (Number.isNaN(x.getTime())) return d || '';
    return x.toLocaleString();
  };

  // ====== Training summary transform ======
  const progressData = training.map((item) => item.progressData);
  const flattenedData = progressData.flat();
  const courseStats = flattenedData.reduce((acc, course) => {
    const [courseName] = Object.entries(course).find(([key]) => key !== 'status');
    if (!acc[courseName]) {
      acc[courseName] = { 'Not Started': 0, 'Not Completed': 0, Completed: 0 };
    }
    acc[courseName][course.status]++;
    return acc;
  }, {});
  const transformedArray = Object.entries(courseStats).map(([courseName, statuses]) => ({
    courseName,
    completed: statuses.Completed,
    notCompleted: statuses['Not Completed'],
    notStarted: statuses['Not Started'],
  }));

  const teamOptions = getTeam.map((t) => ({ value: t.id, label: t.teamName }));

  // ====== Excel Exports ======
  async function createExcelFiles(data) {
    const { teamData, trainingData, manager } = data;

    const filterDataByManager = (dataset, managerUsername) =>
      dataset.filter((item) => item.manager === managerUsername);

    const addSheetIfNotExists = (workbook, sheetName) => {
      const cleanSheetName = sheetName.replace(/[*?:/\\[\]]/g, '-').slice(0, 31);
      const existingSheet = workbook.getWorksheet(cleanSheetName);
      if (existingSheet) return existingSheet;
      return workbook.addWorksheet(cleanSheetName);
    };

    const addSheetWithData = (workbook, sheetName, headers, rows) => {
      const sheet = addSheetIfNotExists(workbook, sheetName);
      sheet.columns = headers.map((header) => ({
        header,
        key: header.replace(/\s+/g, ''),
        width: 30,
      }));
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

      rows.forEach((row) => {
        const excelRow = sheet.addRow(row);
        headers.forEach((header) => {
          const key = header.replace(/\s+/g, '');
          const cell = excelRow.getCell(key);
          if (cell.value === '' || cell.value === 0 || cell.value == null) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF0000' } };
            cell.font = { color: { argb: 'FFFFFFFF' } };
          }
        });
      });
    };

    const addTrainingSheetWithData = (workbook, sheetName, headers, rows) => {
      const sheet = addSheetIfNotExists(workbook, sheetName);
      sheet.columns = headers.map((header) => ({ header, key: header, width: 20 }));
      rows.forEach((row) => sheet.addRow(row));
    };

    // Workbook 1: Team Data
    const teamWorkbook = new ExcelJS.Workbook();
    managers.forEach(({ username, nameInTeam }) => {
      const teamRows = filterDataByManager(teamData, username).map((item) => ({
        Name: item.name,
        Username: item.username,
        'Manager Username': item.manager,
        'Added Database': item.newDatabase,
        Closed: item.closed,
        Booked: item.booked,
        Rejected: item.rejected,
        'Total Accumulated Leads': item.totalLeads,
      }));
      if (teamRows.length > 0) {
        const headers = [
          'Name',
          'Username',
          'Manager Username',
          'Added Database',
          'Closed',
          'Booked',
          'Rejected',
          'Total Accumulated Leads',
        ];
        addSheetWithData(teamWorkbook, nameInTeam, headers, teamRows);
      }
    });

    // Workbook 2: Training Data
    const trainingWorkbook = new ExcelJS.Workbook();
    const transformTrainingData = (trainingData) => {
      const progressHeaders = Array.from(
        new Set(
          trainingData
            .flatMap((user) =>
              user.progressData.map((progress) => Object.keys(progress).filter((k) => k !== 'status'))
            )
            .flat()
        )
      );
      const transformedRows = trainingData.map((user) => {
        const row = { Name: user.name, Username: user.username, Manager: user.manager };
        progressHeaders.forEach((header) => {
          const progress = user.progressData.find((p) => p[header] !== undefined);
          row[header] = progress ? progress[header] : 'N/A';
        });
        return row;
      });
      return { progressHeaders, transformedRows };
    };
    const { progressHeaders, transformedRows } = transformTrainingData(trainingData);
    managers.forEach(({ username, nameInTeam }) => {
      const managerData = transformedRows.filter((row) => row.Manager === username);
      if (managerData.length > 0) {
        const headers = ['Name', 'Username', 'Manager', ...progressHeaders];
        addTrainingSheetWithData(trainingWorkbook, nameInTeam, headers, managerData);
      }
    });

    const teamBlob = await teamWorkbook.xlsx.writeBuffer();
    saveAs(new Blob([teamBlob]), `[${date.today}] Database Performance Data - ${teamName}.xlsx`);

    const trainingBlob = await trainingWorkbook.xlsx.writeBuffer();
    saveAs(new Blob([trainingBlob]), `[${date.today}] Training Data - ${teamName}.xlsx`);
  }

  const exportFollowUpDataToExcel = async (managers, followUpData) => {
    const workbook = new ExcelJS.Workbook();
    managers.forEach((manager) => {
      const managerFollowUps = followUpData.filter((d) => d.manager === manager.username);
      if (managerFollowUps.length === 0) return;
      const sheet = workbook.addWorksheet(manager.nameInTeam);
      const headers = [
        { header: 'Salesperson Name', key: 'salespersonName', width: 25 },
        { header: 'Lead Name', key: 'leadName', width: 25 },
        { header: 'Phone Number', key: 'phoneNumber', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Remark', key: 'remark', width: 30 },
        { header: 'FollowUp Date', key: 'followUpDate', width: 25 },
      ];
      sheet.columns = headers;

      managerFollowUps.forEach((data) => {
        data.followUp.forEach((fu) => {
          const maskedPhone = fu.phone ? fu.phone.slice(0, -5) + '*****' : 'N/A';
          sheet.addRow({
            salespersonName: data.name,
            leadName: fu.name,
            phoneNumber: fu.country + maskedPhone,
            status: fu.status,
            remark: fu.remark || 'N/A',
            followUpDate: fu.followUpDate ? new Date(fu.followUpDate).toLocaleString() : 'N/A',
          });
        });
      });

      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `[${date.today}] Follow Up Data - ${teamName}.xlsx.xlsx`);
  };

  // ====== Derived: ranking from activityView ======
  const rankedActivity = activityView.length ? rankWithTies(activityView, scoreItem) : [];

  // ====== Eye View handler ======
  const handleViewDetails = (data, category, name) => {
    setModalData(Array.isArray(data) ? data : []);
    setModalTitle(`${name} - ${category}`);
    setShowModal(true);
  };

  return (
    <div className="App">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-12 mb-4 text-center">
            <h1 className="mt-4 header-title text-center">RTM Monitor</h1>
            <Link to={'/admin'}>Admin Panel</Link> <span>/ RTM Monitor</span>

            <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-center my-4">
                <li className="page-item">
                  <Link className="page-link" to={'/admin/monitor/ranking'} aria-disabled="true">
                    Overall Ranking
                  </Link>
                </li>
                <li className="page-item">
                  <span className="page-link disabled">Team</span>
                </li>
                <li className="page-item">
                  <Link className="page-link" to={'/admin/monitor/manager'} aria-disabled="true">
                    Manager
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title mb-4">Team Monitoring</h5>
                    <div className="text-start">
                      <label>Select Team</label>
                      <Select className="mb-4" options={getTeam.map((t) => ({ value: t.id, label: t.teamName }))} onChange={(e) => onTeamChange(e.value, e.label)} />

                      {!team ? null : (
                        <>
                          <label>Select Date</label>
                          <Flatpickr
                            id="filterDate"
                            className="form-control mb-4"
                            value={selectedDates}
                            options={{
                              mode: 'range',
                              dateFormat: 'Y-m-d',
                              disableMobile: true,
                            }}
                            onChange={handleDateChange}
                          />
                        </>
                      )}

                      {!team || !dataDate.start || !dataDate.end ? null : (
                        <div className="d-grid">
                          <button className="btn btn-dark" onClick={handleMonitor} disabled={loading}>
                            {loading ? (
                              <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                              </div>
                            ) : (
                              'Generate Data'
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showSummary ? (
              <>
                <div className="row justify-content-center">
                  <div className="col-md-8">
                    <div className="card">
                      <div className="card-body">
                        <h5>
                          <strong>{managerName}</strong>
                        </h5>
                        <h6 className="mb-4">Team Summary - {date.today}</h6>

                        <div className="table-responsive text-start">
                          <table className="table">
                            <tbody>
                              <tr>
                                <td>New Member Registered</td>
                                <td>{overall.newTeamMember}</td>
                              </tr>
                              <tr>
                                <td>Added Database</td>
                                <td>{overall.newDatabase}</td>
                              </tr>
                              <tr>
                                <td>Closed</td>
                                <td>{overall.closed}</td>
                              </tr>
                              <tr>
                                <td>Booked</td>
                                <td>{overall.booked}</td>
                              </tr>
                              <tr>
                                <td>Follow Up</td>
                                <td>{overall.FollowUp}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <h6 className="my-4">Training Summary - {date.today}</h6>

                        <div className="table-responsive text-start">
                          <p>Total Team Members: {totalTeam}</p>
                          <table className="table">
                            <thead>
                              <tr>
                                <th scope="col">Course</th>
                                <th scope="col">Enrolled</th>
                                <th scope="col">Completed</th>
                                <th scope="col">Not Completed</th>
                              </tr>
                            </thead>
                            <tbody>
                              {transformedArray.length > 0
                                ? transformedArray.map((course, index) => (
                                    <tr key={index}>
                                      <td>{course.courseName}</td>
                                      <td>{totalTeam - course.notStarted}</td>
                                      <td>{course.completed}</td>
                                      <td>{course.notCompleted}</td>
                                    </tr>
                                  ))
                                : null}
                            </tbody>
                          </table>
                        </div>
                        {message ? <div className="alert alert-warning mt-3">{message}</div> : null}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}

            {teamData.length > 0 && (
              <div className="row justify-content-center">
                <div className="col-md-8">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title mb-4">Monitoring Data</h5>
                      {teamTraining.length > 0 ? (
                        <p>
                          <button
                            className="btn btn-outline-dark my-3"
                            onClick={() =>
                              createExcelFiles({
                                teamData: teamData,
                                trainingData: teamTraining,
                                manager: managers,
                              })
                            }
                          >
                            Export Data to Excel ({date.today})
                          </button>
                        </p>
                      ) : (
                        <p>No Data on Training</p>
                      )}
                      {followUpTeam.length > 0 ? (
                        <p>
                          <button
                            className="btn btn-outline-dark my-3"
                            onClick={() => exportFollowUpDataToExcel(managers, followUpTeam)}
                          >
                            Export Follow Up Data to Excel ({date.today})
                          </button>
                        </p>
                      ) : (
                        <p>No Data on Follow Up</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== Activity View (Team) ===== */}
            {team && dataDate.start && dataDate.end && (
              <div className="row justify-content-center">
                <div className="col-md-10">
                  <div className="card mt-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0">Activity View (Team)</h5>
                        <button
                          className="btn btn-outline-dark"
                          onClick={loadTeamActivityView}
                          disabled={actLoading}
                          title="Load activity by date range"
                        >
                          {actLoading ? (
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            ></span>
                          ) : (
                            'Load Activity'
                          )}
                        </button>
                      </div>

                      {actErr && <div className="alert alert-danger mt-3">{actErr}</div>}

                      {/* ===== Ranking Table (with Eye buttons) ===== */}
                      {rankedActivity.length > 0 && (
                        <div className="table-responsive mt-4">
                          <h6 className="mb-3">Ranking (Points)</h6>
                          <table className="table table-bordered text-center" style={{ fontSize: '0.9rem' }}>
                            <thead className="bg-light">
                              <tr>
                                <th>Rank</th>
                                <th className="text-start">Name</th>
                                <th className="text-start">Manager</th>
                                <th>Added</th>
                                <th>Closed</th>
                                <th>Booked</th>
                                <th>Rejected</th>
                                <th>Follow Up</th>
                                <th>Points</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rankedActivity.map((d) => (
                                <tr key={d.username}>
                                  <td>
                                    {getMedal(d.rank, d.totalPoints)} {d.rank}
                                  </td>
                                  <td className="text-start">
                                    {d.nameInTeam} <span className="text-muted">@{d.username}</span>
                                  </td>
                                  <td className="text-start">{d.managerNameInTeam || 'N/A'}</td>

                                  <td>
                                    {d.totalCreated}{' '}
                                    <button
                                      className="btn btn-light btn-sm"
                                      disabled={!d.createdLeads || d.createdLeads.length === 0}
                                      onClick={() =>
                                        handleViewDetails(d.createdLeads, 'Added Database', d.nameInTeam)
                                      }
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                  </td>

                                  <td>
                                    {d.totalClosed}{' '}
                                    <button
                                      className="btn btn-light btn-sm"
                                      disabled={!d.closedLeads || d.closedLeads.length === 0}
                                      onClick={() =>
                                        handleViewDetails(d.closedLeads, 'Closed Leads', d.nameInTeam)
                                      }
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                  </td>

                                  <td>
                                    {d.totalBooking}{' '}
                                    <button
                                      className="btn btn-light btn-sm"
                                      disabled={!d.bookingLeads || d.bookingLeads.length === 0}
                                      onClick={() =>
                                        handleViewDetails(d.bookingLeads, 'Booked Leads', d.nameInTeam)
                                      }
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                  </td>

                                  <td>
                                    {d.totalRejected}{' '}
                                    <button
                                      className="btn btn-light btn-sm"
                                      disabled={!d.rejectedLeads || d.rejectedLeads.length === 0}
                                      onClick={() =>
                                        handleViewDetails(d.rejectedLeads, 'Rejected Leads', d.nameInTeam)
                                      }
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                  </td>

                                  <td>
                                    {d.totalFollowUp}{' '}
                                    <button
                                      className="btn btn-light btn-sm"
                                      disabled={!d.followUpLeads || d.followUpLeads.length === 0}
                                      onClick={() =>
                                        handleViewDetails(d.followUpLeads, 'Follow Up Leads', d.nameInTeam)
                                      }
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                  </td>

                                  <td>{Number(d.totalPoints?.toFixed?.(2) ?? d.totalPoints ?? 0)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {activityView.length === 0 && !actLoading && !actErr && (
                        <p className="text-muted mt-3">
                          No activity loaded yet. Choose team & date range, then click <em>Load Activity</em>.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== Modal (Eye View) ===== */}
            {showModal && (
              <>
                <div className="modal-backdrop fade show"></div>
                <div className="modal fade show" tabIndex="-1" style={{ display: 'block', fontSize: '0.9rem' }}>
                  <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">{modalTitle}</h5>
                        <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                      </div>
                      <div className="modal-body">
                        {modalData && modalData.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-bordered text-center">
                              <thead className="bg-light">
                                <tr>
                                  <th>#</th>
                                  <th className="text-start">Name</th>
                                  <th className="text-start">Phone</th>
                                  <th>Country</th>
                                  <th>Status</th>
                                  <th>Activity Datetime</th>
                                  <th>Last Update Lead</th>
                                </tr>
                              </thead>
                              <tbody>
                                {modalData.map((item, index) => (
                                  <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="text-start">{item.name}</td>
                                    <td className="text-start">
                                      {item.country}
                                      {item.phone}
                                    </td>
                                    <td>{item.country || 'N/A'}</td>
                                    <td>{item.status || 'N/A'}</td>
                                    <td>{fmtDT(item.createdAt)}</td>
                                    <td>{fmtDT(item.updatedAt)}</td>
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
                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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
      </div>
    </div>
  );
}

export default AdminMonitorTeam;
