import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';

export const GuestRoute = () => {
    const { user } = useAuthContext();
    return user ? <Navigate to="/" replace /> : <Outlet />;
};
