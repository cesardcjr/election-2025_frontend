import React from "react";
import { Button } from "react-bootstrap"; // Assuming you're using Bootstrap
import Swal from "sweetalert2"; // Import SweetAlert2

export default function DeleteUser({ userId, fetchData }) {
    const handleDelete = async () => {

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:4000/users/deleteUser`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ userId }), // Send the userId in the request body
                });

                const responseData = await response.json();
                if (responseData === true) {
                    Swal.fire({
                        title: 'Deleted!',
                        text: 'User has been deleted.',
                        icon: 'success',
                    });
                    fetchData(); // Refresh the user list after deletion
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: 'Could not delete the user.',
                        icon: 'error',
                    });
                }
            } catch (error) {
                console.error("Error deleting user:", error);
                Swal.fire({
                    title: 'Error!',
                    text: 'An error occurred while trying to delete the user.',
                    icon: 'error',
                });
            }
        }
    };

    return (
        <Button variant="danger" onClick={handleDelete}>
            Delete
        </Button>
    );
}
