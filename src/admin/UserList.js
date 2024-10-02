import React, { useState, useEffect } from "react";
import { Container, Row, Col, Table } from "react-bootstrap"; // Assuming you're using react-bootstrap
import Layout from "../components/Layout";
import AdminMenu from "../components/AdminMenu";
import DeleteUser from "./DeleteUser";

export default function UserList() {
    const [users, setUsers] = useState([]); // State to store the users
    const [loading, setLoading] = useState(true); // State to handle loading

    // Function to fetch user data from the API
    const fetchData = async () => {
        try {
            const response = await fetch(`http://localhost:4000/users/all`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            const data = await response.json(); // Parsing the JSON response
            setUsers(data); // Assuming the response contains a 'users' array
        } catch (error) {
            console.error("Error fetching users:", error); // Handling errors
        } finally {
            setLoading(false); // Stop loading after fetching
        }
    };

    // Fetch the user data when the component mounts
    useEffect(() => {
        fetchData();
    }, []);

    // If loading, show a loading message or spinner
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Layout>
            <Container fluid>
                <Row className='mt-5'>
                    <Col md={3} sm={12}>
                        <AdminMenu />
                    </Col>
                    <Col md={9} sm={12}>
                        <h1 style={{ color: '#5E17EB' }}>
                            <strong>List of Registered Users</strong>
                        </h1>

                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th className="text-center">ID</th>
                                    <th className="text-center">Name</th>
                                    <th className="text-center">Username</th>
                                    <th className="text-center">Mobile No.</th>
                                    <th colSpan={2} className="text-center">Access</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="text-center">{user._id}</td>
                                        <td className="text-center">{user.firstName} {user.lastName}</td>
                                        <td className="text-center">{user.username}</td>
                                        <td className="text-center">{user.mobileNo}</td>
                                        <td className={user.isAdmin ? "text-success" : "text-danger"}>
                                            {user.isAdmin ? "Admin" : "User"}
                                        </td>
                                        <td className="text-center">
                                            <DeleteUser userId={user._id} fetchData={fetchData} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}
