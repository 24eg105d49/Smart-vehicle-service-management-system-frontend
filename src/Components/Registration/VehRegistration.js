import { useEffect, useReducer, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { API } from "../../api";

export default function VehRegistration() {
  const init = {
    customerid: localStorage.getItem("custid"),
    number: { value: "", error: "", valid: false, touched: false },
    running: { value: "", error: "", valid: false, touched: false },
    model: { value: "", error: "", valid: false, touched: false },
    regyear: { value: "", error: "", valid: false, touched: false },
    brandid: 0,
    fueltype: { value: "", error: "", valid: false, touched: false },
  };

  const fueltypes = [
    { id: 1, fueltype: "Petrol" },
    { id: 2, fueltype: "Diesel" },
    { id: 3, fueltype: "CNG" },
  ];

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
  const [allbrands, setAllbrands] = useState([]);
  const [fueltype, setFueltype] = useState("");
  const [brandid, setBrandid] = useState(0);
  const [formError, setFormError] = useState("");
  const navigate = useNavigate();
  const reduxAction = useDispatch();

  const validate = (nm, val) => {
    let error = "";
    let touched = true;
    let valid = false;
    switch (nm) {
      case "brandid":
        if (!val || Number(val) <= 0 || val === "Select One") {
          error = "Please select a valid brand";
          valid = false;
        } else {
          error = "";
          valid = true;
        }
        break;

      case "running":
        if (val && !/^[0-9]+$/.test(String(val).trim())) {
          error = "Invalid distance";
          valid = false;
        } else {
          error = "";
          valid = true;
        }
        break;

      case "regyear":
        const year = Number(val);
        const currentYear = new Date().getFullYear();
        if (!/^[0-9]{4}$/.test(String(val).trim()) || year < 1980 || year > currentYear + 1) {
          error = `Enter a year between 1980 and ${currentYear + 1}`;
          valid = false;
        } else {
          error = "";
          valid = true;
        }
        break;

      case "model":
        if (!val || String(val).trim().length < 2) {
          error = "Enter model name (min 2 characters)";
          valid = false;
        } else {
          error = "";
          valid = true;
        }
        break;

      case "fueltype":
        if (val === "Petrol" || val === "Diesel" || val === "CNG" || val === "Electric") {
          error = "";
          valid = true;
        } else {
          error = "Please select a valid fuel type";
          valid = false;
        }
        break;

      case "number":
        const cleaned = String(val).replace(/[\s-]/g, "").toUpperCase();
        // Standard Indian vehicle plate: 2 letters, 1-2 digits, 0-3 letters, 4 digits (or 4-12 alphanumeric)
        const expPlate = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{4}$/;
        if (!expPlate.test(cleaned) && !/^[A-Z0-9]{5,12}$/.test(cleaned)) {
          error = "Enter a valid vehicle number (e.g. MH12AB1234)";
          valid = false;
        } else {
          error = "";
          valid = true;
        }
        break;

      default:
        valid = true;
    }

    dispatch({ type: "update", fld: nm, value: val, error, valid, touched });
  };

  const senddata = async (e) => {
    e.preventDefault();

    // Dynamically retrieve customerid from state, or localStorage
    let customerid = Number(get(info.customerid) || 0);
    if (!customerid) {
      const storedCust = localStorage.getItem("custid");
      if (storedCust) {
        try { customerid = Number(JSON.parse(storedCust)); } catch (err) { customerid = Number(storedCust); }
      }
    }

    // If still missing, try to resolve via loginid
    if (!customerid) {
      const storedLogin = localStorage.getItem("loginid") || localStorage.getItem("userid");
      if (storedLogin) {
        let lid = null;
        try { lid = JSON.parse(storedLogin); } catch (err) { lid = storedLogin; }
        try {
          const resp = await fetch(`${API}/getCustomerdetails?loginid=` + (lid || storedLogin));
          if (resp.ok) {
            const cust = await resp.json();
            if (cust && cust.customerid) {
              customerid = cust.customerid;
              localStorage.setItem("custid", JSON.stringify(cust.customerid));
            }
          }
        } catch (err) {}
      }
    }

    const missing = [];
    const numVal = String(get(info.number) || "").replace(/[\s-]/g, "").toUpperCase();
    const modelVal = String(get(info.model) || "").trim();
    const fuelVal = String(get(info.fueltype) || "").trim();
    const yearVal = Number(get(info.regyear)) || 0;
    const brandVal = Number(get(info.brandid)) || 0;

    if (!numVal) missing.push("Vehicle number");
    if (!modelVal) missing.push("Model");
    if (!yearVal) missing.push("Registration year");
    if (!brandVal) missing.push("Brand");
    if (!fuelVal || fuelVal === "Select One") missing.push("Fuel type");
    if (!customerid) missing.push("Customer account (please sign in again)");

    if (missing.length) {
      setFormError("Please fill in: " + missing.join(", ") + ".");
      return;
    }

    setFormError("");

    const payload = {
      number: numVal,
      model: modelVal,
      fueltype: fuelVal,
      regyear: yearVal,
      brandid: brandVal,
      customerid: customerid,
    };

    fetch(`${API}/registervehicle`, {
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

        if (status === 200 && body && body.vehicleid) {
          setFormError("");
          alert("Vehicle successfully registered!");
          navigate("/customerhome/vehdetails");
        } else {
          setFormError(
            (body && body.message) ||
              "Registration failed. Please check the details and try again."
          );
        }
      })
      .catch(() =>
        setFormError("Could not reach the server. Please try again.")
      );
  };

  useEffect(() => {
    fetch(`${API}/getBrands`)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((c) => setAllbrands(Array.isArray(c) ? c : []))
      .catch(() => setAllbrands([]));

    // Resolve and sync customerid
    const storedCust = localStorage.getItem("custid");
    if (storedCust) {
      let cid = null;
      try { cid = JSON.parse(storedCust); } catch (e) { cid = storedCust; }
      if (cid) dispatch({ type: "update", fld: "customerid", value: Number(cid), valid: true });
    } else {
      const storedLogin = localStorage.getItem("loginid") || localStorage.getItem("userid");
      if (storedLogin) {
        let lid = null;
        try { lid = JSON.parse(storedLogin); } catch (e) { lid = storedLogin; }
        fetch(`${API}/getCustomerdetails?loginid=` + (lid || storedLogin))
          .then((r) => (r.ok ? r.json() : null))
          .then((cust) => {
            if (cust && cust.customerid) {
              localStorage.setItem("custid", JSON.stringify(cust.customerid));
              dispatch({ type: "update", fld: "customerid", value: cust.customerid, valid: true });
            }
          })
          .catch(() => {});
      }
    }
  }, []);


  return (
    <div style={{ backgroundColor: "white" }}>
      <div className="container">
        <h2 style={{ textAlign: "center" }}>Vehicle Registration</h2>
        {formError ? (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        ) : null}
        <form>
          <table className="table table table-striped">
            <tbody>
              <tr className="form-group">
                <td>
                  <label htmlFor="brandid"> Select Brand</label>
                </td>
                <td>
                  <select
                    className="form-group"
                    id="brandid"
                    name="brandid"
                    onChange={(e) => {
                      validate("brandid", e.target.value);
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
                  {/* <div
                    className="form-text"
                    style={{
                      display:
                        !info.brandid.valid && info.brandid.touched
                          ? "block"
                          : "none",
                    }}
                  >
                    {info.brandid.error}
                  </div> */}
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="number">
                    Vehicel Number : (e.g.MH13CN5962)
                  </label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="number"
                    placeholder="Enter Vehicle Number"
                    name="number"
                    value={info.number.value}
                    onChange={(e) => {
                      validate("number", e.target.value);
                    }}
                  />
                  <div
                    className="form-text"
                    style={{
                      display:
                        !info.number.valid && info.number.touched
                          ? "block"
                          : "none",
                    }}
                  >
                    {info.number.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="model">Model :</label>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    id="model"
                    placeholder="Enter Model Details"
                    name="model"
                    value={info.model.value}
                    onChange={(e) => {
                      validate("model", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.model.valid && info.model.touched
                          ? "block"
                          : "none",
                    }}
                  >
                    {info.model.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="fueltype"> Select Fuel Type :</label>
                </td>
                <td>
                  <select
                    className="form-group"
                    id="fueltype"
                    name="fueltype"
                    onChange={(e) => {
                      validate("fueltype", e.target.value);
                    }}

                  >
                    <option>Select One</option>
                    {fueltypes.map((f) => {
                      return (
                        <option value={f.fueltype} key={f.fueltype}>
                          {f.fueltype}
                        </option>
                      );
                    })}
                  </select>
                  {/* <div
                    className="form-text"
                    style={{
                      display:
                        !info.fueltype.valid && info.fueltype.touched
                          ? "block"
                          : "none",
                    }}
                  >
                    {info.fueltype.error}
                  </div> */}
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="reyear"> Registration Year :</label>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter Registration Year"
                    id="regyear"
                    name="regyear"
                    value={info.regyear.value}
                    onChange={(e) => {
                      validate("regyear", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.regyear.valid && info.regyear.touched
                          ? "block"
                          : "none",
                    }}
                  >
                    {info.regyear.error}
                  </div>
                </td>
              </tr>
              <tr className="form-group">
                <td>
                  <label htmlFor="running">
                    Current Vehicle Running (Kilometer) :
                  </label>
                </td>
                <td>
                  <input
                    type="number"
                    className="form-control"
                    id="running"
                    placeholder="Enter Travelled Distance"
                    name="running"
                    value={info.running.value}
                    onChange={(e) => {
                      validate("running", e.target.value);
                    }}
                  />
                  <div
                    id="emailHelp"
                    className="form-text"
                    style={{
                      display:
                        !info.running.valid && info.running.touched
                          ? "block"
                          : "none",
                    }}
                  >
                    {info.running.error}
                  </div>
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
