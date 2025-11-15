import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { useValidContext } from "../hooks/useValidContext";

const ProtectedRoute = ({ children }) => {
    const { user } = useAuthContext();
    const { valid } = useValidContext();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user && !valid) {
        return <Navigate to="/auth" replace />;
    }

    return children;
};

export default ProtectedRoute;
