import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { msmartAxios } from '../../api/axios';
import { useAdminContext } from '../../hooks/useAdminContext';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

function AdminMonitorAll() {
  const { admin } = useAdminContext();
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await msmartAxios.post(
        '/api/msmart/monitor/overall',
        { date },
        {
          headers: {
            adminToken: admin.token.adminToken,
          },
        }
      );
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMeritRanking = (data) => {
    const individualScores = {};
    const teamScores = {};

    ['createdLeads', 'closedLeads', 'bookingLeads', 'followupLeads'].forEach(
      (category) => {
        if (data[category]) {
          data[category].forEach((item) => {
            const points =
              category === 'closedLeads'
                ? 3
                : category === 'bookingLeads'
                ? 1.5
                : 1; // created & followup = 1 point

            // Untuk Individu
            if (item.username) {
              if (!individualScores[item.username]) {
                individualScores[item.username] = {
                  nameInTeam: item.nameInTeam || 'N/A',
                  teamName: item.teamName || 'N/A',
                  addedDatabase: 0,
                  closed: 0,
                  booked: 0,
                  followup: 0,
                  totalPoints: 0,
                };
              }
              if (category === 'createdLeads')
                individualScores[item.username].addedDatabase += item.totalLeads;
              if (category === 'closedLeads')
                individualScores[item.username].closed += item.totalLeads;
              if (category === 'bookingLeads')
                individualScores[item.username].booked += item.totalLeads;
              if (category === 'followupLeads')
                individualScores[item.username].followup += item.totalLeads;

              individualScores[item.username].totalPoints +=
                item.totalLeads * points;
            }

            // Untuk Team
            if (item.teamId) {
              if (!teamScores[item.teamId]) {
                teamScores[item.teamId] = {
                  teamName: item.teamName || 'N/A',
                  addedDatabase: 0,
                  closed: 0,
                  booked: 0,
                  followup: 0,
                  totalPoints: 0,
                };
              }
              if (category === 'createdLeads')
                teamScores[item.teamId].addedDatabase += item.totalLeads;
              if (category === 'closedLeads')
                teamScores[item.teamId].closed += item.totalLeads;
              if (category === 'bookingLeads')
                teamScores[item.teamId].booked += item.totalLeads;
              if (category === 'followupLeads')
                teamScores[item.teamId].followup += item.totalLeads;

              teamScores[item.teamId].totalPoints += item.totalLeads * points;
            }
          });
        }
      }
    );

    const sortedIndividuals = Object.entries(individualScores)
      .map(([key, value]) => ({ username: key, ...value }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    const sortedTeams = Object.entries(teamScores)
      .map(([key, value]) => ({ teamId: key, ...value }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return { sortedIndividuals, sortedTeams };
  };

  const renderMeritTable = (title, rankingData, isIndividual) => (
    <div
      className={`card my-5 ${
        isIndividual ? "border-warning" : "border-info"
      }`}
    >
      <div
        className={`card-header text-center ${
          isIndividual ? "bg-warning text-dark" : "bg-info  text-white"
        }`}
      >
        <h5 className="card-title mb-0">{title}</h5>
        <p className="mb-0 mt-2 text-sm">
          <strong>Points Legend:</strong> Closed = 3 pts, Booked = 1.5 pts, Added Database = 1 pt, Follow Up = 1 pt
        </p>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          {rankingData.length > 0 ? (
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Rank</th>
                  {isIndividual && <th>Name</th>}
                  <th>{isIndividual ? "Team" : "Team Name"}</th>
                  <th>Added Database</th>
                  <th>Closed</th>
                  <th>Booked</th>
                  <th>Follow Up</th>
                  <th>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {rankingData.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {index + 1}{" "}
                      {index === 0
                        ? "🥇"
                        : index === 1
                        ? "🥈"
                        : index === 2
                        ? "🥉"
                        : ""}
                    </td>
                    {isIndividual && <td>{item.nameInTeam || 'N/A'}</td>}
                    <td>{item.teamName || 'N/A'}</td>
                    <td>{item.addedDatabase}</td>
                    <td>{item.closed}</td>
                    <td>{item.booked}</td>
                    <td>{item.followup}</td>
                    <td>{item.totalPoints.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-muted">No data available.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderMeritRanking = () => {
    if (!data) return null;

    const { sortedIndividuals, sortedTeams } = calculateMeritRanking(data);

    return (
      <>
        {renderMeritTable(
          `Top Overall Individual Performance of RTM Program (${new Date(date).getDate()}/${new Date(date).getMonth() + 1}/${new Date(date).getFullYear()})`,
          sortedIndividuals,
          true
        )}
        {renderMeritTable(
          `Top Overall Team of RTM Program (${new Date(date).getDate()}/${new Date(date).getMonth() + 1}/${new Date(date).getFullYear()})`,
          sortedTeams,
          false
        )}
      </>
    );
  };

  const handleDateChange = (selectedDates) => {
    
    const date = selectedDates[0];
                    const formatted = `${date.getFullYear()}-${String(
                      date.getMonth() + 1
                    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                    setDate(formatted);
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
              <li className="page-item"><span className="page-link disabled">Overall Ranking</span></li>
                <li className="page-item"><Link className="page-link" to={'/admin/monitor/team'} aria-disabled="true">Team</Link></li>
                <li className="page-item"><Link className="page-link" to={'/admin/monitor/manager'} aria-disabled="true">Manager</Link></li>
              </ul>
            </nav>

<div className="row justify-content-center">
  <div className="col-md-8">
  <div className="card">
  <div className="card-body">
  <h5 className="card-title mb-4">Overall Monitoring</h5>
  <div className="date-picker my-4">
  <div className="row justify-content-center align-items-center">
    <div className="col-auto">
      <label className="form-label">
        Select Date:
      </label>
    </div>
    <div className="col-auto">
    <Flatpickr
                      id="filterDate"
                      className="form-control mb-4"
                      value={date}
                      options={{ dateFormat: "Y-m-d",
                      disableMobile: true}}
                      onChange={handleDateChange}
                    />
    </div>
  </div>
</div>

<div className="d-grid">
<button
        className="btn btn-dark"
        onClick={fetchData}
        disabled={!date}
      >
        Generate
      </button>
</div>


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
              <div>{renderMeritRanking()}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminMonitorAll;
