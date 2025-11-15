import React, {useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';


function RightReserve() {

  const [open, setOpen] = useState(false);
  const onCloseModal = () => setOpen(false);
  
  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <div>
      <Modal open={open} onClose={onCloseModal} center classNames={{
          overlay: 'customOverlay',
          modal: 'customModal',
        }}>
      <div className='row'>
        <div className='col-lg-12 text-start'>
        <h4 className='my-4' style={{fontWeight:'bold', color:'red'}}>Copyright © 2025 Mirads Marketing. All rights reserved.</h4>

<p style={{fontSize:'0.9rem', textAlign:'justify', color:'red'}}>All content on this website, including text, images, graphics, audio files, and other materials, is the property of Mirads Marketing and is protected by copyright law. No part of this website may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the copyright owner, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.</p>


<p style={{fontSize:'0.9rem', textAlign:'justify', color:'red'}}>This website may contain links to external websites that are not provided or maintained by or in any way affiliated with Mirads Marketing. Please note that Mirads Marketing does not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>


        <br/>
        </div>
      </div>
      </Modal>
    </div>
  )
};

ReactDOM.createPortal(<RightReserve/>, document.getElementById('root'))

export default RightReserve