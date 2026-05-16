import React, { useState } from "react";
import logo from "../../assets/images/rti.png";
import { Link, useNavigate } from "react-router-dom";
import AppToast from "../common/AppToast";

const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const loginEmail = "demo@example.com";

const ForgotPassword = () => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState(loginEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    if (step === "email") {
      if (!validEmail.test(email)) {
        setMessage("Please enter a valid email address");
        return;
      }
      if (email !== loginEmail) {
        setMessage("Please use the same email address used for login.");
        return;
      }
      setMessage("");
      setStep("otp");
      return;
    }

    if (step === "otp") {
      if (otp !== "123456") {
        setMessage("Please enter valid dummy OTP: 123456");
        return;
      }
      setMessage("");
      setStep("reset");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (!password || password !== confirmPassword) {
      setMessage("Password and confirm password must match");
      return;
    }

    localStorage.setItem("rti-demo-password", password);
    setToast("Password changed successfully");
    setTimeout(() => navigate("/"), 900);
  };

  return (
    <div className="authincation h-100 p-meddle rti-forgot-page">
      <div className="container h-100">
        {" "}
        <div className="row justify-content-center h-100 align-items-center">
          <div className="col-md-6">
            <div className="authincation-content rti-auth-white-card">
              <div className="row no-gutters">
                <div className="col-xl-12">
                  <div className="auth-form">
                    <AppToast show={Boolean(toast)} message={toast} onClose={() => setToast("")} />
                    <div className="text-center mb-3">
                      <Link to="/admin/dashboard">
                        <img src={logo} alt="RTI" className="rti-auth-logo" />
                      </Link>
                    </div>
                    <Link to="/" className="rti-auth-back-link">
                      <i className="fa fa-arrow-left me-2" />
                      Back
                    </Link>
                    <h4 className="text-center mb-4 text-black">
                      Forgot Password
                    </h4>
                    <form onSubmit={(e) => onSubmit(e)}>
                      {step === "email" ? (
                        <div className="form-group">
                          <label className="text-black">
                            <strong>Email</strong>
                          </label>
                          <input
                            type="email"
                            className={`form-control ${message ? "is-invalid" : ""}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      ) : step === "otp" ? (
                        <div className="form-group">
                          <label className="text-black">
                            <strong>OTP</strong>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${message ? "is-invalid" : ""}`}
                            placeholder="Enter OTP 123456"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="form-group">
                            <label className="text-black">
                              <strong>Reset Password</strong>
                            </label>
                            <input
                              type="password"
                              className={`form-control ${message && password.length < 6 ? "is-invalid" : ""}`}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="text-black">
                              <strong>Confirm Password</strong>
                            </label>
                            <input
                              type="password"
                              className={`form-control ${message && password !== confirmPassword ? "is-invalid" : ""}`}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </div>
                        </>
                      )}
                      {message && (
                        <div className="text-danger text-center mb-3">
                          {message}
                        </div>
                      )}
                      <div className="text-center">
                        <input
                          type="submit"
                          value="SUBMIT"
                          className="btn btn-primary btn-block"
                        />
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
