import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; 
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

// Modern Custom Axios Client Configuration
import axiosClient from '../../api/axiosClient';
import { setAuthSession } from "../../services/authSession";
import { loadingToggleAction } from '../../store/actions/AuthActions';

// Assets
import logo from "../../assets/images/rti.png";
import loginbg from "../../assets/images/pic1.png";

// Dynamic message finder utility
const getLoginMessage = (payload, fallback) => {
    if (!payload) return fallback;
    if (typeof payload === "string") return payload;
    if (payload.message) return payload.message;
    if (payload.error) return payload.error;
    if (payload.errors && typeof payload.errors === "object") {
        const first = Object.values(payload.errors).flat().find(Boolean);
        if (first) return first;
    }
    return fallback;
};

// Smart recursive token finder utility

const findAuthToken = (payload) => {
    if (!payload || typeof payload !== "object") return "";
    const tokenKeys = ["token", "access_token", "auth_token", "bearer_token", "jwt"];
    for (const key of tokenKeys) {
        if (payload[key]) return payload[key];
    }
    for (const value of Object.values(payload)) {
        if (value && typeof value === "object") {
            const token = findAuthToken(value);
            if (token) return token;
        }
    }
    return "";
};

// User extractor utility
const findUser = (payload) => {
    if (!payload || typeof payload !== "object") return null;
    return payload.user || payload.admin || payload.data?.user || payload.data?.admin || payload.data || null;
};

export default function Login() { 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux global login state hooks control
    const { errorMessage, showLoading } = useSelector((state) => state.auth);

    async function onLogin(e) {
        e.preventDefault();
        let hasError = false;

        const errorObj = {
            email: '',
            password: ''
        };

        // 1. Email Validations (Empty + Match Format)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === '') {
            errorObj.email = 'Email is Required';
            hasError = true;
        } else if (!emailRegex.test(email)) {
            errorObj.email = 'Please enter a valid email address';
            hasError = true;
        }

        // 2. Password Validations (Empty + Strong Framework Match)
        const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (password === '') {
            errorObj.password = 'Password is Required';
            hasError = true;
        } else if (!passwordRegex.test(password)) {
            errorObj.password = 'Password must be strong! (Min 8 chars, 1 Capital, 1 Number, 1 Special character)';
            hasError = true;
        }

        setErrors(errorObj);

        if (hasError) {
            toast.error("Please fix the validation errors.");
            return;
        }

        try {
            dispatch(loadingToggleAction(true));

            const formData = new FormData();
            formData.append("email", email);
            formData.append("password", password);

            // Professional cleaner endpoint call using custom client
            const response = await axiosClient.post('/login', formData); 

            console.log("LOGIN RESPONSE => ", response.data);

            const token = findAuthToken(response.data);
            const user = findUser(response.data);

            // Browser Session initialization
            setAuthSession({ token, user });

            dispatch(loadingToggleAction(false));
            toast.success(getLoginMessage(response.data, "Login successfully"));
            navigate("/admin/dashboard", { replace: true });

        } catch (err) {
            dispatch(loadingToggleAction(false));
            const message = getLoginMessage(err.response?.data, "Invalid email or password");
            toast.error(message);
        }
    }

    return (
        <div className="authincation d-flex flex-column flex-lg-row flex-column-fluid">
            <div className="login-aside text-center d-flex flex-column flex-row-auto">
                <div className="d-flex flex-column-auto flex-column pt-lg-40 pt-15">
                    <div className="text-center mb-4 pt-5 brand-logo">
                        <img className="logo-abbr me-1 rti-auth-logo" src={logo} alt="RTI" />
                    </div>
                    <h3 className="mb-2">Welcome back!</h3>
                    <p>User Experience & Interface Design<br />Strategy SaaS Solutions</p>
                </div>
                <div className="aside-image" style={{ backgroundImage: "url(" + loginbg + ")" }}></div>
            </div>

            <div className="container flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-7 mx-auto">
                <div className="d-flex justify-content-center h-100 align-items-center">
                    <div className="authincation-content style-2">
                        <div className="row no-gutters">
                            <div className="col-xl-12 tab-content">
                                <div id="sign-in" className="auth-form form-validation">
                                    
                                    {errorMessage && (
                                        <div className='bg-red-300 text-red-900 border border-red-900 p-2 my-2 rounded'>
                                            {errorMessage}
                                        </div>
                                    )}

                                    <form onSubmit={onLogin} className="form-validate">
                                        <h3 className="text-center mb-4 text-black">Sign in your account</h3>

                                        {/* EMAIL INPUT */}
                                        <div className="form-group mb-3">
                                            <label className="mb-1"><strong>Email</strong></label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Type Your Email Address"
                                                autoComplete="username"
                                                disabled={showLoading} 
                                            />
                                            {errors.email && <div className="text-danger fs-12 mt-1">{errors.email}</div>}
                                        </div>

                                        {/* PASSWORD INPUT */}
                                        <div className="form-group mb-3">
                                            <label className="mb-1"><strong>Password</strong></label>
                                            <div className="password-field position-relative">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    className="form-control"
                                                    value={password}
                                                    placeholder="Type Your Password"
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    autoComplete="current-password"
                                                    disabled={showLoading} 
                                                />
                                                <button
                                                    type="button"
                                                    className="password-eye"
                                                    style={{ position: 'absolute', right: '10px', top: '35%', border: 'none', background: 'none', zIndex: 10 }}
                                                    onClick={() => setShowPassword((value) => !value)}
                                                    disabled={showLoading}
                                                >
                                                    <i className={`fa ${showPassword ? "fa-eye" : "fa-eye-slash"}`} />
                                                </button>
                                            </div>
                                            {errors.password && <div className="text-danger fs-12 mt-1">{errors.password}</div>}
                                        </div>

                                        {/* REMEMBER PREFERENCE */}
                                        <div className="form-row d-flex justify-content-between mt-4 mb-2">
                                            <div className="form-group mb-3">
                                                <div className="form-check custom-checkbox ms-1">
                                                    <input type="checkbox" className="form-check-input" id="basic_checkbox_1" disabled={showLoading} />
                                                    <label className="form-check-label" htmlFor="basic_checkbox_1">Remember my preference</label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SUBMIT ACTION BUTTON */}
                                        <div className="text-center">
                                            <button
                                                type="submit"
                                                className="btn btn-primary btn-block d-flex align-items-center justify-content-center gap-2"
                                                disabled={showLoading}
                                            >
                                                {showLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />}
                                                {showLoading ? "Signing In..." : "Sign In"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}