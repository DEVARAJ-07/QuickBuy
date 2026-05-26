import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { loginUser } from '../store/slices/authSlice';
import './Auth.css';

export default function Login() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm]   = useState({ email: '', password: '' });
  const [show, setShow]   = useState(false);

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(res)) navigate('/');
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-brand"><div className="auth-logo"><Zap size={20}/></div>Quick<span>Buy</span></div>
        <h1 className="auth-title">Welcome back!</h1>
        <p className="auth-sub">Sign in to your account to continue shopping</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" value={form.email} onChange={f('email')} placeholder="john@example.com" required id="email"/>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input type={show?'text':'password'} className="form-input" value={form.password} onChange={f('password')} placeholder="Your password" required id="password"/>
              <button type="button" className="input-icon-btn" onClick={() => setShow(p=>!p)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="login-submit">
            {loading ? <span className="spinner spinner-sm"/> : <LogIn size={18}/>}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">Don't have an account? <Link to="/signup">Create one free →</Link></p>

        <div className="auth-demo">
          <p>Demo: Create an account to test all features!</p>
        </div>
      </div>
    </div>
  );
}
