import { createContext, useContext } from 'react';
import toast from 'react-hot-toast';
import { Fragment } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const notifyLoading = (msg) => toast.loading(msg);
    const notifySuccess = (msg, opts = {}) => toast.success(msg, opts);
    const notifyError = (msg, opts = {}) => toast.error(msg, opts);
    const notifyCustom = (msg, opts = {}) => toast(msg, opts);
  
    const notifyConfirm = (message, onConfirm, onCancel) => {
      toast(
        (t) => (
          <div>
            <div className="mb-2">{message}</div>
            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-sm btn-danger"
                onClick={() => {
                  toast.dismiss(t.id);
                  onCancel?.();
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-success"
                onClick={() => {
                  toast.dismiss(t.id);
                  onConfirm?.();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        ),
        {
          duration: 10000,
          position: 'bottom-right',
          style: {
            padding: '16px',
            borderRadius: '8px',
            background: '#fff',
            color: '#000',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            minWidth: '250px'
          }
        }
      );
    };
  
    return (
      <ToastContext.Provider value={{
        notifySuccess,
        notifyError,
        notifyLoading,
        notifyCustom,
        notifyConfirm
      }}>
        {children}
      </ToastContext.Provider>
    );
  };
  

export const useToast = () => useContext(ToastContext);
