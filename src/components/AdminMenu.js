import { NavLink } from "react-router-dom";
import { ListGroup } from "react-bootstrap";

export default function AdminMenu() {

    return (
        <ListGroup defaultActiveKey="#link1">
            <ListGroup.Item action href="/userList" >
                List of Registered Users
            </ListGroup.Item>
            <ListGroup.Item action href="/dashboard">
                Barangay Voter's Dashboard
            </ListGroup.Item>
            <ListGroup.Item action href="/audit">
                Audit Trail History
            </ListGroup.Item>
        </ListGroup>
    )
}