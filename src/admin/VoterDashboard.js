import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AdminMenu from '../components/AdminMenu';
import { Container, Row, Col, Table, Button, Spinner } from 'react-bootstrap';
import { TailSpin } from 'react-loader-spinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Dashboard() {
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(true); // Loading state to handle spinner
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllVoters(); // Fetch voters when the component mounts
    }, []);

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

    // Example metrics
    const totalVoters = voters.length;
    const greenVoters = voters.filter(voter => voter.color === 'GREEN').length;
    const redVoters = voters.filter(voter => voter.color === 'RED').length;
    const yellowVoters = voters.filter(voter => voter.color === 'YELLOW').length;
    const borol1stVoters = voters.filter(voter => voter.barangay === 'BOROL 1ST').length;
    const borol2ndVoters = voters.filter(voter => voter.barangay === 'BOROL 2ND').length;
    const daligVoters = voters.filter(voter => voter.barangay === 'DALIG').length;
    const longosVoters = voters.filter(voter => voter.barangay === 'LONGOS').length;
    const panginayVoters = voters.filter(voter => voter.barangay === 'PANGINAY').length;
    const pulongGubatVoters = voters.filter(voter => voter.barangay === 'PULONG GUBAT').length;
    const santolVoters = voters.filter(voter => voter.barangay === 'SANTOL').length;
    const sanJuanVoters = voters.filter(voter => voter.barangay === 'SAN JUAN').length;
    const wawaVoters = voters.filter(voter => voter.barangay === 'WAWA').length;

    // Function to generate PDF
    const generatePDF = () => {
        const input = document.getElementById('reportContent');

        // Convert the content into an image using html2canvas
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save('voter_report.pdf');
        });
    };

    return (
        <Layout>
            <Container fluid>
                <Row className='mt-5'>
                    <Col md={3} sm={12}>
                        <AdminMenu />
                    </Col>
                    <Col md={9} sm={12}>
                        {/* Loading spinner or error handling */}
                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5%', marginBottom: '5%' }}>
                                <TailSpin height="80" width="80" color="blue" ariaLabel="loading" />
                            </div>
                        ) : error ? (
                            <p>Error fetching voters: {error}</p>
                        ) : (
                            <>
                                <div id="reportContent">
                                    <h1 style={{ color: '#5E17EB' }}>
                                        <strong>Barangay Voter's Dashboard</strong>
                                    </h1>
                                    <Table striped bordered hover>
                                        <thead>
                                            <tr>
                                                <th>Barangay</th>
                                                <th>Total Voters</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Total Voters</td>
                                                <td>{totalVoters}</td>
                                            </tr>
                                            <tr>
                                                <td>Borol 1st</td>
                                                <td>{borol1stVoters}</td>
                                            </tr>
                                            <tr>
                                                <td>Borol 2nd</td>
                                                <td>{borol2ndVoters}</td>
                                            </tr>
                                            <tr>
                                                <td>Dalig</td>
                                                <td>{daligVoters}</td>
                                            </tr>
                                            <tr>
                                                <td>Longos</td>
                                                <td>{longosVoters}</td>
                                            </tr>
                                            <tr>
                                                <td>Panginay</td>
                                                <td>{panginayVoters}</td>
                                            </tr>
                                            <tr>
                                                <td>Pulong Gubat</td>
                                                <td>{pulongGubatVoters}</td>
                                            </tr>
                                            <tr>
                                                <td>Santol</td>
                                                <td>{santolVoters}</td>
                                            </tr>
                                            <tr>
                                                <td>San Juan</td>
                                                <td>{sanJuanVoters}</td>
                                            </tr>
                                            <tr>
                                                <td>Wawa</td>
                                                <td>{wawaVoters}</td>
                                            </tr>
                                        </tbody>
                                    </Table>


                                    <h1 style={{ color: '#5E17EB' }}>
                                        <strong>Municipal Voter's Dashboard</strong>
                                    </h1>

                                    <div id="reportContentBarangay">
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Metric</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Total Voters</td>
                                                    <td>{totalVoters}</td>
                                                </tr>
                                                <tr>
                                                    <td>Green Voters (Senior Citizens)</td>
                                                    <td>{greenVoters}</td>
                                                </tr>
                                                <tr>
                                                    <td>Red Voters (PWD)</td>
                                                    <td>{redVoters}</td>
                                                </tr>
                                                <tr>
                                                    <td>Yellow Voters (Illiterate)</td>
                                                    <td>{yellowVoters}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>

                                {/* Button to Download PDF */}
                                <Button variant="primary" onClick={generatePDF} className="mt-3">
                                    Download Report as PDF
                                </Button>
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}
