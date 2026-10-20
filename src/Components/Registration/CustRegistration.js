import { useEffect, useReducer, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";

export default function CustRegistration() {
  const init = {
    fname: { value: "", error: "", valid: false, touched: false },
    lname: { value: "", error: "", valid: false, touched: false },
    contactno: { value: "", error: "", valid: false, touched: false },
    emailid: { value: "", error: "", valid: false, touched: false },
    cityid: 0,
    areaid: 0,
    questionid: 0,
    roleid: 1,
    answer: { value: "", error: "", valid: false, touched: false },
    lane: { value: "", error: "", valid: false, touched: false },
    pincode: { value: "", error: "", valid: false, touched: false },
    birthdate: { value: "", error: "", valid: false, touched: false },
    userid: { value: "", error: "", valid: false, touched: false },
    password: { value: "", error: "", valid: false, touched: false },
  };
  // Merge instead of replace. The old reducer stored the raw string, which
  // threw away `error`/`valid`/`touched` and left the input reading
  // `info.field.value` === undefined, so every field went uncontrolled after
  // the first keystroke and no validation message could ever appear.
  const reducer = (state, action) => {
    switch (action.type) {
      case "update":
        return {
          ...state,
          [action.fld]: {
            ...(state[action.fld] && typeof state[action.fld] === "object"
              ? state[action.fld]
              : { value: "", error: "", valid: false, touched: false }),
            value: action.value,
            error: action.error,
            valid: action.valid,
            touched: action.touched,
          },
        };
      case "reset":
        return init;
      default:
        return state;
    }
  };

  // Reads either the {value,valid,touched} wrapper or a plain value, so this
  // form cannot post a nested object the backend DTO is unable to parse.
  const get = (f) => (f !== null && typeof f === "object" && "value" in f ? f.value : f);
  const isValid = (f) => (f !== null && typeof f === "object" && "valid" in f ? f.valid : false);
  const [info, dispatch] = useReducer(reducer, init);
  const [allarea, setAllarea] = useState([]);
  const [allcities, setAllcities] = useState([]);
  const [allques, setAllques] = useState([]);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const reduxAction = useDispatch();

  const validate = (nm, val) => {
    let error = "";
    let valid = false;
    let touched = true;
    switch (nm) {
      case "email":
        const exp1 = /^[a-z0-9]{3,}@[a-z]{3,12}\.[a-z]{2,}$/;

        if (!exp1.test(val)) {
          error = "Invalid Email";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "password":
        const exp2 =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!exp2.test(val)) {
          error =
            "Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "fname":
        const exp3 = /^[\w]{3,}$/;
        if (!exp3.test(val)) {
          error = "Atleast 3 Charaters";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "lname":
        const exp4 = /^[\w]{3,}$/;
        if (!exp4.test(val)) {
          error = "Atleast 3 Charaters";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "regno":
        const exp5 = /^[\w]{3,}$/;
        if (!exp5.test(val)) {
          error = "Invalid";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "contactno":
        const exp6 = /^[0-9]{10}$/;
        if (!exp6.test(val)) {
          error = "Invalid Contact Number";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "addressline":
        const exp7 = /[\w]{4,}$/;
        if (!exp7.test(val)) {
          error = "Invalid";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "ans":
        const exp8 = /[\w]{3,}$/;
        if (!exp8.test(val)) {
          error = "Invalid";
        } else {
          error = "";
          valid = true;
        }
        break;

      // The cases below are the names this form actually submits. They were
      // missing, so those fields always reported valid=false.
      case "emailid":
        if (!/^[a-z0-9._%+-]{3,}@[a-z0-9.-]+\.[a-z]{2,}$/i.test(val))
          error = "Invalid Email";
        else {
          error = "";
          valid = true;
        }
        break;

      case "lane":
        if (!/[\w]{4,}/.test(val)) error = "Enter at least 4 characters";
        else {
          error = "";
          valid = true;
        }
        break;

      case "pincode":
        if (!/^[0-9]{6}$/.test(val)) error = "Pincode must be 6 digits";
        else {
          error = "";
          valid = true;
        }
        break;

      case "answer":
        if (!/[\w]{3,}/.test(val)) error = "Enter at least 3 characters";
        else {
          error = "";
          valid = true;
        }
        break;

      case "userid":
        if (!/^[A-Za-z0-9_]{3,}$/.test(val))
          error = "3 or more letters, numbers or underscores";
        else {
          error = "";
          valid = true;
        }
        break;

      case "birthdate":
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) error = "Enter a valid date";
        else {
          error = "";
          valid = true;
        }
        break;

      default:
        break;
    }

    //console.log(val + "," + error + "," + valid);
    dispatch({ type: "update", fld: nm, value: val, error, valid, touched });
  };

  const senddata = (e) => {
    e.preventDefault();

    // Submit guard: selects start at 0, text fields at an empty string.
    const missing = [];
    const required = [
      ["fname", "First name"],
      ["lname", "Last name"],
      ["birthdate", "Date of birth"],
      ["contactno", "Contact number"],
      ["emailid", "Email ID"],
      ["lane", "Address"],
      ["pincode", "Pincode"],
      ["answer", "Security answer"],
      ["userid", "User ID"],
      ["password", "Password"],
    ];
    required.forEach(([fld, label]) => {
      const v = get(info[fld]);
      if (v === null || v === undefined || String(v).trim() === "") {
        missing.push(label);
      }
    });
    if (!Number(get(info.cityid) || 0)) missing.push("City");
    if (!Number(get(info.areaid) || 0)) missing.push("Area");
    if (!Number(get(info.questionid) || 0)) missing.push("Security question");

    const invalid = [
      "fname",
      "lname",
      "birthdate",
      "contactno",
      "emailid",
      "lane",
      "pincode",
      "answer",
      "userid",
      "password",
    ].filter((fld) => !isValid(info[fld]));

    if (missing.length || invalid.length) {
      const parts = [];
      if (missing.length) parts.push("fill in: " + missing.join(", "));
      if (invalid.length) parts.push("correct the highlighted fields");
      setFormError("Please " + parts.join(", and ") + ".");
      return;
    }
    setFormError("");

    // Flatten deliberately. State holds {value,error,valid,touched} wrappers
    // while the backend DTO expects plain values — posting the raw state
    // produced a 400 that surfaced only as "Registration Failed".
    const payload = {
      fname: String(get(info.fname)).trim(),
      lname: String(get(info.lname)).trim(),
      birthdate: String(get(info.birthdate)).trim(),
      contactno: String(get(info.contactno)).trim(),
      emailid: String(get(info.emailid)).trim(),
      lane: String(get(info.lane)).trim(),
      pincode: String(get(info.pincode)).trim(),
      userid: String(get(info.userid)).trim(),
      password: String(get(info.password)),
      answer: String(get(info.answer)).trim(),
      areaid: Number(get(info.areaid)) || 0,
      questionid: Number(get(info.questionid)) || 0,
    };

    fetch(`${API}/registercustomer`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((resp) =>
        resp.text().then((text) => ({ status: resp.status, text }))
      )
      .then(({ status, text }) => {
        let body = null;
        if (text && text.trim()) {
          try {
            body = JSON.parse(text);
          } catch (err) {
            body = null;
          }
        }

        if (status === 200) {
          setFormError("");
          alert("Registration Successful...!\n\nYou can sign in now.");
          navigate("/userlogin");
        } else {
          // Show the reason (e.g. "That user ID is already taken")
          // instead of a blanket "Registration Failed".
          setFormError(
            (body && body.message) ||
              "Registration failed. Please check the form and try again."
          );
        }
      })
      .catch(() =>
        setFormError("Could not reach the server. Please try again.")
      );
  };

  const getAreas = (id) => {
    if (!id || id === "Select One" || Number(id) <= 0) {
      setAllarea([]);
      return;
    }
    fetch(`${API}/getAreaByCityId?id=` + id)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((a) => setAllarea(Array.isArray(a) ? a : []))
      .catch(() => setAllarea([]));
  };

  useEffect(() => {
    fetch(`${API}/getCities`)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((c) => setAllcities(Array.isArray(c) ? c : []))
      .catch(() => setAllcities([]));

    fetch(`${API}/getQuestions`)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((q) => setAllques(Array.isArray(q) ? q : []))
      .catch(() => setAllques([]));
  }, []);


  return (
    <div
      style={{ backgroundColor: "white" }}
      className="container-fluid p-3 mb-3 text-black shadow rounded-4"
    >
      <div className="container-fluid">
        <form>
          <table className="table table table-striped">
            <thead>
              <tr>
                <th colSpan={2}>
                  <h3>Customer Registration</h3>
                  <hr />
                  {formError ? (
                    <div className="alert alert-danger" role="alert">
                      {formError}
                    </div>
                  ) : null}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="form-group">
                <td>
                  <label htmlFor="fname">First Name:</label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="fname"
                    placeholder="Enter First name"
                    name="fname"
                    value={info.fname.value}
                    onChange={(e) => {
                      validate("fname", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.fname.valid && info.fname.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.fname.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="fname">Last Name:</label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="lname"
                    placeholder="Enter Lasts name"
                    name="lname"
                    value={info.lname.value}
                    onChange={(e) => {
                      validate("lname", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.lname.valid && info.lname.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.lname.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="fname">Birthdate:</label>
                </td>
                <td>
                  <input
                    type="date"
                    className="form-control"
                    id="birthdate"
                    placeholder="Enter fname name"
                    name="birthdate"
                    value={info.birthdate.value}
                    onChange={(e) => {
                      validate("birthdate", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.birthdate.valid && info.birthdate.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.birthdate.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="contactno">Contact Number.:</label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="contactno"
                    placeholder="Enter Contact number"
                    name="contactno"
                    value={info.contactno.value}
                    onChange={(e) => {
                      validate("contactno", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.contactno.valid && info.contactno.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.contactno.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="emailid">Email ID:</label>
                </td>
                <td>
                  <input
                    type="emailid"
                    className="form-control"
                    id="emailid"
                    placeholder="Enter Emailid"
                    name="emailid"
                    value={info.emailid.value}
                    onChange={(e) => {
                      validate("emailid", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.emailid.valid && info.emailid.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.emailid.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="cityid"> Select City</label>
                </td>
                <td>
                  <select
                    className="form-group"
                    id="cityid"
                    name="cityid"
                    onChange={(e) => {
                      getAreas(e.target.value);
                      dispatch({
                        type: "update",
                        fld: "cityid",
                        value: e.target.value,
                      });
                    }}
                  >
                    <option>Select One</option>
                    {allcities.map((city) => {
                      return (
                        <option value={city.cityid} key={city.cityid}>
                          {city.cityname}
                        </option>
                      );
                    })}
                  </select>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="areaid"> Select Area</label>
                </td>
                <td>
                  <select
                    className="form-group"
                    id="areaid"
                    name="areaid"
                    onChange={(e) => {
                      dispatch({
                        type: "update",
                        fld: "areaid",
                        value: e.target.value,
                      });
                    }}
                  >
                    <option>Select One</option>
                    {allarea.map((area) => {
                      return (
                        <option value={area.areaid} key={area.areaid}>
                          {area.areaname}
                        </option>
                      );
                    })}
                  </select>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="lane"> Address:</label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="lane"
                    placeholder="Enter Address"
                    name="lane"
                    value={info.lane.value}
                    onChange={(e) => {
                      validate("lane", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.lane.valid && info.lane.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.lane.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="pincode"> Pincode :</label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="pincode"
                    placeholder="Enter Pincode"
                    name="pincode"
                    value={info.pincode.value}
                    onChange={(e) => {
                      validate("pincode", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.pincode.valid && info.pincode.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.pincode.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="questionid"> Select Security Question</label>
                </td>
                <td>
                  <select
                    className="form-group"
                    id="questionid"
                    name="questionid"
                    onChange={(e) => {
                      dispatch({
                        type: "update",
                        fld: "questionid",
                        value: e.target.value,
                      });
                    }}
                  >
                    <option>Select One</option>
                    {allques.map((q) => {
                      return (
                        <option value={q.questionid} key={q.questionid}>
                          {q.questiontext}
                        </option>
                      );
                    })}
                  </select>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="answer"> Answer</label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="answer"
                    placeholder="Enter Answer"
                    name="answer"
                    value={info.answer.value}
                    onChange={(e) => {
                      validate("answer", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.answer.valid && info.answer.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.answer.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="userid">User ID:</label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="userid"
                    placeholder="Enter userid"
                    name="userid"
                    value={info.userid.value}
                    onChange={(e) => {
                      validate("userid", e.target.value);
                    }}
                  />

                  <p
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.userid.valid && info.userid.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.userid.error}
                  </p>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="password">Password:</label>
                </td>
                <td>
                  <input
                    type="password"
                    className="form-control"
                    id="pwd"
                    placeholder="Enter password"
                    name="password"
                    value={info.password.value}
                    onChange={(e) => {
                      validate("password", e.target.value);
                    }}
                  />

                  <p
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.password.valid && info.password.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.password.error}
                  </p>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="password">Re-enter Password:</label>
                </td>
                <td>
                  <input
                    type="password"
                    className="form-control"
                    id="pwd"
                    placeholder="Re-enter password"
                    name="password"
                    value={info.password.value}
                    onChange={(e) => {
                      validate("password", e.target.value);
                    }}
                  />

                  <p
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.password.valid && info.password.touched
                          ? "block"
                          : "none",
                      color: "red",
                    }}
                  >
                    {info.password.error}
                  </p>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <button
                    type="submit"
                    className="btn btn-primary mb-3"
                    onClick={(e) => {
                      senddata(e);
                    }}
                  >
                    Submit
                  </button>
                </td>
                <td>
                  <button
                    type="reset"
                    className="btn btn-primary mb-3"
                    onClick={() => {
                      dispatch({ type: "reset" });
                    }}
                  >
                    clear
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </form>
      </div>
    </div>
  );
}
