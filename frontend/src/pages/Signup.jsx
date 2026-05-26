import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, UserPlus, Zap } from 'lucide-react';
import { registerUser } from '../store/slices/authSlice';
import './Auth.css';

export default function Signup() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [show, setShow] = useState(false);
  const [errs, setErrs] = useState({});

  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) e.phone = '10-digit mobile number';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('email', form.email);
    fd.append('phone', form.phone);
    fd.append('password', form.password);
    const res = await dispatch(registerUser(fd));
    if (registerUser.fulfilled.match(res)) navigate('/');
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand"><div className="auth-logo"><Zap size={20}/></div>Quick<span>Buy</span></div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-sub">Join millions of shoppers on QuickBuy</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className={`form-input ${errs.name?'input-err':''}`} value={form.name} onChange={f('name')} placeholder="John Doe" id="name"/>
              {errs.name && <p className="form-error">{errs.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input type="email" className={`form-input ${errs.email?'input-err':''}`} value={form.email} onChange={f('email')} placeholder="john@example.com" id="reg-email"/>
              {errs.email && <p className="form-error">{errs.email}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input type="tel" className={`form-input ${errs.phone?'input-err':''}`} value={form.phone} onChange={f('phone')} placeholder="10-digit number" maxLength={10} id="phone"/>
              {errs.phone && <p className="form-error">{errs.phone}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-wrap">
                <input type={show?'text':'password'} className={`form-input ${errs.password?'input-err':''}`} value={form.password} onChange={f('password')} placeholder="Min 6 characters" id="reg-password"/>
                <button type="button" className="input-icon-btn" onClick={()=>setShow(p=>!p)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button>
              </div>
              {errs.password && <p className="form-error">{errs.password}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" className={`form-input ${errs.confirm?'input-err':''}`} value={form.confirm} onChange={f('confirm')} placeholder="Re-enter password" id="confirm"/>
              {errs.confirm && <p className="form-error">{errs.confirm}</p>}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{marginTop:'1rem'}} id="signup-submit">
            {loading ? <span className="spinner spinner-sm"/> : <UserPlus size={18}/>}
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">Already have an account? <Link to="/login">Sign in →</Link></p>
      </div>
    </div>
  );
}
