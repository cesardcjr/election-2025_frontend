import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

import Login from './user/Login';
import Register from './user/Register';
import HomePage from './pages/Homepage';
import { UserProvider } from './UserContext';
import VoterList from './pages/VotersList';

function App() {

  const [user, setUser] = useState({
    id: null,
    isAdmin: null
  })
  const unsetUser = () => {
    localStorage.clear();
  }

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
          })
        } else {
          setUser({
            id: null,
            isAdmin: null
          })
        }
      })
  }, [user])
  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/all" element={<VoterList />} />

      </Routes>

    </UserProvider>
  );
}

export default App;
