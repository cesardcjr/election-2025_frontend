import { useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import UserContext from '../UserContext';
import Swal from 'sweetalert2';

export default function Logout() {

    const { unsetUser, setUser } = useContext(UserContext);
    unsetUser();
    useEffect(() => {

        setUser({
            id: null,
            isAdmin: null
        });
        Swal.fire({
            title: "Logout",
            icon: "success",
            text: "Logged out Successfully!"
        })
    })

    return (

        <Navigate to="/login" />
    )
}