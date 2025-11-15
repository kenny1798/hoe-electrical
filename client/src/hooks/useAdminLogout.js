import { useAuthContext } from "./useAuthContext";

export const 
useAdminLogout = () => {

const {dispatch} = useAuthContext()

const logout = () => {
  return new Promise((resolve) => {
    localStorage.removeItem('adminToken');
    dispatch({ type: 'LOGOUT' });
    resolve(); // ini penting untuk .then berfungsi
  });
}

  return {logout}

}