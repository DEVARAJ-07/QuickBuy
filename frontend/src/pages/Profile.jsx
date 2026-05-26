import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import './Auth.css';

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const onChange = key => e => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('phone', form.phone);

    const result = await dispatch(updateProfile(fd));
    if (updateProfile.fulfilled.match(result)) {
      setMessage('Profile updated successfully.');
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <div className="auth-logo">👤</div>
          Profile
        </div>
        <h1 className="auth-title">Your Account</h1>
        <p className="auth-sub">Update your contact details and profile information.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                className="form-input"
                value={form.name}
                onChange={onChange('name')}
                placeholder="Your name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                className="form-input"
                value={form.email}
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-phone">Phone</label>
              <input
                id="profile-phone"
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={onChange('phone')}
                placeholder="10-digit phone number"
                maxLength={10}
              />
            </div>
          </div>

          {message && <p className="form-success">{message}</p>}
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="profile-update-btn">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
