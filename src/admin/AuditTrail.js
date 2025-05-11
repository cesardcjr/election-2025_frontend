import React, { useEffect, useState } from 'react';
import { TailSpin } from 'react-loader-spinner';
import AdminMenu from '../components/AdminMenu';
import Layout from '../components/Layout';
import { Container, Row, Col, Button, Form } from 'react-bootstrap'; // Added Form for date input

const AuditTrail = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterDate, setFilterDate] = useState(''); // Date filter state
    const [filteredLogs, setFilteredLogs] = useState([]);
    const logsPerPage = 15;

    useEffect(() => {
        // Fetch audit logs from the backend
        fetch('http://192.168.100.74:4000/audit/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Token authentication
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setAuditLogs(data.auditTrails);
                    setFilteredLogs(data.auditTrails); // Initially set filteredLogs to all logs
                } else {
                    setError('Failed to retrieve audit logs');
                }
                setLoading(false);
            })
            .catch(err => {
                setError('Error fetching audit logs');
                setLoading(false);
            });
    }, []);

    // Handle date filter change
    const handleDateChange = (e) => {
        const selectedDate = e.target.value;
        setFilterDate(selectedDate);

        // Filter logs based on selected date
        if (selectedDate) {
            const filtered = auditLogs.filter(log => {
                const logDate = new Date(log.update_date).toISOString().split('T')[0];
                return logDate === selectedDate;
            });
            setFilteredLogs(filtered);
            setCurrentPage(1); // Reset to first page on new filter
        } else {
            setFilteredLogs(auditLogs); // If no date is selected, show all logs
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const indexOfLastLog = currentPage * logsPerPage;
    const indexOfFirstLog = indexOfLastLog - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

    // Pagination control functions
    const handleFirstPage = () => setCurrentPage(1);
    const handlePreviousPage = () => setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    const handleNextPage = () => setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    const handleLastPage = () => setCurrentPage(totalPages);

    return (
        <Layout>
            <Container fluid>
                <Row className="mt-5">
                    <Col md={3} sm={12}>
                        <AdminMenu />
                    </Col>
                    <Col md={9} sm={12}>
                        <h1 style={{ color: '#5E17EB' }}>
                            <strong>Audit Trail</strong>
                        </h1>

                        {/* Date filter input */}
                        <Form.Group controlId="filterDate">
                            <Form.Label>Select Date</Form.Label>
                            <Form.Control
                                type="date"
                                value={filterDate}
                                onChange={handleDateChange}
                            />
                        </Form.Group>

                        {/* Loading spinner or error handling */}
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5%', marginBottom: '5%' }}>
                                <TailSpin height="80" width="80" color="blue" ariaLabel="loading" />
                            </div>
                        ) : error ? (
                            <p>Error fetching audit logs: {error}</p>
                        ) : (
                            <>
                                <table border="1" cellPadding="10" cellSpacing="0">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Changes</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentLogs.map((log) => (
                                            <tr key={log._id}>
                                                <td>{log.updated_by}</td>
                                                <td>
                                                    {log.changes.map((change, index) => (
                                                        <div key={index}>
                                                            {`${log.updated_by} has updated ${change.field} from ${change.old_value} to ${change.new_value}`}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td>{new Date(log.update_date).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Pagination controls */}
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
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
};

export default AuditTrail;
