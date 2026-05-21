import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

import axios from 'axios';
import API from "../../api/api";

import {
    loadingToggleAction,
} from '../../store/actions/AuthActions';

import logo from "../../assets/images/rti.png";
import loginbg from "../../assets/images/pic1.png";

function Login(props) {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();

    async function onLogin(e) {

        e.preventDefault();

        let error = false;

        const errorObj = {
            email: '',
            password: ''
        };

        // Validation
        if (email === '') {
            errorObj.email = 'Email is Required';
            error = true;
        }

        if (password === '') {
            errorObj.password = 'Password is Required';
            error = true;
        }

        setErrors(errorObj);

        if (error) return;
		
try {

    dispatch(loadingToggleAction(true));

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const response = await axios.post(API.LOGIN, formData, {
        headers: {
            Accept: "application/json"
        }
    });

    console.log("LOGIN RESPONSE => ", response.data);

    localStorage.setItem("authToken", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    dispatch(loadingToggleAction(false));

    toast.success("Login Successfully");

  
        navigate("/admin/dashboard");
   

} catch (err) {

    dispatch(loadingToggleAction(false));

    console.log("ERROR =>", err.response?.data || err.message);

    toast.error("Invalid Credentials");

    setErrors({
        email: '',
        password: ''
    });
}
    }

    return (
        <div className="authincation d-flex flex-column flex-lg-row flex-column-f8luid">

            <div className="login-aside text-center d-flex flex-column flex-row-auto">

                <div className="d-flex flex-column-auto flex-column pt-lg-40 pt-15">

                    <div className="text-center mb-4 pt-5 brand-logo">
                        <img
                            className="logo-abbr me-1 rti-auth-logo"
                            src={logo}
                            alt="RTI"
                        />
                    </div>

                    <h3 className="mb-2">Welcome back!</h3>

                    <p>
                        User Experience & Interface Design
                        <br />
                        Strategy SaaS Solutions
                    </p>

                </div>

                <div
                    className="aside-image"
                    style={{
                        backgroundImage: "url(" + loginbg + ")"
                    }}
                ></div>

            </div>

            <div className="container flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-7 mx-auto">

                <div className="d-flex justify-content-center h-100 align-items-center">

                    <div className="authincation-content style-2">

                        <div className="row no-gutters">

                            <div className="col-xl-12 tab-content">

                                <div
                                    id="sign-in"
                                    className="auth-form form-validation"
                                >

                                    {props.errorMessage && (
                                        <div className='bg-red-300 text-red-900 border border-red-900 p-1 my-2'>
                                            {props.errorMessage}
                                        </div>
                                    )}

                                    <form
                                        onSubmit={onLogin}
                                        className="form-validate"
                                    >

                                        <h3 className="text-center mb-4 text-black">
                                            Sign in your account
                                        </h3>

                                        {/* EMAIL */}
                                        <div className="form-group mb-3">

                                            <label className="mb-1">
                                                <strong>Email</strong>
                                            </label>

                                            <div>

                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={email}
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    placeholder="Type Your Email Address"
                                                />

                                            </div>

                                            {errors.email && (
                                                <div className="text-danger fs-12">
                                                    {errors.email}
                                                </div>
                                            )}

                                        </div>

                                        {/* PASSWORD */}
                                        <div className="form-group mb-3">

                                            <label className="mb-1">
                                                <strong>Password</strong>
                                            </label>

                                            <div className="password-field">

                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    className="form-control"
                                                    value={password}
                                                    placeholder="Type Your Password"
                                                    onChange={(e) =>
                                                        setPassword(e.target.value)
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    className="password-eye"
                                                    onClick={() =>
                                                        setShowPassword((value) => !value)
                                                    }
                                                >
                                                    <i
                                                        className={`fa ${showPassword
                                                                ? "fa-eye"
                                                                : "fa-eye-slash"
                                                            }`}
                                                    />
                                                </button>

                                            </div>

                                            {errors.password && (
                                                <div className="text-danger fs-12">
                                                    {errors.password}
                                                </div>
                                            )}

                                        </div>

                                        {/* REMEMBER */}
                                        <div className="form-row d-flex justify-content-between mt-4 mb-2">

                                            <div className="form-group mb-3">

                                                <div className="form-check custom-checkbox ms-1">

                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        id="basic_checkbox_1"
                                                    />

                                                    <label
                                                        className="form-check-label"
                                                        htmlFor="basic_checkbox_1"
                                                    >
                                                        Remember my preference
                                                    </label>

                                                </div>

                                            </div>

                                        </div>

                                        {/* BUTTON */}
                                           <div className="text-center">

                        <button
                            type="submit"
                            className="btn btn-primary btn-block d-flex align-items-center justify-content-center gap-2"
                            disabled={props.showLoading}
                        >

                            {props.showLoading && (
                                <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                    aria-hidden="true"
                                />
                            )}

                            Sign In
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

const mapStateToProps = (state) => {
    return {
        errorMessage: state.auth.errorMessage,
        successMessage: state.auth.successMessage,
        showLoading: state.auth.showLoading,
    };
};

export default connect(mapStateToProps)(Login);