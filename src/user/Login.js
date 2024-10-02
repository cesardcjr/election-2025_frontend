import { useState, useEffect, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import UserContext from '../UserContext';
import Layout from '../components/Layout';

export default function Login() {
    const { user, setUser } = useContext(UserContext);
    const [username, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isActive, setIsActive] = useState(true);
    const navigate = useNavigate();

    function authenticate(e) {
        e.preventDefault();
        fetch('http://localhost:4000/users/login', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(res => res.json())
            .then(data => {
                if (typeof data.access !== "undefined") {
                    // Save the token in localStorage
                    localStorage.setItem('token', data.access);
                    retrieveUserDetails(data.access);
                } else {
                    Swal.fire({
                        title: "Authentication Failed",
                        icon: "error",
                        text: "Please check your username and password"
                    });
                }
            });

        setUserName('');
        setPassword('');
    }

    const retrieveUserDetails = (token) => {
        fetch('http://localhost:4000/users/details', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setUser({
                    id: data._id,
                    isAdmin: data.isAdmin,
                    access: token
                });

                // After setting user details, redirect based on admin status
                Swal.fire({
                    title: "Authentication Success",
                    icon: "success",
                    text: "Logged-in Successfully!"
                })
                    .then(() => {
                        if (data.isAdmin) {
                            navigate('/userList'); // Redirect to user list if admin
                        } else {
                            navigate('/'); // Redirect to home page if not admin
                        }
                    });
            });
    }

    useEffect(() => {
        // Check if username and password are not empty
        if (username !== '' && password !== '') {
            setIsActive(true);
        } else {
            setIsActive(false);
        }
    }, [username, password]);

    return (
        <Layout>
            <div className='login'>
                <Form onSubmit={(e) => authenticate(e)}>
                    <h1 className="my-5 text-center" style={{ fontWeight: 'bold' }}>Login</h1>
                    <Form.Group controlId="username">
                        <Form.Label style={{ fontWeight: 'bold' }}>Username</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group controlId="password">
                        <Form.Label style={{ fontWeight: 'bold' }}>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    {isActive ?
                        <Button className="mt-3" variant="primary" type="submit">
                            Submit
                        </Button>
                        :
                        <Button className="mt-3" variant="danger" type="submit" disabled>
                            Submit
                        </Button>
                    }
                </Form>
            </div>
        </Layout>
    );
}
