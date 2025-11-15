import { useEffect, useContext } from "react";
import axios from "./api/axios";
import { ValidContext } from "./context/ValidContext";
import { useNavigate } from "react-router-dom";

const useAxiosInterceptor = () => {
    const { validator } = useContext(ValidContext);
    const navigate = useNavigate();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 403) {
                    alert("Subscription expired. Please renew.");
                    validator({ type: "LOGOUT" }); // Auto logout
                    navigate("/login"); // Redirect ke login page
                }
                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor); // Cleanup interceptor bila unmount
    }, [validator, navigate]); // Dependensi supaya effect ini hanya dijalankan bila `validator` atau `navigate` berubah

};

export default useAxiosInterceptor;
