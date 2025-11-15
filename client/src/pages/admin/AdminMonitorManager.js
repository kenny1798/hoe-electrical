import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdminContext } from '../../hooks/useAdminContext';
import { useState } from 'react';
import { msmartAxios } from '../../api/axios';
import Select from 'react-select';
import ExcelJS from 'exceljs';
import { saveAs } from "file-saver";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_green.css";

function AdminMonitorManager() {

    const {admin} = useAdminContext();
    const [team, setTeam] = useState("");
    const [teamName, setTeamName] = useState("");
    const [getTeam, setGetTeam] = useState([]);
    const [manager, setManager] = useState("");
    const [managerName, setManagerName] = useState("");
    const [getManager, setGetManager] = useState("");
    const [errMsg, setErrMsg] = useState("");
    const [date, setDate] = useState("");
    const [dataDate, setDataDate] = useState("");
    const [message, setMessage] = useState("");
    const [database, setDatabase] = useState([]);
    const [followUp, setFollowUp] = useState([]);
    const [training, setTraining] = useState([]);
    const [totalTeam, setTotalTeam] = useState(0);
    const [overall, setOverall] = useState({});
    const[showSummary, setShowSummary] = useState(false);
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    let flattenTraining = [];


    useEffect(() => {
        msmartAxios.get(`/api/msmart/admin/get/team/list`, {headers: {
          adminToken: admin.token.adminToken
        }}).then((response) => {
          setGetTeam(response.data)
        }).catch((err) => {
            setErrMsg(err.message)
        })
      }, [])

      const setDefault = () => {
        setTraining([]);
        setTotalTeam(0);
        setOverall({});
        setShowSummary(false);
        setPrompt("");
      }

      const onTeamChange = (id, label) => {
        setTeam(id)
        setTeamName(label)
        setFollowUp([])
        setDatabase([])
        setDate([])
        setTraining([])
        setMessage("")
        setShowSummary(false)
        msmartAxios.get(`/api/msmart/admin/get/team/manager/${id}`, {headers: {
          adminToken: admin.token.adminToken
        }}).then((response) => {
          setGetManager(response.data)
        }).catch((err) => {
            setErrMsg(err.message)
        })
      }

      const onManagerChange = (id, label) => {
        setManager(id)
        setManagerName(label)
        setFollowUp([])
        setDatabase([])
        setDate([])
        setTraining([])
        setMessage("")
        setShowSummary(false)
      }

      const teamOptions = getTeam.map((team) => {
        return {
          value: team.id,
          label: team.teamName}
      })
      
      let managerOptions = [];

      if(getManager.length > 0){
        managerOptions = getManager.map((manager) => {
            return {
              value: manager.username,
              label: manager.nameInTeam}
          })
      }

      const handleMonitor = () => {
        setMessage("")
        setDefault()
        setLoading(true)
        const data = {date:dataDate}
        msmartAxios.post(`/api/msmart/monitor/manager/${team}/${manager}`, data,{headers: {
          adminToken: admin.token.adminToken
        }}).then((response) => {

        if(response.status === 201){
            setDate(response.data.date)
            setDatabase(response.data.database)
            setFollowUp(response.data.followUp)
            setTraining(response.data.training)
            setOverall(response.data.overall)
            setTotalTeam(response.data.totalTeam)
            setPrompt(response.data.prompt)
            if(response.data.training.length == 0 || response.data.database.length == 0 || response.data.followUp.length == 0){
                setMessage("No data found")
            }
            setShowSummary(true)
        }else if(response.status === 404){
            setErrMsg(response.data.error)
        }
          
        }).catch((err) => {
            setErrMsg(err.message)
            setLoading(false)
        }).finally(() => {
          setLoading(false)
        })
      }

      const flattenData = (trainingData) => {
        return trainingData.map((user) => {
          const flattenedUser = { name: user.name, username: user.username };
          user.progressData.forEach((course) => {
            const courseName = Object.keys(course)[0];
            const courseProgress = course[courseName];
            flattenedUser[courseName] = courseProgress;
          });
          return flattenedUser;
        });
      };


      const flattenFollowUpData = (data) => {
        let flattened = [];
        
        // Iterate through the data and flatten it
        data.forEach(agent => {
          if (Array.isArray(agent.followUp)) {
            agent.followUp.forEach(followUpItem => {
              flattened.push({
                agentname: agent.agentname,
                username: followUpItem.username,
                name: followUpItem.name,
                phone: followUpItem.phone,
                country: followUpItem.country,
                status: followUpItem.status,
                remark: followUpItem.remark,
                followUpDate1: new Date(followUpItem.followUpDate).toDateString(),  // Date only
                followUpDate2: new Date(followUpItem.followUpDate).toTimeString(),  // Time only
              });
            });
          }
        });
      
        return flattened;
      };
      
      
      if(training.length > 0){
        flattenTraining = flattenData(training);
      }


      const exportTrainingToExcel = (trainingData) => {
      
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Training Progress');

        // Mendapatkan semua key yang ada dalam trainingData
        const keys = new Set();
        trainingData.forEach(item => {
            Object.keys(item).forEach(key => {
                keys.add(key.toString()); // Tambah semua keys yang ada dalam data (elakkan name dan username)
            });
        });

        // Menambah header ke dalam worksheet (tanpa 'name' dan 'username' yang diulang)
        const dynamicHeaders = [...keys];

        worksheet.columns = dynamicHeaders.map(header =>
            ({
            header: header,
            key: header, // Sesuaikan dengan keperluan anda
            width: 20, // Sesuaikan lebar kolum
        }));

        // Menambah baris data ke dalam worksheet
        trainingData.forEach(item => {
            const row = {};


            dynamicHeaders.slice(0).forEach(header => {
            const originalKey = Object.keys(item).find(key => key === header);
            if (originalKey) {
                row[header] = item[originalKey] || '';  // Tukar berdasarkan keyMap
            }
            
            });

            worksheet.addRow(row);
        });

  // Set header bold
  worksheet.getRow(1).font = { bold: true };

  // Simpan fail Excel
  workbook.xlsx.writeBuffer().then(buffer => {
    const data = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, `${managerName} - Training Progress (${date.today}).xlsx`);
  });
      };

      const exportDatabaseToExcel = (database) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Database Progress');
      
        // Menetapkan columns secara manual
        worksheet.columns = [
          { header: 'Name', key: 'name', width: 20 },
          { header: 'Username', key: 'username', width: 20 },
          { header: 'New Database', key: 'newDatabase', width: 15 },
          { header: 'Closed', key: 'closed', width: 15 },
          { header: 'Booked', key: 'booked', width: 15 },
          { header: 'Rejected', key: 'rejected', width: 15 },
          { header: 'Total Leads', key: 'totalLeads', width: 15 }
        ];
      
        // Menambah baris data ke dalam worksheet
        database.forEach(item => {
          worksheet.addRow({
            name: item.name,
            username: `${item.username}`,
            newDatabase: `${item.newDatabase}`,
            closed: `${item.closed}`,
            booked: `${item.booked}`,
            rejected: `${item.rejected}`,
            totalLeads: `${item.totalLeads}`
          });
        });
      
        // Set header bold
        worksheet.getRow(1).font = { bold: true };
      
        // Simpan fail Excel
        workbook.xlsx.writeBuffer().then(buffer => {
          const data = new Blob([buffer], { type: 'application/octet-stream' });
          saveAs(data, `${managerName} - Database Progress (${date.today}).xlsx`);
        });
      };

      const exportFollowUpToExcel = (data) => {
        const flatData = flattenFollowUpData(data);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Team Data');

        console.log(flatData)
      
        // Set the columns for the Excel file
        worksheet.columns = [
          { header: 'Agent Name', key: 'agentname', width: 20 },
          { header: 'Username', key: 'username', width: 20 },
          { header: 'Name (Lead)', key: 'name', width: 20 },
          { header: 'Phone Number (Lead)', key: 'phone', width: 20 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Remark', key: 'remark', width: 15 },
          { header: 'Date', key: 'followUpDate1', width: 20 },
          { header: 'Time', key: 'followUpDate2', width: 20 },
        ];


      
        // Add the rows to the worksheet
        flatData.forEach(item => {
            
          worksheet.addRow({
            agentname: item.agentname,
            username: item.username,
            name: item.name,
            phone: item.country + ' ' + item.phone.substring(0, item.phone.length - 4) + "****",
            status: item.status,
            remark: item.remark,
            followUpDate1: item.followUpDate1.slice(4),
            followUpDate2: item.followUpDate2.slice(0, 8),
          });
        });
      
        // Make the header row bold
        worksheet.getRow(1).font = { bold: true };
      
        // Write the Excel file to a buffer and save it
        workbook.xlsx.writeBuffer().then(buffer => {
          const blob = new Blob([buffer], { type: 'application/octet-stream' });
          saveAs(blob, `${managerName} - Follow Up List (${date.tomorrow}).xlsx`);
        });
      };

      const progressData = training.map(item => {
        return item.progressData;
      })

      const flattenedData = progressData.flat();
      console.log(training)

      const courseStats = flattenedData.reduce((acc, course) => {
        const [courseName, status] = Object.entries(course).find(([key]) => key !== "status");
        if (!acc[courseName]) {
          acc[courseName] = { "Not Started": 0, "Not Completed": 0, "Completed": 0 };
        }
        acc[courseName][course.status]++;
        return acc;
      }, {});
      
      const transformedArray = Object.entries(courseStats).map(([courseName, statuses]) => ({
        courseName,
        completed: statuses.Completed,
        notCompleted: statuses["Not Completed"],
        notStarted: statuses["Not Started"]
      }));

      const handleDateChange = (selectedDates) => {
        setDefault()
        const date = selectedDates[0];
                        const formatted = `${date.getFullYear()}-${String(
                          date.getMonth() + 1
                        ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                        setDataDate(formatted);
    };

  return (
    <div className='App'>
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-lg-12 mb-4 text-center">
        <h1 className="mt-4 header-title text-center">RTM Monitor</h1>
        <Link to={'/admin'}>Admin Panel</Link> <span>/ RTM Monitor</span>

        <nav aria-label="Page navigation example">
              <ul className="pagination justify-content-center my-4">
                <li className="page-item"><Link className="page-link" to={'/admin/monitor/ranking'} aria-disabled="true">Overall Ranking</Link></li>
                <li className="page-item"><Link className="page-link" to={'/admin/monitor/team'} aria-disabled="true">Team</Link></li>
                <li className="page-item"><span className="page-link disabled">Manager</span></li>
              </ul>
            </nav>

        <div className="row justify-content-center">
            
            <div className="col-md-8">
            <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-4">Manager Monitoring</h5>
              <div className='text-start'>
              <label>Select Team</label>
              <Select className='mb-4' options={teamOptions} onChange={(e) => onTeamChange(e.value, e.label)}/>

              {managerOptions.length === 0 ? <></> : 
              <>
              <label>Select Manager</label>
              <Select className='mb-4' options={managerOptions} onChange={(e) => onManagerChange(e.value, e.label)}/></>}

              {!team ? <></> :
              <>              <label>Select Date</label>
              <Flatpickr
                      id="filterDate"
                      className="form-control mb-4"
                      value={dataDate}
                      options={{ dateFormat: "Y-m-d",
                      disableMobile: true}}
                      onChange={handleDateChange}
                    /></>}

                {(!team || !manager || !dataDate) ? <></> : <div className='d-grid'>
                    <button className="btn btn-dark" onClick={handleMonitor} disabled={loading}>{loading ? <div class="spinner-border text-light" role="status">
                  <span class="sr-only">Loading...</span>
                </div> : <span>Generate Data</span>}</button>
                </div>}
                

                </div>   
            </div>
          </div>
            </div>

            {showSummary === true ? (<>
              <div className="row justify-content-center">         
            <div className="col-md-8">
            <div className="card">
            <div className="card-body">

            <h5><strong>{managerName}</strong></h5>
              <h6 className="mb-4">Team Summary - {date.today}</h6>

              <div class="table-responsive text-start">
                <table class="table">
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
              
              <div class="table-responsive text-start">
              <p>Total Team Members: {totalTeam}</p>
                <table class="table">
                  <thead>
                    <tr>
                      <th scope="col">Course</th>
                      <th scope="col">Enrolled</th>
                      <th scope="col">Completed</th>
                      <th scope="col">Not Completed</th>
                    </tr>
                  </thead>
                <tbody>{transformedArray.length > 0 ? <>
                  {transformedArray.map((course, index) => (
                    <tr key={index}>
                      <td>{course.courseName}</td>
                      <td>{totalTeam - course.notStarted}</td>
                      <td>{course.completed}</td>
                      <td>{course.notCompleted}</td>
                    </tr>
                  ))}            
                </> : <></>}
                </tbody>
                </table>
              </div>

              <h6 className="my-4">Data Prompt - {date.today}</h6>

              <p className='text-start' style={{whiteSpace: "pre-line"}}>*{managerName} Team Summary*</p>

              <p className='text-start' style={{whiteSpace: "pre-line"}}>
                {prompt}
              </p>


              </div>
              </div>
              </div>
              </div>  
            </>) : (<></>)}

        </div>
        </div>
        </div>
        </div>
        </div>
  )
}

export default AdminMonitorManager