import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { Button, Col, Container, Form, ListGroup, Row } from "react-bootstrap";
import VoterList from "./VotersList";

export default function HomePage() {
    const [filteredVoters, setFilteredVoters] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedBarangay, setSelectedBarangay] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [voters, setVoters] = useState([]);

    useEffect(() => {
        // Fetch all voters when the component is mounted
        fetchAllVoters();
    }, []);

    const fetchAllVoters = () => {
        fetch(`http://localhost:4000/voters/all`)
            .then((res) => res.json())
            .then((data) => {
                setVoters(data); // Set the fetched voters to the state
                setFilteredVoters(data); // Set filteredVoters to display all initially
            });
    };

    // Handle category selection
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        filterVoters(category, selectedBarangay);
    };

    // Handle barangay selection
    const handleBarangaySelect = (barangay) => {
        setSelectedBarangay(barangay);
        filterVoters(selectedCategory, barangay);
    };

    // Combined filter by category and barangay
    const filterVoters = (category, barangay) => {
        let filtered = voters;

        if (category !== 'All') {
            filtered = filtered.filter((voter) => voter.category === category);
        }

        if (barangay) {
            filtered = filtered.filter((voter) => voter.barangay === barangay);
        }

        setFilteredVoters(filtered);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        // Search voters by fullname
        fetch(`http://localhost:4000/voters/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                fullname: searchQuery,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                setFilteredVoters(data);
            });
    };

    return (
        <Layout>
            <Container fluid className="mt-4">
                <Row>
                    <Col md={3}>
                        <h3 style={{ color: '#5E17EB' }} className="mt-3"><strong>Search Name:</strong></h3>
                        <Form className="search-bar" onSubmit={handleSearchSubmit}>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter voters name here..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </Form.Group>
                            <Form.Group className="mt-2">
                                <Button variant="primary" type="submit">
                                    Search
                                </Button>
                            </Form.Group>
                        </Form>

                        <h3 style={{ color: '#5E17EB' }} className="mt-3"><strong>Categories</strong></h3>
                        <ListGroup>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleCategorySelect('All')}
                                active={selectedCategory === 'All'}
                            >
                                All
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleCategorySelect('sc')}
                                active={selectedCategory === 'sc'}
                            >
                                Senior Citizens
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleCategorySelect('pwd')}
                                active={selectedCategory === 'pwd'}
                            >
                                PWD
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleCategorySelect('illiterate')}
                                active={selectedCategory === 'illiterate'}
                            >
                                Illiterate
                            </ListGroup.Item>
                        </ListGroup>

                        <h3 style={{ color: '#5E17EB' }} className="mt-3"><strong>Barangay</strong></h3>
                        <ListGroup>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('All')}
                                active={selectedBarangay === 'All'}
                            >
                                All
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('Borol 1st')}
                                active={selectedBarangay === 'Borol 1st'}
                            >
                                Borol 1st
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('Borol 2nd')}
                                active={selectedBarangay === 'Borol 2nd'}
                            >
                                Borol 2nd
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('Dalig')}
                                active={selectedBarangay === 'Dalig'}
                            >
                                Dalig
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('Longos')}
                                active={selectedBarangay === 'Longos'}
                            >
                                Longos
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('Panginay')}
                                active={selectedBarangay === 'Panginay'}
                            >
                                Panginay
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('Pulong Gubat')}
                                active={selectedBarangay === 'Pulong Gubat'}
                            >
                                Pulong Gubat
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('San Juan')}
                                active={selectedBarangay === 'San Juan'}
                            >
                                San Juan
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('Santol')}
                                active={selectedBarangay === 'Santol'}
                            >
                                Santol
                            </ListGroup.Item>
                            <ListGroup.Item
                                action
                                href="#"
                                onClick={() => handleBarangaySelect('Wawa')}
                                active={selectedBarangay === 'Wawa'}
                            >
                                Wawa
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>

                    <Col md={9}>
                        <VoterList searchResults={filteredVoters} />
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}
