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
        console.log(brandid);
        const exp1 = /^[0]$/;
        if (!exp1.test(val)) {
          error = "Invalid Choice";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "running":
        const exp5 = /^[0-9]{1,}$/;
        if (!exp5.test(val)) {
          error = "Invalid Input";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "regyear":
        const exp2 = /^[0-9]{4}$/;
        if (!exp2.test(val)) {
          error = "Write Valid Year";
        } else {
          error = "";
          valid = true;
        }
        break;

      case "model":
        error = "";
        valid = true;
        break;

      case "fueltype":
        // String has no .equals() in JS — the old chain threw
        // `val.equals is not a function` the moment a fuel type was picked.
        if (val === "Petrol" || val === "Diesel" || val === "CNG") {
          error = "";
          valid = true;
        } else {
          error = "Please Select Valid Options";
          valid = false;
        }
        break;

      case "number":
        const exp6 = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
        if (!exp6.test(val)) {
          error = "Write in Capital Letters with no space";
        } else {
          error = "";
          valid = true;
        }
        break;
    }

    //console.log(val + "," + error + "," + valid);
    dispatch({ type: "update", fld: nm, value: val, error, valid, touched });
  };

  const senddata = (e) => {
    e.preventDefault();

    // Submit guard: brand starts as 0 and fueltype has no selection.
    const missing = [];
    const required = [
      ["number", "Vehicle number"],
      ["model", "Model"],
      ["regyear", "Registration year"],
      ["running", "Current running (km)"],
    ];
    required.forEach(([fld, label]) => {
      const v = get(info[fld]);
      if (v === null || v === undefined || String(v).trim() === "") {
        missing.push(label);
      }
    });
    if (!Number(get(info.brandid) || 0)) missing.push("Brand");
    if (!String(get(info.fueltype) || "").trim()) missing.push("Fuel type");

    const invalid = ["number", "model", "regyear", "running"].filter(
      (fld) => !isValid(info[fld])
    );

    const customerid = Number(get(info.customerid) || 0);
    if (!customerid) missing.push("your customer account");

    if (missing.length || invalid.length) {
      const parts = [];
      if (missing.length) parts.push("fill in: " + missing.join(", "));
      if (invalid.length) parts.push("correct the highlighted fields");
      setFormError("Please " + parts.join(", and ") + ".");
      return;
    }
    setFormError("");

    // Flatten deliberately. State holds {value,error,valid,touched} wrappers
    // while the backend DTO expects plain values.
    const payload = {
      number: String(get(info.number)).trim().toUpperCase(),
      model: String(get(info.model)).trim(),
      fueltype: String(get(info.fueltype)).trim(),
      regyear: Number(get(info.regyear)) || 0,
      brandid: Number(get(info.brandid)) || 0,
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

        // A failed save used to return HTTP 200 with an empty body, which
        // this check treated as success. Require a real vehicle id back.
        if (status === 200 && body && body.vehicleid) {
          setFormError("");
          alert("Vehicle Information Added.");
          navigate("/customerhome");
        } else {
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

  useEffect(() => {
    fetch(`${API}/getBrands`)
      .then((resp) => resp.json())
      .then((c) => setAllbrands(c));
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
                    onChange={(e) =>
                      dispatch({
                        type: "update",
                        fld: "brandid",
                        value: e.target.value,
                      })
                    }
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
                      dispatch({
                        type: "update",
                        fld: "fueltype",
                        value: e.target.value,
                      });
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
