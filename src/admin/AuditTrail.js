import React, { useEffect, useState } from 'react';
import { TailSpin } from 'react-loader-spinner';
import AdminMenu from '../components/AdminMenu';
import Layout from '../components/Layout';
import { Container, Row, Col } from 'react-bootstrap'; // Assuming you're using react-bootstrap

const AuditTrail = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch audit logs from the backend
        fetch('http://localhost:4000/audit/all', {
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

                        {/* Loading spinner or error handling */}
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5%', marginBottom: '5%' }}>
                                <TailSpin height="80" width="80" color="blue" ariaLabel="loading" />
                            </div>
                        ) : error ? (
                            <p>Error fetching audit logs: {error}</p>
                        ) : (
                            <table border="1" cellPadding="10" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Changes</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map((log) => (
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
                        )}
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
};

export default AuditTrail;
