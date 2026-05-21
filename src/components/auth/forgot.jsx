import React, { useState } from "react";
import logo from "../../assets/images/rti.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import API from "../../api/api";

const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // =========================
    // STEP 1: SEND OTP
    // =========================
    if (step === "email") {
      if (!validEmail.test(email)) {
        setMessage("Enter valid email");
        return;
      }

      try {
        setLoading(true);

        const res = await axios.post(API.REQUEST_OTP, { email });

        toast.success(res.data?.message || "OTP sent successfully");

        setStep("otp");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to send OTP");
      } finally {
        setLoading(false);
      }

      return;
    }

    // =========================
    // STEP 2: VERIFY OTP
    // =========================
    if (step === "otp") {
      if (!otp || otp.length !== 6) {
        setMessage("Enter valid 6-digit OTP");
        return;
      }

      try {
        setLoading(true);

        const res = await axios.post(API.VERIFY_OTP, {
          email,
          otp,
        });

        toast.success(res.data?.message || "OTP verified");

        setStep("reset");
      } catch (err) {
        toast.error(err.response?.data?.message || "Invalid OTP");
      } finally {
        setLoading(false);
      }

      return;
    }

    // =========================
    // STEP 3: RESET PASSWORD
    // =========================
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(API.RESET_PASSWORD, {
        email,
        password,
        otp,
      });

      toast.success(res.data?.message || "Password reset successful");

      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authincation h-100 p-meddle rti-forgot-page">
      <div className="container h-100">
        <div className="row justify-content-center h-100 align-items-center">
          <div className="col-md-6">

            <div className="authincation-content rti-auth-white-card">
              <div className="auth-form">

                {/* LOGO */}
                <div className="text-center mb-3">
                  <Link to="/">
                    <img src={logo} alt="RTI" className="rti-auth-logo" />
                  </Link>
                </div>

                {/* BACK LINK */}
                <Link to="/" className="rti-auth-back-link">
                  <i className="fa fa-arrow-left me-2" />
                  Back
                </Link>

                <h4 className="text-center mb-4 text-black">
                  Forgot Password
                </h4>

                <form onSubmit={onSubmit}>

                  {/* STEP 1 */}
                  {step === "email" && (
                    <div className="form-group">
                      <label><strong>Email</strong></label>
                      <input
                        type="email"
                        placeholder="Enter email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === "otp" && (
                    <div className="form-group">
                      <label><strong>OTP</strong></label>
                      <input
                        type="text"
                        className="form-control"
                        value={otp}
                        maxLength={6}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Enter 6-digit OTP"
                      />
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === "reset" && (
                    <>
                      <div className="form-group">
                        <label><strong>New Password</strong></label>
                        <input
                          type="password"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label><strong>Confirm Password</strong></label>
                        <input
                          type="password"
                          className="form-control"
                          value={confirmPassword}
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                        />
                      </div>
                    </>
                  )}

                  {/* ERROR MESSAGE */}
                  {message && (
                    <div className="text-danger text-center mb-2">
                      {message}
                    </div>
                  )}

                  {/* SUBMIT BUTTON */}
                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={loading}
                    >
                      {loading ? "Please wait..." : "SUBMIT"}
                    </button>
                  </div>

                </form>

              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;