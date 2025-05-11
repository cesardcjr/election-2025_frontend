import React, { useState, useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';

const VoterList = ({ searchResults }) => {
    const [voters, setVoters] = useState([]); // State to store voters
    const [loading, setLoading] = useState(true); // Loading state to handle spinner
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1); // Current page state
    const votersPerPage = 15; // Number of voters to display per page
    const [showModal, setShowModal] = useState(false); // Modal visibility state for editing
    const [showAddModal, setShowAddModal] = useState(false); // Modal visibility state for adding
    const [selectedVoter, setSelectedVoter] = useState(null); // Currently selected voter for editing
    const [voterData, setVoterData] = useState({}); // Voter data to edit
    const [saving, setSaving] = useState(false); // State to track saving process
    const [disabledVoterIds, setDisabledVoterIds] = useState([]);

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
        fetch('http://192.168.100.74:4000/voters/all')
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

    const totalPages = Math.ceil(voters.length / votersPerPage);
    const startIndex = (currentPage - 1) * votersPerPage;
    const endIndex = startIndex + votersPerPage;
    const currentVoters = voters.slice(startIndex, endIndex);

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

    // Open modal for editing voter
    const handleEditClick = (voter) => {
        setSelectedVoter(voter);
        setVoterData({ ...voter });
        setShowModal(true);
    };

    // Handle input change in forms
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setVoterData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Open modal for adding a new voter
    const handleAddClick = () => {
        setSelectedVoter(null);
        setVoterData({}); // Reset form data
        setShowAddModal(true); // Show add modal
    };

    const handleReceiveClick = async (voter) => {
        const token = localStorage.getItem('token');

        if (!token) {
            Swal.fire({
                title: "Error",
                icon: "error",
                text: "No authentication token found. Please log in.",
            });
            return;
        }

        const confirmed = await Swal.fire({
            title: `Are you sure?`,
            text: `Are you sure you want to mark ${voter.fullname} as RECEIVED?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
        });

        if (!confirmed.isConfirmed) {
            return; // User cancelled
        }

        // Disable the button for this voter
        setDisabledVoterIds(prev => [...prev, voter._id]);

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.userId;

        try {
            const response = await fetch(`http://192.168.100.74:4000/voters/${voter._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...voter, status: 'RECEIVED', updated_by: userId }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            setVoters((prevVoters) =>
                prevVoters.map((v) =>
                    v._id === voter._id ? { ...v, status: 'RECEIVED' } : v
                )
            );

            Swal.fire({
                title: "Success!",
                icon: "success",
                text: "Voter marked as RECEIVED.",
            });
        } catch (error) {
            console.error('Error updating voter status:', error);
            Swal.fire({
                title: "Error",
                icon: "error",
                text: error.message || "An error occurred while updating status",
            });
            // Re-enable the button on error
            setDisabledVoterIds(prev => prev.filter(id => id !== voter._id));
        }
    };


    const handleSaveChanges = async () => {
        setSaving(true);
        const token = localStorage.getItem('token');

        if (!token) {
            Swal.fire({
                title: "Error",
                icon: "error",
                text: "No authentication token found. Please log in.",
            });
            setSaving(false);
            return;
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.userId;

        try {
            let response;
            if (selectedVoter) {
                response = await fetch(`http://192.168.100.74:4000/voters/${selectedVoter._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ...voterData, updated_by: userId }),
                });
            } else {
                response = await fetch('http://192.168.100.74:4000/voters/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ ...voterData, updated_by: userId }),
                });
            }

            if (!response.ok) {
                throw new Error('Failed to save voter details');
            }

            const result = await response.json();
            if (result === true || result._id) {
                setVoters((prevVoters) =>
                    selectedVoter
                        ? prevVoters.map((voter) => (voter._id === selectedVoter._id ? voterData : voter))
                        : [...prevVoters, result]
                );

                Swal.fire({
                    title: "Success!",
                    icon: "success",
                    text: selectedVoter
                        ? "Voter information has been updated successfully!"
                        : "New voter has been added successfully!",
                });
            } else {
                throw new Error('Failed to save voter details');
            }
        } catch (error) {
            console.error('Error saving voter:', error);
            Swal.fire({
                title: "Error",
                icon: "error",
                text: error.message || "An error occurred while saving voter details",
            });
        } finally {
            setSaving(false);
            setShowModal(false);
            setShowAddModal(false); // Close add modal as well
        }
    };

    return (
        <>
            <div className='d-flex justify-content-between mb-2'>
                <h2 style={{ color: '#5E17EB' }}><strong>Voter's List</strong></h2>
                <Button variant="primary" onClick={handleAddClick}>
                    Add Voter
                </Button>
                <h2 style={{ color: '#5E17EB', fontWeight: 'bold' }}>Total Voters Count: {voters.length}</h2>
            </div>

            <div className='result_window mb-3'>
                {loading ? (
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
                                    <th>Status</th>
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
                                        <Button
                                            style={{ marginTop: '10px', marginLeft: '10px' }}
                                            variant="outline-success"
                                            onClick={() => handleReceiveClick(voter)}
                                            disabled={voter.status === 'RECEIVED'}
                                        >
                                            {voter.status === 'RECEIVED' ? 'Received' : 'Receive'}
                                        </Button>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

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
                        <Modal.Title>Edit Voter Information</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form
                            style={{
                                backgroundColor: (() => {
                                    if (voterData.is_printed == 'true') {
                                        return '#239b56';
                                    } else {
                                        return '#f4d03f';
                                    }
                                })(),
                                padding: '15px',
                                borderRadius: '5px'
                            }}
                        >
                            <Form.Group controlId="formPrecinctNumber">
                                <Form.Label>Precinct Number</Form.Label>
                                <Form.Control type="text" name="precint_number" value={voterData.precint_number || ''} readOnly />
                            </Form.Group>

                            <Form.Group controlId="formClusteredPrecinctNumber">
                                <Form.Label>Clustered Precinct Number</Form.Label>
                                <Form.Control type="text" name="clustered_precint" value={voterData.clustered_precint || ''} readOnly />
                            </Form.Group>

                            <Form.Group controlId="formVolunteerIDNumber">
                                <Form.Label>Volunteer ID No.</Form.Label>
                                <Form.Control type="text" name="volunteer_id" value={voterData.volunteer_id || ''} readOnly />
                            </Form.Group>

                            <Form.Group controlId="formFullName">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control type="text" name="fullname" value={voterData.fullname || ''} readOnly />
                            </Form.Group>

                            <Form.Group controlId="formBarangay">
                                <Form.Label>Barangay</Form.Label>
                                <Form.Select name="barangay" value={voterData.barangay || ''} onChange={handleInputChange}>
                                    <option value="">Select Barangay</option>
                                    <option value="BOROL 1ST">BOROL 1ST</option>
                                    <option value="BOROL 2ND">BOROL 2ND</option>
                                    <option value="DALIG">DALIG</option>
                                    <option value="LONGOS">LONGOS</option>
                                    <option value="PANGINAY">PANGINAY</option>
                                    <option value="PULONG GUBAT">PULONG GUBAT</option>
                                    <option value="SAN JUAN">SAN JUAN</option>
                                    <option value="SANTOL">SANTOL</option>
                                    <option value="WAWA">WAWA</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="formAddress">
                                <Form.Label>Address</Form.Label>
                                <Form.Control type="text" name="address" value={voterData.address || ''} onChange={handleInputChange} />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Birthday</Form.Label>
                                <Form.Control type="text" name="birthday" value={voterData.birthday || ''} onChange={handleInputChange} placeholder="MM-DD-YYYY" pattern="\d{2}-\d{2}-\d{4}" />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control type="text" name="contact_number" value={voterData.contact_number || ''} onChange={handleInputChange} />
                            </Form.Group>

                            <Form.Group controlId="formColor">
                                <Form.Label>Color</Form.Label>
                                <Form.Select name="color" value={voterData.color || ''} onChange={handleInputChange}>
                                    <option value="">Select Color</option>
                                    <option value="RED">RED</option>
                                    <option value="YELLOW">YELLOW</option>
                                    <option value="BLUE">BLUE</option>
                                    <option value="ORANGE">ORANGE</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Referred By</Form.Label>
                                <Form.Control type="text" name="referred_by" value={voterData.referred_by || ''} onChange={handleInputChange} />
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Remarks</Form.Label>
                                <Form.Control type="text" name="remarks" value={voterData.remarks || ''} onChange={handleInputChange} />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
                        <Button variant="primary" onClick={handleSaveChanges} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Modal.Footer>
                </Modal>


                {/* Modal for Adding Voter */}
                <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Add New Voter</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group controlId="formPrecinctNumber">
                                <Form.Label>Precinct Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="precint_number"
                                    value={voterData.precint_number || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>

                            <Form.Group controlId="formFullName">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="fullname"
                                    value={voterData.fullname || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>

                            <Form.Group controlId="formBarangay">
                                <Form.Label>Barangay</Form.Label>
                                <Form.Select
                                    name="barangay"
                                    value={voterData.barangay || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Barangay</option>
                                    <option value="BOROL 1ST">BOROL 1ST</option>
                                    <option value="BOROL 2ND">BOROL 2ND</option>
                                    <option value="DALIG">DALIG</option>
                                    <option value="LONGOS">LONGOS</option>
                                    <option value="PANGINAY">PANGINAY</option>
                                    <option value="PULONG GUBAT">PULONG GUBAT</option>
                                    <option value="SAN JUAN">SAN JUAN</option>
                                    <option value="SANTOL">SANTOL</option>
                                    <option value="WAWA">WAWA</option>

                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="formCategory">
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    name="category"
                                    value={voterData.category || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Category</option>
                                    <option value="PWD">PWD</option>
                                    <option value="Senior Citizen">Senior Citizen</option>
                                    <option value="Government Employee">Government Employee</option>
                                    <option value="Youth">Youth</option>
                                    <option value="Barangay Official">Barangay Official</option>

                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="formColor">
                                <Form.Label>Color</Form.Label>
                                <Form.Select
                                    name="color"
                                    value={voterData.color || ''}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Color</option>
                                    <option value="RED">RED</option>
                                    <option value="YELLOW">YELLOW</option>
                                    <option value="BLUE">BLUE</option>

                                </Form.Select>
                            </Form.Group>

                            <Form.Group controlId="formRemarks">
                                <Form.Label>Remarks</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="remarks"
                                    value={voterData.remarks || ''}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                            Close
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
