import React, { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const VoterList = ({ searchResults }) => {
    const [voters, setVoters] = useState([]); // State to store voters
    const [loading, setLoading] = useState(true); // Loading state to handle spinner
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const votersPerPage = 25; // Number of voters to display per page
    const [showModal, setShowModal] = useState(false); // Modal visibility state
    const [selectedVoter, setSelectedVoter] = useState(null); // Currently selected voter for editing
    const [voterData, setVoterData] = useState({}); // Voter data to edit
    const [saving, setSaving] = useState(false); // State to track saving process

    useEffect(() => {

        if (searchResults && searchResults.length > 0) {
            setVoters(searchResults);
            setLoading(false);
        } else {
            fetchAllVoters();
        }
    }, [searchResults]);

    const fetchAllVoters = () => {
        setLoading(true); // Show the loader
        fetch('http://localhost:4000/voters/all')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch voters');
                }
                return res.json();
            })
            .then((data) => {
                setVoters(data);
                setLoading(false); // Stop loading once data is fetched
            })
            .catch((error) => {
                console.error('Error fetching voters:', error);
                setError(error.message);
                setLoading(false); // Stop loading if an error occurs
            });
    };

    // Calculate the total number of pages
    const totalPages = Math.ceil(voters.length / votersPerPage);

    // Calculate the start and end index for the current page
    const startIndex = (currentPage - 1) * votersPerPage;
    const endIndex = startIndex + votersPerPage;
    const currentVoters = voters.slice(startIndex, endIndex);

    // Handle clicking on the pagination buttons
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleFirstPage = () => {
        setCurrentPage(1);
    };

    const handleLastPage = () => {
        setCurrentPage(totalPages);
    };

    // Open Modal and populate voter data
    const handleEditClick = (voter) => {
        setSelectedVoter(voter);
        setVoterData({ ...voter }); // Clone the voter data for editing
        setShowModal(true);
    };

    // Handle input change in the modal form
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validate MM-DD-YYYY format
        if (name === 'birthday') {
            const isValidDate = /^\d{2}-\d{2}-\d{4}$/.test(value);
            if (!isValidDate) {
                console.log("Invalid date format, please use MM-DD-YYYY");

            } else {
                console.log("Valid date");
            }
        }
        setVoterData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSaveChanges = async () => {
        setSaving(true); // Set saving state to true
        const token = localStorage.getItem('token'); // Get token from localStorage

        if (!token) {
            Swal.fire({
                title: "Error",
                icon: "error",
                text: "No authentication token found. Please log in.",
            });
            setSaving(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/voters/${selectedVoter._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send the token in Authorization header
                },
                body: JSON.stringify(voterData),
            });

            if (!response.ok) {
                throw new Error('Failed to update voter details');
            }

            const result = await response.json();

            if (result === true) {
                setVoters((prevVoters) =>
                    prevVoters.map((voter) =>
                        voter._id === selectedVoter._id ? voterData : voter
                    )
                );
                Swal.fire({
                    title: "Success!",
                    icon: "success",
                    text: "Voter information has been updated successfully!",
                });
            } else {
                Swal.fire({
                    title: "Error",
                    icon: "error",
                    text: "Failed to update voter details. Please try again.",
                });
            }
        } catch (error) {
            console.error('Error updating voter:', error);
            Swal.fire({
                title: "Error",
                icon: "error",
                text: error.message || "An error occurred while updating voter details",
            });
        } finally {
            setSaving(false); // Reset saving state
            setShowModal(false); // Close the modal after saving
        }
    };



    return (
        <>
            <div className='d-flex justify-content-between mb-2'>
                <h2 style={{ color: '#5E17EB' }}><strong>Voter's List</strong></h2>
                <h2 style={{ color: '#5E17EB', fontWeight: 'bold' }}>Total Voters Count: {voters.length}</h2>
            </div>

            <div className='result_window mb-3'>

                {loading ? (
                    // Show the TailSpin spinner while loading
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5%', marginBottom: '5%' }}>
                        <TailSpin height="80" width="80" color="blue" ariaLabel="loading" />
                    </div>
                ) : error ? (
                    <p>Error fetching voters: {error}</p>
                ) : voters.length === 0 ? (
                    <p>No voters found</p>
                ) : (
                    <>
                        <table cellPadding="10" cellSpacing="0">
                            <thead>
                                <tr className='table_header'>
                                    <th>Precinct Number</th>
                                    <th>Full Name</th>
                                    <th>Address</th>
                                    <th>Barangay</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentVoters.map((voter) => (
                                    <tr key={voter._id}>
                                        <td>{voter.precint_number}</td>
                                        <td>{voter.fullname}</td>
                                        <td>{voter.address}</td>
                                        <td>{voter.barangay}</td>
                                        <td>
                                            <Button id='edit_button' variant="outline-primary" onClick={() => handleEditClick(voter)}>Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div style={{ marginTop: '20px' }} className='text-center mb-3'>
                            <Button variant="info" className='mx-2' onClick={handleFirstPage} disabled={currentPage === 1}>
                                {'<<'} First
                            </Button>
                            <Button variant="info" className='mx-2' onClick={handlePreviousPage} disabled={currentPage === 1}>
                                Previous
                            </Button>
                            <span style={{ margin: '0 20px' }}>Page {currentPage} of {totalPages}</span>
                            <Button variant="info" className='mx-2' onClick={handleNextPage} disabled={currentPage === totalPages}>
                                Next
                            </Button>
                            <Button variant="info" className='mx-2' onClick={handleLastPage} disabled={currentPage === totalPages}>
                                Last {'>>'}
                            </Button>
                        </div>
                    </>
                )}

                {/* Modal for Editing Voter */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Edit Voter</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group>
                                <Form.Label>Precinct Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="precint_number"
                                    value={voterData.precint_number || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Clustered Precinct</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="clustered_precint"
                                    value={voterData.clustered_precint || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullname"
                                    value={voterData.fullname || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={voterData.address || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Birthday</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="birthday"
                                    value={voterData.birthday || ''}
                                    onChange={handleInputChange}
                                    placeholder="MM-DD-YYYY"
                                    pattern="\d{2}-\d{2}-\d{4}" // Ensures format MM-DD-YYYY
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contact_number"
                                    value={voterData.contact_number || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="category"
                                    value={voterData.category || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Category</option>
                                    <option value="GREEN">Senior Citizen</option>
                                    <option value="RED">PWD</option>
                                    <option value="YELLOW">Illiterate</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Barangay</Form.Label>
                                <Form.Control
                                    as="select" // Change to select type
                                    name="barangay"
                                    value={voterData.barangay || ''} // The selected value
                                    onChange={handleInputChange} // Handle change
                                >
                                    <option value="">Select Barangay</option>
                                    <option value="Borol 1st">Borol 1st</option>
                                    <option value="Borol 2nd">Borol 2nd</option>
                                    <option value="Dalig">Dalig</option>
                                    <option value="Longos">Longos</option>
                                    <option value="Panginay">Panginay</option>
                                    <option value="Pulong Gubat">Pulong Gubat</option>
                                    <option value="San Juan">San Juan</option>
                                    <option value="Santol">Santol</option>
                                    <option value="Wawa">Wawa</option>
                                </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Referred By</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="referred_by"
                                    value={voterData.referred_by || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Color</Form.Label>
                                <Form.Control
                                    as="select" // Change to select type
                                    name="color"
                                    value={voterData.color || ''} // The selected value
                                    onChange={handleInputChange} // Handle change
                                >
                                    <option value="">Select Color</option>
                                    <option value="GREEN">GREEN</option>
                                    <option value="RED">RED</option>
                                    <option value="YELLOW">YELLOW</option>
                                </Form.Control>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveChanges} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
};

export default VoterList;
