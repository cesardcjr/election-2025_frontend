import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

import Login from './user/Login';
import Logout from './user/Logout';
import Register from './user/Register';
import HomePage from './pages/Homepage';
import { UserProvider } from './UserContext';
import VoterList from './pages/VotersList';
import Profile from './user/Profile';

function App() {

  const [user, setUser] = useState({
    id: null,
    isAdmin: null
  });

  const unsetUser = () => {
    localStorage.clear();
    setUser({
      id: null,
      isAdmin: null
    });
  };

  useEffect(() => {
    fetch(`http://localhost:4000/users/details`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (typeof data._id !== "undefined") {
          setUser({
            id: data._id,
            isAdmin: data.isAdmin
          });
        } else {
          setUser({
            id: null,
            isAdmin: null
          });
        }
      })
      .catch(err => {
        console.error("Failed to fetch user details:", err);
        setUser({
          id: null,
          isAdmin: null
        });
      });
  }, []);

  // Protecting routes based on user authentication
  const ProtectedRoute = ({ element }) => {
    return user.id ? element : <Navigate to="/login" />;
  };

  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <Routes>
        <Route path='/' element={user.id ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={user.id ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user.id ? <Navigate to="/" /> : <Register />} />
        <Route path="/all" element={<ProtectedRoute element={<VoterList />} />} />
        <Route path="/logout" element={<ProtectedRoute element={<Logout />} />} />
        <Route path="/myProfile" element={<Profile />} />
      </Routes>
    </UserProvider>
  );
}

export default App;
