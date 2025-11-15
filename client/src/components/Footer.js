import React from 'react';
import logo from './logo192.png';

function Footer() {
  return (
    <div className='sticky-footer text-center'>
          <a href="/">
            <img src={logo} alt="BootstrapBrain Logo" height='30' />
          </a>
        <div class="text-center fs-7">
          &copy; 2025 all rights reserved.
        </div>
      </div>

  )
}

export default Footer