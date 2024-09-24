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
        // Fetch voters when the component mounts or searchResults change
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
        setVoterData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handle saving the changes to the database
    const handleSaveChanges = async () => {
        setSaving(true); // Set saving state to true
        try {
            const response = await fetch(`http://localhost:4000/voters/${selectedVoter._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(voterData),
            });

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
                    text: "Please try again",
                });
            }
        } catch (error) {
            console.error('Error updating voter:', error);
            Swal.fire({
                title: "Error",
                icon: "error",
                text: "An error occurred while updating voter details",
            });
        } finally {
            setSaving(false); // Reset saving state
            setShowModal(false); // Close the modal after saving
        }
    };

    return (
        <>
            <h2 style={{ color: '#5E17EB' }} className="mb-2"><strong>Voter's List</strong></h2>
            <div className='result_window'>

                {loading ? (
                    // Show the TailSpin spinner while loading
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                        <TailSpin height="80" width="80" color="blue" ariaLabel="loading" />
                    </div>
                ) : error ? (
                    <p>Error fetching voters: {error}</p>
                ) : voters.length === 0 ? (
                    <p>No voters found</p>
                ) : (
                    <>
                        <table border="1" cellPadding="10" cellSpacing="0">
                            <thead>
                                <tr>
                                    <th>Precinct Number</th>
                                    <th>Clustered Precinct</th>
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
                                        <td>{voter.clustered_precint}</td>
                                        <td>{voter.fullname}</td>
                                        <td>{voter.address}</td>
                                        <td>{voter.barangay}</td>
                                        <td>
                                            <button id='edit_button' onClick={() => handleEditClick(voter)}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div style={{ marginTop: '20px' }}>
                            <button onClick={handleFirstPage} disabled={currentPage === 1}>
                                {'<<'} First
                            </button>
                            <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                                Previous
                            </button>
                            <span style={{ margin: '0 20px' }}>Page {currentPage} of {totalPages}</span>
                            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                                Next
                            </button>
                            <button onClick={handleLastPage} disabled={currentPage === totalPages}>
                                Last {'>>'}
                            </button>
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
                                    type="date"
                                    name="birthday"
                                    value={voterData.birthday || ''}
                                    onChange={handleInputChange}
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
                                    type="text"
                                    name="category"
                                    value={voterData.category || ''}
                                    onChange={handleInputChange}
                                />
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
