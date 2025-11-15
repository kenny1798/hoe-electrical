import React from 'react';
import { useLogout } from '../../hooks/useLogout';

function AccAuthPage() {

  const {logout} = useLogout();

    const delay = () => {
      logout()
    }
    setTimeout(delay, 5000)



  return (
            <div className="row justify-content-center text-center">
              <div className="col-sm-8">
            <div class="alert alert-warning" role="alert">
            <h2 className="mt-4 font-weight-bold-display-4">Your subscription to this site has expired</h2>
                </div>
                </div>
                </div>
        )}

export default AccAuthPage