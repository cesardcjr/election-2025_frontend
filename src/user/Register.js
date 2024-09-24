import { useState, useEffect, useContext } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import UserContext from '../UserContext';
import Swal from 'sweetalert2'

export default function Register() {
    const { user } = useContext(UserContext);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [mobileNo, setMobileNo] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isActive, setIsActive] = useState(false);
    const navigate = useNavigate();

    function registerUser(e) {
        e.preventDefault();
        fetch('http://localhost:4000/users/register', {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                username: username,
                mobileNo: mobileNo,
                password: password
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data) {
                    Swal.fire({
                        title: "Registered Successfully!",
                        icon: "success",
                        text: "Please login to Access Website"
                    })
                        .then(() => {
                            navigate('/login')
                        })
                    setFirstName('');
                    setLastName('');
                    setUsername('');
                    setMobileNo('');
                    setPassword('');
                    setConfirmPassword('')
                } else {
                    Swal.fire({
                        title: "Error",
                        icon: "error",
                        text: "Please try again"
                    })
                }
            })
    }
    useEffect(() => {
        if ((firstName !== "" && lastName !== "" && username !== "" && mobileNo !== "" && password !== "" && confirmPassword !== "") && (password === confirmPassword) && (mobileNo.length === 11)) {
            setIsActive(true)
        } else {
            setIsActive(false)
        }
    }, [firstName, lastName, username, mobileNo, password, confirmPassword])

    return (
        <Layout>
            <div className="register">
                <Form onSubmit={(e) => registerUser(e)}>
                    <h1 className="mt-4 py-3 text-center" style={{ fontWeight: 'bold' }}>Create Your Free Account</h1>
                    <Form.Group>
                        <Form.Label style={{ fontWeight: 'bold' }}>First Name:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter First Name"
                            required
                            value={firstName}
                            onChange={e => { setFirstName(e.target.value) }}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label style={{ fontWeight: 'bold' }}>Last Name:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Last Name"
                            required
                            value={lastName}
                            onChange={e => { setLastName(e.target.value) }}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label style={{ fontWeight: 'bold' }}>Username:</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter Username"
                            required
                            value={username}
                            onChange={e => { setUsername(e.target.value) }}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label style={{ fontWeight: 'bold' }}>Mobile No:</Form.Label>
                        <Form.Control
                            type="number"
                            placeholder="Enter 11-digit No."
                            required
                            value={mobileNo}
                            onChange={e => { setMobileNo(e.target.value) }}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label style={{ fontWeight: 'bold' }}>Password: </Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter Password"
                            required
                            value={password}
                            onChange={e => { setPassword(e.target.value) }}
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label style={{ fontWeight: 'bold' }}>Confirm Password: </Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Confirm Password"
                            required
                            value={confirmPassword}
                            onChange={e => { setConfirmPassword(e.target.value) }}
                        />
                    </Form.Group>
                    {
                        isActive ?
                            <Button className="mt-3" variant="primary" type="submit" id="submitBtn" to="/login">Submit</Button>

                            :
                            <Button className="mt-3" variant="primary" type="submit" id="submitBtn" disabled>Submit</Button>
                    }
                </Form>
            </div>
        </Layout>
    )

}