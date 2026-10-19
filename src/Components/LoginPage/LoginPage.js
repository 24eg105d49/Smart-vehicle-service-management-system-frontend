import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../slice";
import { API } from "../../api";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  FiLock,
  FiMail,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { BsGearFill } from "react-icons/bs";

function LoginPage() {
  const navigate = useNavigate();
  const reduxAction = useDispatch();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [userIdError, setUserIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    let ok = true;

    if (userId === "") {
      setUserIdError("Please enter your user ID");
      ok = false;
    } else if (userId.length < 3) {
      setUserIdError("User ID must be at least 3 characters long");
      ok = false;
    } else {
      setUserIdError("");
    }

    if (password === "") {
      setPasswordError("Please enter your password");
      ok = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one capital letter");
      ok = false;
    } else if (!/\d/.test(password)) {
      setPasswordError("Password must contain at least one number");
      ok = false;
    } else if (!/[!@#$%^&*]/.test(password)) {
      setPasswordError(
        "Password must contain at least one special character (!@#$%^&*)"
      );
      ok = false;
    } else {
      setPasswordError("");
    }

    return ok;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSubmitting(true);
    const reqOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userid: userId, password: password }),
    };

    fetch(`${API}/logincheck`, reqOptions)
      .then((resp) => resp.text().then((text) => ({ status: resp.status, text })))
      // A rejected login comes back as HTTP 200 with an empty body, so
      // parse defensively instead of letting resp.json() throw.
      .then(({ status, text }) => {
        const trimmed = (text || "").trim();
        let jsonData = null;
        if (trimmed) {
          try {
            jsonData = JSON.parse(trimmed);
          } catch (e) {
            jsonData = null;
          }
        }

        // The backend returns 403 + {error:"pending"} when the account
        // exists but has not been approved yet. Surface that message
        // instead of the generic "invalid credentials".
        if (status === 403 || (jsonData && jsonData.error)) {
          const err = new Error(
            (jsonData && jsonData.message) ||
              "This account is awaiting approval by the administrator."
          );
          err.userMessage = err.message;
          throw err;
        }

        if (!jsonData || !jsonData.roleid) {
          throw new Error("invalid-credentials");
        }

        localStorage.setItem("loginid", JSON.stringify(jsonData.loginid));
        localStorage.setItem("userid", jsonData.userid || "");
        const rid = jsonData.roleid && jsonData.roleid.roleid;
        localStorage.setItem("roleid", String(rid));

        if (jsonData.roleid.roleid === 1) {
          reduxAction(login());
          navigate("/customerhome");
        } else if (jsonData.roleid.roleid === 2) {
          reduxAction(login());
          navigate("/serviceHome");
        } else if (jsonData.roleid.roleid === 3) {
          reduxAction(login());
          navigate("/adminHome");
        } else {
          throw new Error("unknown-role");
        }
      })
      .catch((e) => {
        console.log(e);
        setServerError(
          (e && e.userMessage) ||
            "We couldn't sign you in. Check your user ID and password, then try again."
        );
      })
      .finally(() => setSubmitting(false));
  };

  const handleReset = () => {
    setUserId("");
    setPassword("");
    setUserIdError("");
    setPasswordError("");
    setServerError("");
  };

  return (
    <div className="auth">
      {/* ---------------- Brand panel */}
      <aside className="auth__aside">
        <span className="eyebrow eyebrow--accent">
          <BsGearFill size={13} /> Welcome back
        </span>

        <div>
          <h2>Sign in to manage every vehicle you care about.</h2>
          <p>
            Your bookings, service history, invoices and vehicles — all in one
            secure dashboard.
          </p>
        </div>

        <ul className="auth__points">
          <li>
            <span className="tick">
              <FiCheckCircle size={13} />
            </span>
            Live status updates from check-in to delivery
          </li>
          <li>
            <span className="tick">
              <FiCheckCircle size={13} />
            </span>
            Digital invoices and warranty records, kept forever
          </li>
          <li>
            <span className="tick">
              <FiCheckCircle size={13} />
            </span>
            Book authorised centres by city, area and brand
          </li>
        </ul>

        <blockquote className="auth__quote">
          “I could see exactly where my car was in the workshop. No more
          calling the garage every hour.”
          <cite>— Shreyas M., verified driver</cite>
        </blockquote>
      </aside>

      {/* ---------------- Form panel */}
      <main className="auth__main">
        <div className="auth__box">
          <h1>Sign in</h1>
          <p className="sub">Enter your credentials to continue to VSMS.</p>

          <div className="auth-card">
            {serverError ? (
              <div
                className="alert alert-danger d-flex align-items-start gap-2"
                role="alert"
              >
                <FiAlertCircle style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{serverError}</span>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="user-id">
                  User ID
                </label>
                <div className="field-icon">
                  <span className="field-icon__i">
                    <FiMail size={17} />
                  </span>
                  <input
                    type="text"
                    id="user-id"
                    autoComplete="username"
                    placeholder="e.g. Shreyas"
                    className={`form-control ${userIdError ? "is-invalid" : ""}`}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                {userIdError && (
                  <div className="invalid-feedback">{userIdError}</div>
                )}
              </div>

              <div className="form-group">
                <div className="form-row">
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                  <Link
                    to="/forgotpwd"
                    className="form-label"
                    style={{ marginBottom: 7, fontWeight: 600 }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="field-icon">
                  <span className="field-icon__i">
                    <FiLock size={17} />
                  </span>
                  <input
                    type={showPwd ? "text" : "password"}
                    id="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`form-control ${passwordError ? "is-invalid" : ""}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="field-icon__toggle"
                    onClick={() => setShowPwd((v) => !v)}
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPwd ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                  </button>
                </div>
                {passwordError && (
                  <div className="invalid-feedback">{passwordError}</div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Sign in"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-block"
                style={{ marginTop: 10 }}
                onClick={handleReset}
              >
                Reset
              </button>
            </form>

            <div className="auth__foot">
              New to VSMS?{" "}
              <Link to="/customerregistration">Create an account</Link>
            </div>
          </div>

          <div className="auth__alt">
            <Link to="/viewservicecenters" className="btn btn-outline-secondary btn-sm">
              Browse as guest
            </Link>
            <Link to="/servicecenterregistration" className="btn btn-outline-secondary btn-sm">
              Register a service centre
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
