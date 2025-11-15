import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from './hooks/useAuthContext';
import { useValidContext } from './hooks/useValidContext';

export const ProtectedRoute = () => {
    const { user} = useAuthContext();
    const { valid } = useValidContext();
    return user ? (valid ? <Outlet /> : <Navigate to="/auth" replace />) : <Navigate to="/login" replace />;
};