import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Swal from 'sweetalert2';


const UpdateProfile = ({ updateProfileDetails, user }) => {

    const [profileData, setProfileData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        mobileNo: user.mobileNo,
        username: user.username,
    });
    const [showModal, setShowModal] = useState(false);

    const openModal = () => {
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData({
            ...profileData,
            [name]: value,
        });
    };

    const handleUpdateProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const updatedData = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                mobileNo: profileData.mobileNo,
                username: profileData.username,
            };

            const response = await fetch('http://localhost:4000/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const updatedDetails = await response.json();
                updateProfileDetails(updatedDetails);

                Swal.fire('Success', 'Profile updated successfully!', 'success');
                closeModal();
            } else {
                Swal.fire('Error', 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };


    return (
        <>
            <Button className="my-3" size="lg" variant="outline-primary" onClick={openModal}>
                Edit Account
            </Button>
            <Modal show={showModal} onHide={closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Account Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <div className="mb-3">
                            <label htmlFor="firstName" className="form-label">
                                First Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="firstName"
                                name="firstName"
                                value={profileData.firstName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="lastName" className="form-label">
                                Last Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="lastName"
                                name="lastName"
                                value={profileData.lastName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="mobileNo" className="form-label">
                                Mobile Number
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="mobileNo"
                                name="mobileNo"
                                value={profileData.mobileNo}
                                onChange={handleInputChange}
                            />
                        </div>
                    </form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModal}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpdateProfile}>
                        Update Profile
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UpdateProfile;
