import { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import './AdminPasswordModal.css';

const AdminPasswordModal = () => {
  const { showPasswordModal, setShowPasswordModal, login } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!showPasswordModal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (!success) {
      setError('Invalid password');
      setPassword('');
    } else {
      setPassword('');
      setError('');
    }
  };

  const handleClose = () => {
    setShowPasswordModal(false);
    setPassword('');
    setError('');
  };

  return (
    <>
      <div className="adminModalOverlay" onClick={handleClose} />
      <div className="adminPasswordModal">
        <button className="adminCloseButton" onClick={handleClose}>
          ×
        </button>
        <h2 className="adminModalTitle">Admin Access</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password..."
            className="adminPasswordInput"
            autoFocus
          />
          {error && <p className="adminError">{error}</p>}
          <button type="submit" className="adminSubmitButton">
            Enter
          </button>
        </form>
      </div>
    </>
  );
};

export default AdminPasswordModal;
