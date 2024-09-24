import { useContext } from "react";
import { Container, Nav, Navbar, Button } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import UserContext from "../UserContext";
import pslogo from "../images/pslogo.png";

export default function Header() {

	const { user } = useContext(UserContext);

	return (
		<>
			<Navbar id="navbar" expand="lg">
				<Container fluid>
					<Navbar.Brand href="#home"><img src={pslogo} style={{ width: '10%' }} /></Navbar.Brand>
					<Navbar.Toggle />
					<div id="header_title" className="text-white">ELECTION DATABASE MANAGEMENT SYSTEM</div>
					<Navbar.Collapse className="justify-content-end">
						<Nav.Link as={Link} to="/register"><Button variant="outline-warning mx-3">Register</Button> </Nav.Link>
						<Nav.Link as={Link} to="/login"><Button variant="outline-warning">Login</Button> </Nav.Link>
					</Navbar.Collapse>
				</Container>
			</Navbar>

		</>
	)
}