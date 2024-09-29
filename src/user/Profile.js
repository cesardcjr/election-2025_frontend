import React from 'react'
import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Layout from '../components/Layout'
import UpdateProfile from './UpdateProfile';
import ResetPassword from './ResetPassword';

export default function Profile() {


    const [details, setDetails] = useState({})

    const updateProfileDetails = (newDetails) => {
        setDetails(newDetails);
    };

    useEffect(() => {

        fetch(`http://localhost:4000/users/details`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)

                if (typeof data.id !== undefined) {
                    setDetails(data);
                }
            })
    }, [])
    return (
        <Layout>
            <Container fluid>
                <Row className='mt-5'>
                    <Col md={3} sm={12}>

                    </Col>
                    <Col md={9} sm={12}>
                        <h1 style={{ color: '#5E17EB' }}><strong>My Account Details</strong></h1>
                        <h2><strong>{`${details.firstName} ${details.lastName}`}</strong></h2>
                        <h4>Contacts</h4>
                        <ul>
                            <li>Username: {details.username}</li>
                            <li>Mobile No: {details.mobileNo}</li>
                        </ul>
                        <UpdateProfile user={details} updateProfileDetails={updateProfileDetails} />
                        <ResetPassword user={details} />
                    </Col>
                </Row>
            </Container>
        </Layout>
    )
}