import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import AdminMenu from '../components/AdminMenu';
import { Container, Row, Col, Table, Button, Spinner } from 'react-bootstrap';
import { TailSpin } from 'react-loader-spinner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAllVoters();
    }, []);

    const fetchAllVoters = () => {
        setLoading(true);
        fetch('http://192.168.3.92:4000/voters/all')
            .then((res) => {
                if (!res.ok) {
                    throw new Error('Failed to fetch voters');
                }
                return res.json();
            })
            .then((data) => {
                setVoters(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching voters:', error);
                setError(error.message);
                setLoading(false);
            });
    };

    // Barangay voter counts with color filters
    const barangays = ['BOROL 1ST', 'BOROL 2ND', 'DALIG', 'LONGOS', 'PANGINAY', 'PULONG GUBAT', 'SANTOL', 'SAN JUAN', 'WAWA'];

    const barangayColors = barangays.map(barangay => {
        return {
            barangay: barangay,
            totalVoters: voters.filter(voter => voter.barangay === barangay).length,
            redVoters: voters.filter(voter => voter.barangay === barangay && voter.color === 'RED').length,
            blueVoters: voters.filter(voter => voter.barangay === barangay && voter.color === 'BLUE').length,
            yellowVoters: voters.filter(voter => voter.barangay === barangay && voter.color === 'YELLOW').length
        };
    });

    const totalVoters = voters.length;
    const redVoters = voters.filter(voter => voter.color === 'RED').length;
    const blueVoters = voters.filter(voter => voter.color === 'BLUE').length;
    const yellowVoters = voters.filter(voter => voter.color === 'YELLOW').length;

    const pieData = {
        labels: barangayColors.map(b => b.barangay),
        datasets: [
            {
                label: 'Voters per Barangay',
                data: barangayColors.map(b => b.totalVoters),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FFCD56',
                    '#C9CBCF',
                    '#4D5360',
                ],
                hoverBackgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FFCD56',
                    '#C9CBCF',
                    '#4D5360',
                ]
            }
        ]
    };

    const generatePDF = () => {
        const input = document.getElementById('reportContent');
        html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
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
                                                <th>Total <span style={{ color: "red", fontWeight: "bold" }}>RED</span> Voters</th>
                                                <th>Total <span style={{ color: "blue", fontWeight: "bold" }}>BLUE</span> Voters</th>
                                                <th>Total <span style={{ color: "yellow", fontWeight: "bold" }}>YELLOW</span> Voters</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {barangayColors.map(({ barangay, totalVoters, redVoters, blueVoters, yellowVoters }) => (
                                                <tr key={barangay}>
                                                    <td>{barangay}</td>
                                                    <td>{totalVoters}</td>
                                                    <td>{redVoters}</td>
                                                    <td>{blueVoters}</td>
                                                    <td>{yellowVoters}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    <h1 style={{ color: '#5E17EB' }}>
                                        <strong>Municipal Voter's Dashboard</strong>
                                    </h1>

                                    <div id="reportContentBarangay">
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Category</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>Total Voters</td>
                                                    <td>{totalVoters}</td>
                                                </tr>
                                                <tr>
                                                    <td>Red Voters</td>
                                                    <td>{redVoters}</td>
                                                </tr>
                                                <tr>
                                                    <td>Blue Voters</td>
                                                    <td>{blueVoters}</td>
                                                </tr>
                                                <tr>
                                                    <td>Yellow Voters</td>
                                                    <td>{yellowVoters}</td>
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>

                                <Button variant="primary" onClick={generatePDF} className="mt-3">
                                    Download Report as PDF
                                </Button>
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </Layout >
    );
}
