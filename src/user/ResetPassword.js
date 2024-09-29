import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';

const ResetPassword = ({ user }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                text: 'Password does not match!',
            });
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:4000/users/{user._id}/reset-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ newPassword: password }),
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    text: 'Password successfully updated!',
                });
                setPassword('');
                setConfirmPassword('');
            } else {
                const errorData = await response.json();
                Swal.fire({
                    icon: 'error',
                    text: errorData.message || 'Failed to update password',
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                text: 'An error occurred. Please try again later.',
            });
        }
    };

    return (
        <div>
            <Button className="my-3" size="lg" variant="outline-primary" onClick={openModal}>
                Reset Password
            </Button>

            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Reset Password</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form onSubmit={handleResetPassword}>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">
                                New Password
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                className="form-control"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleResetPassword}>
                        Reset Password
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ResetPassword;
