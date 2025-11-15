import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios, { msmartAxios } from '../../../../api/axios';
import { useAuthContext } from '../../../../hooks/useAuthContext';
import { useToast } from '../../../../context/ToastContext';


function SuperManageManager() {

    const {user} = useAuthContext();
    const {teamId} = useParams();
    const [dbData, setDbData] = useState([]);
    const [error, setError] = useState("");
    const [succ, setSucc] = useState("");
    const [search, setSearch] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState(null);
    const navigate = useNavigate();
    const [selectedUser, setSelectedUser] = useState(null);
    const [editName, setEditName] = useState('');
    const [editPosition, setEditPosition] = useState('');
    const [editManagerUsername, setEditManagerUsername] = useState('');
    const [toastMsg, setToastMsg] = useState(null);
    const [toastType, setToastType] = useState('success'); // 'success' or 'danger'
    const { notifySuccess, notifyError, notifyLoading } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchMember, setSearchMember] = useState('');







    useEffect(() => {
      msmartAxios.get(`/api/msmart/supermanager/get/all/team/member/${teamId}`, {
        headers: { accessToken: user.token }
      }).then((response) => {
        if (response.data.team) {
          setDbData(response.data.team);
        } else {
          notifyError("Unable to approve member request");
        }
      });
    }, []);

    useEffect(() => {
      if (toastMsg) {
        const timer = setTimeout(() => setToastMsg(null), 3000);
        return () => clearTimeout(timer);
      }
    }, [toastMsg]);
    
    useEffect(() => {
      if (!searchMember) return;
    
      const matchedIndex = sortedManagers.findIndex(([_, members]) =>
        members.some(member =>
          member.nameInTeam?.toLowerCase().includes(searchMember.toLowerCase()) ||
          member.username?.toLowerCase().includes(searchMember.toLowerCase())
        )
      );
    
      setActiveAccordion(matchedIndex !== -1 ? matchedIndex : null);
    }, [searchMember]);
    

    

    const allManagers = dbData.filter(user =>
      user.position === 'Owner' ||
      user.position === 'Manager' ||
      user.position === 'Manager & Member'
    );

    
    const groupedByManager = {};

    allManagers.forEach(manager => {
      let subordinates = dbData.filter(member =>
        member.managerUsername === manager.username
      );
    
      // ✅ Kalau bukan owner, masukkan diri sendiri kat atas
      if (manager.position !== 'Owner') {
        subordinates = [manager, ...subordinates];
      } else {
        // ❌ Untuk owner, pastikan dia tak masuk dalam senarai anak buah dia
        subordinates = subordinates.filter(m => m.username !== manager.username);
      }
    
      groupedByManager[manager.username] = subordinates;
    });    

    const positionRank = {
      'Owner': 1,
      'Manager': 2,
      'Manager & Member': 3
    };
    
    const sortedManagers = Object.entries(groupedByManager).sort((a, b) => {
      const aUser = dbData.find(d => d.username === a[0]);
      const bUser = dbData.find(d => d.username === b[0]);
    
      const aRank = positionRank[aUser?.position] || 999;
      const bRank = positionRank[bUser?.position] || 999;
    
      return aRank - bRank;
    });

    const openEditModal = (user) => {
      setSelectedUser(user);
      setEditName(user.nameInTeam);
      setEditPosition(user.position);
      setEditManagerUsername(user.managerUsername || '');
      
      const modal = new window.bootstrap.Modal(document.getElementById('editUserModal'));
      modal.show();
    };

    const handleEditSubmit = () => {
      setIsSubmitting(true);
      if (!selectedUser) return;
    
      const selectedManager = dbData.find(u => u.username === editManagerUsername);
    
      const updatedData = {
        position: editPosition,
        managerUsername: selectedManager?.username || null,
        managerName: selectedManager?.nameInTeam || null
      };
    
      const toastId = notifyLoading("Saving changes...");

      msmartAxios.put(`/api/msmart/supermanager/update/member/${selectedUser.id}`, updatedData, {
        headers: { accessToken: user.token }
      })
        .then((res) => {
          if (res.data.succ) {
            notifySuccess("User updated successfully", { id: toastId });
          
            // Close modal
            const modalEl = document.getElementById('editUserModal');
            const modal = window.bootstrap.Modal.getInstance(modalEl);
            modal.hide();
          
            setTimeout(() => window.location.reload(), 1500);
          }
           else {
            notifyError("Update failed", { id: toastId }); // ⬅ FIXED
          }
        })
        .catch(err => {
          console.error(err);
          notifyError("Server error", { id: toastId }); // ⬅ FIXED
        });

    };
    
    
    
    
    
        
      
        const deleteMember = (id, e) => {
          setSucc('');
          setError('');
          e.preventDefault();
      
          const confirmed = window.confirm('Are you sure you want to delete this member request?')
          
          if(confirmed){
            msmartAxios.delete(`/api/msmart/manager/member/${id}`, {headers: {
              accessToken: user.token
            }}).then((response) => {
              if(response.data.succ){
                notifySuccess(response.data.succ)
                const delay = () =>{
                  window.location.reload()
                }
                setTimeout(delay, 2000)
              }else{
                notifyError("Unable to delete member request")
                const delay = () =>{
                  window.location.reload()
                }
                setTimeout(delay, 2000)
              }
            }).catch((err) => {
              notifyError("Unable to delete member request")
                const delay = () =>{
                  window.location.reload()
                }
                setTimeout(delay, 2000)
                console.log(err)
            })
          }
      
        }
      
        const approveMember = (id, e) => {
          setSucc('');
          setError('');
      
          const data = {id: id}
      
          e.preventDefault();
      
          msmartAxios.put(`/api/msmart/manager/approve/member`, data, {headers: {
            accessToken: user.token
          }}).then((response) => {
            if(response.data.succ){
              setSucc(response.data.succ)
              const delay = () =>{
                window.location.reload()
              }
              setTimeout(delay, 2000)
            }else{
              notifyError("Unable to approve member request")
              const delay = () =>{
                window.location.reload()
              }
              setTimeout(delay, 2000)
            }
          }).catch((err) => {
            notifyError("Unable to approve member request")
              const delay = () =>{
                window.location.reload()
              }
              setTimeout(delay, 2000)
              console.log(err)
          })
        }
        
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
        <Link class="nav-link active" aria-current="true" href="#">Manage</Link>
      </li>
      <li class="nav-item">
      <Link className="nav-link" to={`/msmart/team/admin/activity/${teamId}`}>Activities</Link>
      </li>
      <li class="nav-item">
      <Link className="nav-link" to={`/msmart/team/admin/followup/${teamId}`}>Follow Up</Link>
      </li>
      <li class="nav-item">
      <Link className="nav-link" to={`/msmart/team/admin/leads/${teamId}`}>Leads</Link>
      </li>
    </ul>
  </div>
  
  <div class="card-body">
    <div className="row my-3 g-3">
      <div className="col">
      <div className="form-floating">
      <input
        type="text"
        id="floatingSearchMember"
        className="form-control"
        placeholder="Search member"
        value={searchMember}
        onChange={(e) => setSearchMember(e.target.value)}
      />
      <label htmlFor="floatingSearchMember" style={{color:"gray"}}>Search member</label>
    </div>

      </div>

    </div>



    <p style={{fontSize:"0.9rem", color:"gray"}}>Click / Tap to open</p>
 
            <div className="accordion" id="managerAccordion">
            {sortedManagers
            .filter(([managerUsername, members]) => {
              if (!searchMember) return true;

              const keyword = searchMember.toLowerCase();

              return members.some(member =>
                member.nameInTeam?.toLowerCase().includes(keyword) ||
                member.username?.toLowerCase().includes(keyword)
              );
            })
            .map(([managerUsername, members], index) => {
            const isOpen = activeAccordion === index;
            const managerData = dbData.find(m => m.username === managerUsername);
            const managerName = managerData?.nameInTeam || 'Unknown';
            let managerPos = managerData?.position || '';
            if (managerPos === 'Manager & Member') managerPos = 'Team Leader';
            const managerStatus = managerData?.isVerified ? 'Verified' : 'Not Verified';


    return (
      <div className="accordion-item my-3" key={index}>
        <h2 className="accordion-header" id={`heading-${index}`}>
          <button
            className={`accordion-button  ${!isOpen ? 'collapsed' : ''}`}
            type="button"
            onClick={() => setActiveAccordion(isOpen ? null : index)}
          >
            <div className="w-100">
            <div className="fw-bold">{managerName}</div>
            <div style={{ fontSize: '0.85rem', color: 'gray' }}>
              {managerPos}
            </div>
          </div>

          </button>
        </h2>
        <div
          id={`collapse-${index}`}
          className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}
        >
          <div className="accordion-body">
            <table className="table table-bordered" style={{ fontSize: '0.9rem' }}>
              <thead className="bg-light">
                <tr>
                  <th>#</th>
                  <th className="text-start">Member Info</th>
                  <th>Pos</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((val, key) => {
                  return (
                    <tr key={val.id}>
                    <th scope="row">{key + 1}</th>
                    <td className="text-start">
                      {val.nameInTeam} <span className="text-muted">({val.username})</span>
                    </td>
                    <td>
                      {val.position === 'Manager & Member' ? 'Team Leader' : val.position}
                    </td>
                    <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openEditModal(val)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  })}
</div>


  </div>
</div>


<div className="modal fade" id="editUserModal" tabIndex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
  <div className="modal-dialog modal-dialog-centered">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title" id="editUserModalLabel">Edit Member</h5>
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div className="modal-body">

      <div className="form-floating my-3">
      <input
        type="text"
        className="form-control"
        id="floatingName"
        value={editName}
        disabled
      />
      <label htmlFor="floatingName">Name</label>
          </div>

          <div className="form-floating mb-3">
            <select
              className="form-select"
              id="floatingPosition"
              value={editPosition}
              onChange={(e) => setEditPosition(e.target.value)}
            >
              <option value="Member">Member</option>
              <option value="Manager">Manager</option>
              <option value="Manager & Member">Team Leader</option>
              <option value="Owner">Owner</option>
            </select>
            <label htmlFor="floatingPosition">Position</label>
          </div>

          <div className="form-floating mb-3">
            <select
              className="form-select"
              id="floatingManager"
              value={editManagerUsername}
              onChange={(e) => setEditManagerUsername(e.target.value)}
            >
              {dbData
                .filter(user =>
                  user.username !== selectedUser?.username &&
                  ['Owner', 'Manager', 'Manager & Member'].includes(user.position)
                )
                .map((manager) => (
                  <option key={manager.username} value={manager.username}>
                    {manager.nameInTeam}
                  </option>
                ))}
            </select>
            <label htmlFor="floatingManager">Manager</label>
          </div>



      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={isSubmitting}
          onClick={handleEditSubmit}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  </div>
</div>


          </div>    
        </div>
  )
}

export default SuperManageManager