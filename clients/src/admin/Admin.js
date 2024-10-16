import React, { useState, useEffect } from 'react';
import './Admin.css';

const Admin = () => {
  const [employees, setEmployees] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('employees');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const correctUsername = 'admin';
  const correctPassword = 'admin';

  const handleLogin = () => {
    if (username === correctUsername && password === correctPassword) {
      setIsLoggedIn(true);
    } else {
      alert('Incorrect username or password');
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetch('http://localhost:8081/api/users')
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error('Network response was not ok.');
          }
        })
        .then(data => {
          const employeesData = data.filter(user => user.userType === 'Employee');
          const employersData = data.filter(user => user.userType === 'Employer');
          setEmployees(employeesData);
          setEmployers(employersData);
        })
        .catch(error => {
          console.error('Error fetching data:', error);
          setError(error.message);
        });
    }
  }, [isLoggedIn]);

  const handleProgressChange = (id, newProgressId, userType) => {
    fetch(`http://localhost:8081/api/users/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ progressId: newProgressId }),
    })
      .then(response => {
        if (response.ok) {
          if (userType === 'Employee') {
            setEmployees(prevState =>
              prevState.map(emp =>
                emp.id === id ? { ...emp, progressId: newProgressId } : emp
              )
            );
          } else {
            setEmployers(prevState =>
              prevState.map(emp =>
                emp.id === id ? { ...emp, progressId: newProgressId } : emp
              )
            );
          }
        } else {
          throw new Error('Failed to update progress: ' + response.statusText);
        }
      })
      .catch(error => console.error('Error updating progress:', error));
  };

  const deleteRejected = () => {
    fetch('http://localhost:8081/api/users/rejected', {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          setEmployees(prevState => prevState.filter(emp => emp.progressId !== 2));
          setEmployers(prevState => prevState.filter(emp => emp.progressId !== 2));
        } else {
          throw new Error('Failed to delete rejected applicants: ' + response.statusText);
        }
      })
      .catch(error => console.error('Error deleting rejected applicants:', error));
  };

  const viewProfile = (user) => {
    fetch(`http://localhost:8081/api/users/${user.id}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to fetch user details');
        }
      })
      .then(data => {
        setSelectedUser({ ...user, ...data });
        setShowModal(true);
      })
      .catch(error => {
        console.error('Error fetching user details:', error);
        setError('Failed to fetch user details');
      });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const acceptUser = () => {
    if (selectedUser) {
      handleProgressChange(selectedUser.id, 1, selectedUser.userType);
      closeModal();
    }
  };

  const rejectUser = () => {
    if (selectedUser) {
      handleProgressChange(selectedUser.id, 2, selectedUser.userType);
      closeModal();
    }
  };

  return (
    <div className="admin-container">
      {!isLoggedIn ? (
        <div className="login-form">
          <h2>Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <>
          <div className="admin-header">
            <h1>Admin Dashboard</h1>
          </div>

          <button onClick={deleteRejected}>Delete All Rejected Applicants</button>

          {error && <p>Error: {error}</p>}

          <div className="tabs">
            <button
              className={activeTab === 'employees' ? 'active' : ''}
              onClick={() => setActiveTab('employees')}
            >
              Employees
            </button>
            <button
              className={activeTab === 'employers' ? 'active' : ''}
              onClick={() => setActiveTab('employers')}
            >
              Employers
            </button>
          </div>

          {activeTab === 'employees' && (
            <div>
              <h2>Employees</h2>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>
                        <select
                          value={employee.progressId || ''}
                          onChange={(e) => handleProgressChange(employee.id, parseInt(e.target.value), 'Employee')}
                        >
                          <option value={1}>Active</option>
                          <option value={2}>Inactive</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => viewProfile(employee)}>View Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'employers' && (
            <div>
              <h2>Employers</h2>
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.map(employer => (
                    <tr key={employer.id}>
                      <td>{employer.id}</td>
                      <td>{employer.firstName} {employer.lastName}</td>
                      <td>
                        <select
                          value={employer.progressId || ''}
                          onChange={(e) => handleProgressChange(employer.id, parseInt(e.target.value), 'Employer')}
                        >
                          <option value={1}>Active</option>
                          <option value={2}>Inactive</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => viewProfile(employer)}>View Profile</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showModal && selectedUser && (
            <div className="modal-admin">
              <div className="modal-content-admin">
                <div className="profile-header">
                  <h2>{selectedUser.firstName} {selectedUser.lastName}'s Profile</h2>
                  {selectedUser.pictureUrl && (
                    <div className="profile-picture">
                      <img src={`http://localhost:8081/uploads/${selectedUser.pictureUrl}`} alt="Profile" />
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <p><strong>ID:</strong> {selectedUser.id}</p>
                  <p><strong>First Name:</strong> {selectedUser.firstName}</p>
                  <p><strong>Last Name:</strong> {selectedUser.lastName}</p>
                  <p><strong>Province:</strong> {selectedUser.province}</p>
                  <p><strong>Municipality:</strong> {selectedUser.municipality}</p>
                  <p><strong>Barangay:</strong> {selectedUser.barangay}</p>
                  <p><strong>Zip Code:</strong> {selectedUser.zipCode}</p>
                  <p><strong>Mobile Number:</strong> {selectedUser.mobileNumber}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Status:</strong> {selectedUser.progressId === 1 ? 'Active' : 'Inactive'}</p>
                  <p><strong>Resume:</strong> <a href={`http://localhost:8081/uploads/${selectedUser.resumeUrl}`} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                </div>
                <div className="modal-buttons">
                  <button onClick={acceptUser}>Accept</button>
                  <button onClick={rejectUser}>Reject</button>
                  <button onClick={closeModal}>Close</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Admin;
