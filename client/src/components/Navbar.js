import { Link } from "react-router-dom";
import logo from './logo192.png';
import { useAuthContext } from "../hooks/useAuthContext";
import { useLogout } from "../hooks/useLogout";
import { use, useEffect, useState } from "react";
import { msmartAxios } from "../api/axios";
import { subscribePush } from "../utils/subscribePush";
import { usePWAInstallPrompt } from "../hooks/usePWAInstallPrompt";
import { usePushStatus } from "../context/PushStatusContext";

function Navbar() {

  const {logout} = useLogout()
  const {user} = useAuthContext()
  const { isSubscribed, loading, setIsSubscribed, setLoading } = usePushStatus();
  const [teamId, setTeamId] = useState(null);
  const { deferredPrompt, isInstalled } = usePWAInstallPrompt();

  const noTraining = ['27']

  const handleClick = () => {
    document.getElementById('hamburger').click()
    logout()
  }

  const handleLinkClick = () => {
    document.getElementById('hamburger').click()
  }

  const handleSubscribe = async () => {
    const result = await subscribePush(user);
    if (result.success) {
      if (result.success) {
        setIsSubscribed(true); // update context!
        alert("Subscribed to notifications 🔔");
        document.getElementById("closeSub").click();
        const delay = () => {
          document.getElementById("hamburger").click();
        }
        setTimeout(delay, 500)
      }      
    } else {
      alert("Failed to subscribe: " + result.error);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
  };
}

useEffect(() => {

  user &&  msmartAxios.get('/api/msmart/get/user/team', {headers: {
    accessToken: user.token
  }}).then((response) => {
    if(response.status === 201){
      setTeamId(response.data.teamId)
    }
  })

  
}, [user])  


  return(
<>
<div className="topnav">
        <div className='topnav-conteiner conteiner'>  
        <img alt='Mirads Marketing' className='logo' src={logo} height="40" />
        <input type="checkbox" name="" id="hamburger" />
          <div class="hamburger-lines">
              <span class="line line1"></span>
              <span class="line line2"></span>
              <span class="line line3"></span>
          </div>
          <div className="menu-items">
        {!user && (<>
          <Link to="/login" onClick={handleLinkClick}>Sign In</Link>
        </>)}
        {user && (<>
        <Link to="/" onClick={handleLinkClick}>Home</Link>
        <Link to="/msmart" onClick={handleLinkClick}>M-Smart</Link>
        <Link onClick={handleClick} to="/login">Logout ({user.username})</Link>
        {isInstalled && (<button type="button" data-bs-toggle="modal" data-bs-target="#exampleModal">
        <i class="bi bi-bell-fill"></i>
        </button>)}
        {!isInstalled && deferredPrompt && (
            <button onClick={handleInstallClick}>
              <i class="bi bi-cloud-arrow-down-fill"></i>
            </button>
        )}
        </>)}
        </div>
        </div>
      </div>

<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
<div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div className="text-end" style={{paddingTop:'10px', paddingRight:'10px'}}>
        <button id="closeSub" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body text-center m-3">
        <div><i className="bi bi-bell-fill" style={{fontSize:'3rem'}}></i></div>
      <div className="mb-3" style={{textTransform:'uppercase', fontSize:'1.5rem', fontWeight:'bolder'}}>Get notified</div>
        <div className="mb-3" style={{textTransform:'capitalize'}}>when you set a new follow-up reminder 👇</div>
        <div className="d-grid gap-2 mt-3">
          {loading ? (
            <button className="btn btn-secondary" disabled>Checking...</button>
          ) : isSubscribed ? (
            <button className="btn btn-outline-success" disabled><i className="bi bi-check-lg"></i> Subscribed</button>
          ) : (
            <button className="btn btn-dark" onClick={handleSubscribe}>Subscribe Now</button>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
      </>
)}

export default Navbar