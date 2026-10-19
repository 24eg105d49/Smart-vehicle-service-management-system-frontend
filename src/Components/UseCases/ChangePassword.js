import { API } from "../../api";
import { useEffect, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import { Alert, Button, Spinner } from "react-bootstrap";
import { FiArrowLeft, FiCheckCircle, FiKey, FiLock } from "react-icons/fi";

const EMPTY = { uid: "", pwd: "", confirm: "" };

const reducer = (state, action) => {
  switch (action.type) {
    case "update":
      return { ...state, [action.fld]: action.val };
    case "reset":
      return EMPTY;
    default:
      return state;
  }
};

export default function ChangePassword() {
  const [info, dispatch] = useReducer(reducer, EMPTY);
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // The account to change is always the one that is signed in. Resolve it
  // automatically so the request can never target the wrong row (previously
  // the user had to guess their user id, and a wrong id silently updated
  // nothing while the UI still reported success).
  useEffect(() => {
    let cancelled = false;

    const apply = (uid) => {
      if (cancelled || !uid) return;
      dispatch({ type: "update", fld: "uid", val: uid });
      setLocked(true);
    };

    const stored = localStorage.getItem("userid");
    if (stored) {
      apply(stored);
      return () => {
        cancelled = true;
      };
    }

    const rawLoginid = localStorage.getItem("loginid");
    if (rawLoginid) {
      fetch(
        `${API}/getLoginByLoginid?loginid=` +
          encodeURIComponent(rawLoginid.replace(/"/g, ""))
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => apply(d && d.userid))
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Mirrors the rules on the login form exactly, so a password you set here
  // is always one you can sign in with.
  const validate = () => {
    if (!info.uid.trim()) return "Your user ID could not be determined. Sign in again.";
    if (!info.pwd) return "Please enter a new password.";
    if (!/[A-Z]/.test(info.pwd))
      return "Password must contain at least one capital letter";
    if (!/\d/.test(info.pwd))
      return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(info.pwd))
      return "Password must contain at least one special character (!@#$%^&*)";
    if (info.pwd !== info.confirm) return "The two passwords do not match.";
    return "";
  };

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setOk("");

    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setBusy(true);

    // URLSearchParams encodes characters such as '#' and '&' that would
    // otherwise truncate the query string — that was the reason the new
    // password was never actually stored, yet the UI said it had been.
    const params = new URLSearchParams({
      userid: info.uid.trim(),
      newPwd: info.pwd,
    });

    fetch(`${API}/changePwd?` + params.toString(), {
      method: "POST",
    })
      .then((resp) => (resp.ok ? resp.json() : Promise.reject(resp.status)))
      .then((rows) => {
        // The endpoint returns the number of rows updated. HTTP 200 with 0
        // means nothing changed and must not be reported as success.
        if (Number(rows) === 1) {
          setOk(
            "Password updated. Use the new password the next time you sign in."
          );
          dispatch({ type: "reset" });
        } else {
          setError(
            "No account matched that user ID, so nothing was changed. Sign in again and retry."
          );
        }
      })
      .catch(() => setError("Could not reach the server. Please try again."))
      .finally(() => setBusy(false));
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            <FiKey size={13} /> Account security
          </span>
          <h1 className="page-header__title">Change password</h1>
          <p className="page-header__sub">
            Your new password must satisfy the same rules as the sign-in form.
          </p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560, width: "100%" }}>
        <form onSubmit={submit} noValidate>
          {error ? (
            <Alert variant="danger" className="d-flex align-items-start gap-2">
              {error}
            </Alert>
          ) : null}
          {ok ? (
            <Alert variant="success" className="d-flex align-items-start gap-2">
              <FiCheckCircle size={17} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>
                {ok}{" "}
                <Link to={backTo()} style={{ fontWeight: 700 }}>
                  Back to dashboard
                </Link>
              </span>
            </Alert>
          ) : null}

          <div className="mb-3">
            <label htmlFor="uid" className="form-label">
              User ID
            </label>
            <input
              type="text"
              className="form-control"
              id="uid"
              value={info.uid}
              readOnly={locked}
              onChange={(e) =>
                dispatch({ type: "update", fld: "uid", val: e.target.value })
              }
            />
            {locked ? (
              <div className="form-text">
                Locked to the account you are signed in as.
              </div>
            ) : null}
          </div>

          <div className="mb-3">
            <label htmlFor="pwd" className="form-label">
              New password
            </label>
            <div className="input-group">
              <span className="input-group-text">
                <FiLock size={15} />
              </span>
              <input
                type="password"
                className="form-control"
                id="pwd"
                autoComplete="new-password"
                value={info.pwd}
                onChange={(e) =>
                  dispatch({ type: "update", fld: "pwd", val: e.target.value })
                }
                placeholder="At least one capital, one number, one symbol"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="confirm" className="form-label">
              Confirm new password
            </label>
            <input
              type="password"
              className="form-control"
              id="confirm"
              autoComplete="new-password"
              value={info.confirm}
              onChange={(e) =>
                dispatch({ type: "update", fld: "confirm", val: e.target.value })
              }
              placeholder="Repeat the new password"
            />
          </div>

          <div className="d-flex flex-wrap gap-2">
            <Button type="submit" variant="primary" disabled={busy}>
              {busy ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating…
                </>
              ) : (
                "Update password"
              )}
            </Button>
            <Link
              to={backTo()}
              className="btn btn-outline-secondary"
              style={{ textDecoration: "none" }}
            >
              <FiArrowLeft size={15} className="me-1" /> Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sends the user back to whichever dashboard they came from.
function backTo() {
  const rid = localStorage.getItem("roleid");
  if (rid === "2") return "/serviceHome";
  if (rid === "3") return "/adminHome";
  return "/customerhome";
}
