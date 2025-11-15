import { Link, useNavigate } from "react-router-dom";
import logo from './logo192.png';
import { useAdminContext } from "../hooks/useAdminContext";
import { useAdminLogout } from "../hooks/useAdminLogout";

function AdminNav() {
  const navigate = useNavigate();
  const {logout} = useAdminLogout();
  const {admin} = useAdminContext();

  const handleClick = async () => {
    document.getElementById('hamburger').click();
    await logout();
    navigate('/admin/login');
  };

  const handleLinkClick = () => {
    document.getElementById('hamburger').click();
  };

  return (
    <>
      {admin && 
        <div className="topnav">
          <div className='topnav-conteiner conteiner'>
            <img alt='Mirads Marketing' className='logo' src={logo} height="40" />
            <input type="checkbox" name="" id="hamburger" />
            <div className="hamburger-lines">
              <span className="line line1"></span>
              <span className="line line2"></span>
              <span className="line line3"></span>
            </div>
            <div className="menu-items">
              <Link to="/admin" onClick={handleLinkClick}>Admin Panel</Link>
              <Link to="/admin/monitor/ranking" onClick={handleLinkClick}>RTM Monitor</Link>
              <button className="btn btn-outline-danger btn-sm mx-3" onClick={handleClick} >Logout</button>
            </div>
          </div>
        </div>
      }
    </>
  )
}

export default AdminNav;
