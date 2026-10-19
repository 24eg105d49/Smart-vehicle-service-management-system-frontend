import { useEffect, useReducer, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";

export default function ValidationServRegistration() {
  const init = {
    scname: { value: "", error: "", valid: false, touched: false },
    bookinglimit: { value: "", error: "", valid: false, touched: false },
    contactno: { value: "", error: "", valid: false, touched: false },
    emailid: { value: "", error: "", valid: false, touched: false },
    cityid: 0,
    areaid: 0,
    questionid: 0,
    roleid: 2,
    answer: { value: "", error: "", valid: false, touched: false },
    lane: { value: "", error: "", valid: false, touched: false },
    pincode: { value: "", error: "", valid: false, touched: false },
    birthdate: { value: "", error: "", valid: false, touched: false },
    userid: { value: "", error: "", valid: false, touched: false },
    password: { value: "", error: "", valid: false, touched: false },
    rpassword: { value: "", error: "", valid: false, touched: false },
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case "update":
        return {
          ...state,
          [action.fld]: {
            ...state[action.fld],
            value: action.value,
            error: action.error,
            valid: action.valid,
            touched: action.touched,
          },
        };
      case "reset":
        return init;
    }
  };
  const [info, dispatch] = useReducer(reducer, init);
  const [allarea, setAllarea] = useState([]);
  const [allcities, setAllcities] = useState([]);
  const [allques, setAllques] = useState([]);
  const [allbrands, setAllbrands] = useState([]);
  const navigate = useNavigate();
  const reduxAction = useDispatch();

  const validate = (nm, val) => {
    let error = "";
    let valid = false;
    let touched = true;
    switch (nm) {
      case "emailid":
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

      case "rpassword":
        //const exp11 = password
        console.log(nm + " : " + val);
        if (val !== info.password.value) {
          error = "password is not matching";
          valid = false;
        } else if (val === info.password.value) {
          error = "";
          valid = true;
        }
        break;

      case "scname":
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

      case "lane":
        const exp7 = /[\w]{4,}$/;
        if (!exp7.test(val)) {
          error = "Address must be more that 3 characters";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "answer":
        const exp8 = /[\w]{3,}$/;
        if (!exp8.test(val)) {
          error = "Invalid";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "pincode":
        const exp9 = /^[0-9]{6}$/;
        if (!exp9.test(val)) {
          error = "Invalid Pincode";
        } else {
          error = "";
          valid = true;
        }
        break;
    }

    console.log(val + "," + error + "," + valid);
    dispatch({ type: "update", fld: nm, value: val, error, valid, touched });
  };

  const senddata = (e) => {
    alert("Registration Successfull ...!");
    e.preventDefault();
    const reqOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(info),
    };
    fetch(`${API}/registerservicecenter`, reqOptions)
      .then((resp) => resp.json())
      .then((obj) => console.log(JSON.stringify(obj)));
  };

  const getAreas = (id) => {
    fetch(`${API}/getAreaByCityId?id=` + id)
      .then((resp) => resp.json())
      .then((a) => setAllarea(a));
  };

  useEffect(() => {
    fetch(`${API}/getBrands`)
      .then((resp) => resp.json())
      .then((c) => setAllbrands(c));

    fetch(`${API}/getCities`)
      .then((resp) => resp.json())
      .then((c) => setAllcities(c));

    fetch(`${API}/getQuestions`)
      .then((resp) => resp.json())
      .then((q) => setAllques(q));
  }, []);

  return (
    <div style={{ backgroundColor: "white" }}>
      <div className="container">
        <h2 style={{ textAlign: "center" }}>Service Center Registration</h2>
        <form>
          <table className="table table table-striped">
            <tbody>
              <tr className="form-group">
                <td>
                  <label htmlFor="brandid"> Select Brand</label>{" "}
                </td>
                <td>
                  <select
                    className="form-group"
                    id="brandid"
                    name="brandid"
                    onChange={(e) => {
                      getAreas(e.target.value);
                      dispatch({
                        type: "update",
                        fld: "brandid",
                        val: e.target.value,
                      });
                    }}
                  >
                    <option>Select One</option>
                    {allbrands.map((b) => {
                      return (
                        <option value={b.brandid} key={b.brandid}>
                          {b.bname}
                        </option>
                      );
                    })}
                  </select>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="fname">Service Center Name:</label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="scname"
                    placeholder="Enter Name"
                    name="scname"
                    value={info.scname.value}
                    onChange={(e) => {
                      validate("scname", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.scname.valid && info.scname.touched
                          ? "block"
                          : "none",
                    }}
                  >
                    {info.scname.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="bookinglimit">Booking Limit:</label>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    id="bookinglimit"
                    placeholder="Enter Booking Limit"
                    name="bookinglimit"
                    value={info.bookinglimit.value}
                    onChange={(e) => {
                      validate("bookinglimit", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.bookinglimit.valid && info.bookinglimit.touched
                          ? "block"
                          : "none",
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
                        val: e.target.value,
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
                        val: e.target.value,
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
                    }}
                  >
                    {info.lane.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  {" "}
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
                    }}
                  >
                    {info.pincode.error}
                  </div>
                </td>
              </tr>

              <tr className="form-group">
                <td>
                  <label htmlFor="securityid"> Select Security Question</label>
                </td>
                <td>
                  <select
                    className="form-group"
                    id="securityid"
                    name="securityid"
                    onChange={(e) => {
                      dispatch({
                        type: "update",
                        fld: "securityid",
                        val: e.target.value,
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
                  {" "}
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
                    className="form-text"
                    style={{
                      display:
                        !info.answer.valid && info.answer.touched
                          ? "block"
                          : "none",
                    }}
                  >
                    {info.answer.error}
                  </div>
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
                    }}
                  >
                    {info.password.error}
                  </p>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="rpassword">Re-Enter Password:</label>
                </td>
                <td>
                  <input
                    type="password"
                    className="form-control"
                    id="rpassword"
                    placeholder="Re-Enter password"
                    name="rpassword"
                    value={info.rpassword.value}
                    onChange={(e) => {
                      validate("rpassword", e.target.value);
                    }}
                    onBlur={(e) => {
                      validate("rpassword", e.target.value);
                    }}
                  />
                  <p
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.rpassword.valid && info.rpassword.touched
                          ? "block"
                          : "none",
                    }}
                  >
                    {info.rpassword.error}
                  </p>
                </td>
              </tr>
              <tr className="form-group">
                <td style={{ textAlign: "right" }}>
                  <hr />
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
                <td style={{ textAlign: "left" }}>
                  <hr />
                  <button
                    type="reset"
                    className="btn btn-secondary mb-3"
                    onClick={() => {
                      dispatch({ type: "reset" });
                    }}
                  >
                    Reset
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
