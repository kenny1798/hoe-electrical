import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import countries from '../components/country';
import Select from 'react-select';
import { msmartAxios } from '../api/axios';

function Register() {

  const {teamId} = useParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [managerName, setManagerName] = useState("");
  const [position, setPosition] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [teamName, setTeamName] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [succMsg, setSuccMsg] = useState("");
  const [open, setOpen] = useState(false);
  const [managers, setManagers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nav = useNavigate();


  const options = countries.map(country => ({
    value: country.dialCode,
    label: (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={country.flag} alt={country.name} style={{ width: '20px', marginRight: '5px' }} />
        {country.isoCode}
      </div>
    ),
    name: country.name,
    isoCode: country.isoCode,
  }));

  const managerOptions = managers.map(manager => ({
    value: manager.username,
    label: manager.nameInTeam,
  }));

  const positionOptions = [
    { value: 'Member', label: 'Salesperson/Agent (Close Sales Only)' },
    { value: 'Manager & Member', label: 'Team Leader (Manage Team & Close Sales)' },
    { value: 'Manager', label: 'Manager (Manage Team Only)' },
  ];

  const handleCountryChange = (option) => {
    setCountryCode(option.value);
  };

  const handleManagerChange = (option) => {
    setManagerName(option.value);
  };

  const handlePositionChange = (option) => {
    setPosition(option.value);
  }

  const filterOption = (option, inputValue) => {
    return (
      option.data.name.toLowerCase().includes(inputValue.toLowerCase()) || // Carian ikut nama
      option.data.isoCode.toLowerCase().includes(inputValue.toLowerCase()) // Carian ikut kod ISO
    );
  };

  const togglePassword = (e, password) => {
    e.preventDefault();
    const passwordInput = document.getElementById(password);
    const togglePassword = document.getElementById('togglePassword');
    if(passwordInput.type === 'password'){
      passwordInput.type = 'text';
      togglePassword.classList.remove('bi-eye');
      togglePassword.classList.add('bi-eye-slash');
    }else{
      passwordInput.type = 'password';
      togglePassword.classList.remove('bi-eye-slash');
      togglePassword.classList.add('bi-eye');
    }
  }

  useEffect(() => {
    if (countryCode) {
      const selectedCountry = options.find(option => option.value === countryCode);
      if (selectedCountry) {
        setCountryCode(selectedCountry);
      }
    }
  }, [countryCode]);

  useEffect(() => {

    msmartAxios.get(`/api/msmart/get/team/${teamId}`).then((response) =>{
      const json = response.data;
      if(response.status === 201){
        setTeamName(json.team.teamName);
        setManagers(json.manager);
      }
      console.log(json)
    }).catch((err) => {
      console.log(err)
    })

  }, [teamId])

  const handleSubmit = (e) => {
    setIsSubmitting(true); // Set loading to true
    setErrMsg("");
    setSuccMsg("");
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setErrMsg("");
    setSuccMsg("");
    const data = {username: username, password: password, confirmPassword: confirmPassword, name: name, email: email, managerName: managerName, phoneNumber: countryCode.value + phoneNumber, position: position};

    msmartAxios.post(`/api/msmart/register/user/${teamId}`, data).then((response) => {
      if (response.status === 200) {
        setSuccMsg(response.data.success);
        const delay = () => {
          nav('/login');
        }

        setTimeout(delay, 2000)
      }
 
      if(response.status === 400){
        setErrMsg(response.data.error)
      }
    }).catch((err) => {
      setErrMsg(err.response.data.error)
    }).finally(() => {
      setIsSubmitting(false);
    })
  }

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    // Hanya benarkan huruf, nombor, dan underscore (_)
    const filteredValue = value.replace(/[^a-zA-Z0-9_]/g, "");
    setUsername(filteredValue);
  };



  return (
    <div className='App'>
    <div className="container mt-3">
      <div className="row justify-content-center text-center">
        <div className="col-lg-12">
        <h1 className="mt-4 header-title">REGISTER</h1>
        <h6 style={{textTransform: 'uppercase', color:'grey'}}>{teamName}</h6>
        </div>
        <div class="row justify-content-center text-start mt-3">

  <div class="col-sm-6">
  {succMsg && (<div class="alert alert-success" role="alert"> {succMsg} </div>)}
        {errMsg && (<div class="alert alert-danger" role="alert"> {errMsg} </div>)}
    <div className='card'>
      <div className='card-body'>
        <form onSubmit={handleSubmit}>

          <p>
          <label>Username</label>
          <input type="text" name='username' className="form-control shadow-none" onChange={handleUsernameChange} value={username} required/>
          </p>

          <p>
          <label>Name</label>
          <input type="text" name='name' className="form-control shadow-none" onChange={(e) => setName(e.target.value)} required/>
          </p>

          <p>
          <label>Password</label>
          <input type="password" id='password' className="form-control shadow-none" onChange={(e) => setPassword(e.target.value)} required/>
          <i className='bi bi-eye' id='togglePassword' onClick={(e) => togglePassword(e, 'password')}></i>
          </p>
          
          <p>
          <label>Confirm Password</label>
          <input type="password" className="form-control shadow-none" onChange={(e) => setConfirmPassword(e.target.value)} required/>
          </p>

          <p>
          <label>Manager</label>
          <Select 
        options={managerOptions}
        onChange={handleManagerChange}
        required
      />
          </p>
          
          <p>
          <label>Job Scope</label>
          <Select 
        options={positionOptions}
        onChange={handlePositionChange}
        required
      />
          </p>
          
          <p>
          <label>Email</label>
          <input type="email" name='email' className="form-control shadow-none" onChange={(e) => setEmail(e.target.value)} required/>
          </p>

          <p>
          <label>Phone Number</label>
          <div className='input-group'>
          <div class="input-group-text">
      <Select 
        options={options}
        onChange={handleCountryChange}
        filterOption={filterOption}
        value={countryCode}
        required
      />
      </div>
      <input type="text" name='phoneNumber' class="form-control shadow-none" onChange={(e) => setPhoneNumber(e.target.value)} required/>
    </div>
    {countryCode && <span className='mx-2'>Country: {countryCode.value + phoneNumber}</span>}
          </p>

          <div className='d-grid my-3'>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? <div class="spinner-border" role="status">
                      <span class="visually-hidden">Registering User...</span>
                    </div> : "Register"}</button>
          </div>

          

        </form>
      </div>
      </div>
      </div>
      </div>
        </div>
        </div>
        </div>
  )
}

export default Register