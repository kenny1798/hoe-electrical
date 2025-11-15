//Packages import
import React, {useState} from 'react';
import {useLocation, Navigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';
import { useValidContext } from './hooks/useValidContext';
import { useAdminContext } from './hooks/useAdminContext';
import { CookiesProvider } from 'react-cookie';
import { ToastProvider } from './context/ToastContext'; // path ikut project
import { Toaster } from 'react-hot-toast';


//Server
import Home from './pages/Home';
import Login from './pages/Login';
import AccAuth from './pages/AccAuth';
import Signup from './pages/Signup';
import Tools from './pages/Tools';
import Autocopy from './pages/Autocopy';
import ChangeEmail from './pages/ChangeEmail';
import Changepass from './pages/Changepass';
import Resetpass from './pages/Resetpass';
import Forgotpass from './pages/Forgotpass';
import Navbar from './components/Navbar';
import AdminNav from './components/AdminNav';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import Register from './pages/Register';

//Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminPanel from './pages/admin/AdminPanel';
import AdminUserList from './pages/admin/AdminUserList';
import AdminEditUser from './pages/admin/AdminEditUser';
import AdminMuRegister from './pages/admin/AdminMuRegister';
import AdminManagerRegister from './pages/admin/AdminManagerRegister';
import AdminMonitorAll from './pages/admin/AdminMonitorAll';
import AdminMonitorManager from './pages/admin/AdminMonitorManager';
import AdminMonitorTeam from './pages/admin/AdminMonitorTeam';

//Msmart
import Msmart from './pages/msmart/Msmart';
import JoinTeam from './pages/msmart/JoinTeam';
import Dashboard from './pages/msmart/Dashboard';
import ManageLeads from './pages/msmart/ManageLeads';
import CreateLead from './pages/msmart/CreateLead';
import SingleLeads from './pages/msmart/SingleLeads';
import FollowUp from './pages/msmart/FollowUp';
import StatSummary from './pages/msmart/StatSummary';
import LeadFormBuilder from './pages/msmart/LeadFormBuilder';
import PublicLeadForm from './pages/msmart/PublicLeadForm';

import JoinAsManager from './pages/msmart/manage/JoinAsManager';
import ManagerDashboard from './pages/msmart/manage/ManagerDashboard';
import ManageTeam from './pages/msmart/manage/ManageTeam';
import TeamActivity from './pages/msmart/manage/TeamActivity';
import SingleTeam from './pages/msmart/manage/SingleTeam';
import TeamFollowUp from './pages/msmart/manage/TeamFollowUp';
import ManagerLeadList from './pages/msmart/manage/ManagerLeadList';
import ManagerManageLeads from './pages/msmart/manage/ManagerManageLeads';
import ManagerFollowUp from './pages/msmart/manage/ManagerFollowUp';
import ManagerStatSummary from './pages/msmart/manage/ManagerStatSummary';
import TeamStatSummary from './pages/msmart/manage/TeamStatSummary';
import ManagerLeadFormBuilder from './pages/msmart/manage/ManagerLeadFormBuilder';

import CreateTeam from './pages/msmart/manage/supermanager/CreateTeam';
import SuperManageTeam from './pages/msmart/manage/supermanager/SuperManageTeam';
import SuperTeamActivity from './pages/msmart/manage/supermanager/SuperTeamActivity';
import SuperManageManager from './pages/msmart/manage/supermanager/SuperManageManager';
import SuperTeamFollowUp from './pages/msmart/manage/supermanager/SuperTeamFollowUp';
import SuperLeadsList from './pages/msmart/manage/supermanager/SuperLeadsList';
import SuperTeamStatSummary from './pages/msmart/manage/supermanager/SuperTeamStatSummary';


//MU
import Courses from './pages/mu/Courses';
import SingleCourse from './pages/mu/SingleCourse';
import Chapter from './pages/mu/Chapter';
import Lesson from './pages/mu/Lesson';
import Data from './pages/mu/Data';
import CompiledScript from './pages/mu/CompiledScript';
import Autocopyform from './pages/Autocopyform';
import MuMonitor from './pages/mu/MuMonitor';


function App() {

  const { user } = useAuthContext();
  const { valid } = useValidContext();
  const { admin } = useAdminContext();
  let location = useLocation();
  const [showNav, setShowNav] = useState(true);
  const [adminNav, setAdminNav] = useState(false);

  if(location.pathname === '/change-password'){
    location = '/'
  }


  return (
    <CookiesProvider>
      <ToastProvider>
    <div className='app-content'>
      {showNav ? <Navbar /> : null}
      {adminNav ? <AdminNav /> : null}
      <div className='content-wrapper'>
        <Routes>

          <Route path='/' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Home />}/>
          
          <Route path='*' element={<NotFound setNavbar={setShowNav} />} />
          

          <Route path='/login' element={user ? <Navigate to="/" state={{from: location}} replace /> : <Login/>  } />

          <Route path='/admin/create/member' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <Signup setNavbar={setShowNav} />}/>

          <Route path='/register/:teamId' element={user ? <Navigate to="/" state={{from: location}} replace /> : <Register setNavbar={setShowNav} />}/>

          <Route path='/forgot-password' element={user ? <Navigate to="/" state={{from: location}} replace /> : <Forgotpass/> } />

          <Route path='/reset-password/:token' element={user ? <Navigate to="/" state={{from: location}} replace /> : <Resetpass/> } />

          <Route path='/change-email' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && valid ? <Navigate to="/" state={{from: location}} replace /> : <ChangeEmail/> } />

          <Route path='/auth' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && valid ? <Navigate to="/" state={{from: location}} replace /> : user && !valid && <AccAuth/> } />

          <Route path='/tools' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Tools />} />

          <Route path='/mace' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Autocopy />} />

          <Route path='/mace/access' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Autocopyform />} />

          <Route path='/change-password' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Changepass />} />



          {/* M-SMART - Sales Person */}

          <Route path='/msmart' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Msmart />} />

          <Route path='/msmart/team/join' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <JoinTeam />} />

          <Route path='/msmart/dashboard/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Dashboard />} />

          <Route path='/msmart/db/create/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <CreateLead />} />

          <Route path='/msmart/db/manage/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <ManageLeads />} />

          <Route path='/msmart/db/followup/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <FollowUp />} />

          <Route path='/msmart/db/summary/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <StatSummary />} />

          <Route path='/msmart/db/form/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <LeadFormBuilder />} />

          <Route path='/form/:customUrl' element={ <PublicLeadForm setNavbar={setShowNav} />} />


          {/* M-SMART - Manager */}
          
          <Route path='/msmart/db/manage/:teamId/:id' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <SingleLeads />} />


          <Route path='/msmart/team/join/manager' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <JoinAsManager />} />

          <Route path='/msmart/team/dashboard/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <ManagerDashboard />} />

          <Route path='/msmart/team/manage/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <ManageTeam />} />
          
          <Route path='/msmart/team/activity/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <TeamActivity />} />
          
          <Route path='/msmart/team/summary/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <TeamStatSummary />} />

          <Route path='/msmart/team/followup/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <TeamFollowUp />} />

          <Route path='/msmart/team/leads/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <ManagerLeadList />} />

          <Route path='/msmart/manager/followup/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <ManagerFollowUp />} />

          <Route path='/msmart/manager/database/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <ManagerManageLeads />} />

          <Route path='/msmart/manager/summary/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <ManagerStatSummary />} />

          <Route path='/msmart/manager/form/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <ManagerLeadFormBuilder />} />


          {/* M-SMART - Admin */}

          <Route path='/msmart/team/manage/:teamId/:username' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <SingleTeam />} />

          <Route path='/msmart/team/admin/member/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <SuperManageTeam />} />

          <Route path='/msmart/team/admin/manager/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <SuperManageManager />} />
          
          <Route path='/msmart/team/admin/activity/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <SuperTeamActivity />} />

          <Route path='/msmart/team/admin/followup/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <SuperTeamFollowUp />} />

          <Route path='/msmart/team/admin/leads/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <SuperLeadsList />} />

          <Route path='/msmart/team/admin/summary/:teamId' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <SuperTeamStatSummary />} />


          {/* M-UNIVERSITY */}

          <Route path='/courses' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Courses />} />

          <Route path='/courses/manage' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <MuMonitor />} />
          
          <Route path='/courses/:course' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <SingleCourse />} />

          <Route path='/courses/:course/script' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <CompiledScript />} />

          <Route path='/courses/:course/:chapter' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Chapter />} />

          <Route path='/courses/:course/:chapter/:lesson' element={!user ? <Navigate to="/login" state={{from: location}} replace /> : user && !valid ? <Navigate to="/auth" state={{from: location}} replace /> : user && valid && <Lesson />} />



          {/* ADMIN */}
          
          <Route path='/admin/login' element={admin ? <Navigate to="/admin/" state={{from: location}} replace /> : <AdminLogin setNavbar={setShowNav} />} />

          <Route path='/admin/' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminPanel setNavbar={setShowNav} setAdminNav={setAdminNav}  />}  />
          
          <Route path='/admin/users' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminUserList setNavbar={setShowNav} setAdminNav={setAdminNav}  />} />

          <Route path='/admin/users/edit/:user' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminEditUser setNavbar={setShowNav} setAdminNav={setAdminNav}  />} />

          <Route path='/admin/register/mu' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminMuRegister setNavbar={setShowNav} setAdminNav={setAdminNav}  />} />

          <Route path='/admin/register/manager' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminManagerRegister setNavbar={setShowNav} setAdminNav={setAdminNav}  />} />

          <Route path='/admin/mu/data/:course' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <Data setNavbar={setShowNav} setAdminNav={setAdminNav}  />} />

          <Route path='/admin/create/team' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <CreateTeam setNavbar={setShowNav} setAdminNav={setAdminNav}  />} />

          <Route path='/admin/monitor/ranking' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminMonitorAll setNavbar={setShowNav} setAdminNav={setAdminNav}  />} />

          <Route path='/admin/monitor/team' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminMonitorTeam setNavbar={setShowNav} setAdminNav={setAdminNav}  />} />

          <Route path='/admin/monitor/manager' element={!admin ? <Navigate to="/admin/login" state={{from: location}} replace /> : <AdminMonitorManager setNavbar={setShowNav} setAdminNav={setAdminNav}  />} />

        </Routes>

        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

        </div>
        {showNav ? <Footer /> : null}
      
        </div>
        </ToastProvider>
        </CookiesProvider>
      
  );
}

export default App;
