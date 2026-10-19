import { API } from "../../api";
import { useEffect, useReducer, useState } from "react";
import BackgroundSlider from "react-background-slider";
import { useDispatch } from "react-redux";
import { Outlet, useNavigate, Link } from "react-router-dom";
import moment from "moment";

export default function BookAppointment() {
  let navigate = useNavigate();
  const reduxAction = useDispatch();
  const [vehData, setVehData] = useState([]);
  const [bookingData, setBookingData] = useState({});
  const [msg, setMsg] = useState("");
  const [servDate, setServDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showRes, setShowRes] = useState(false);
  const [showMsg, setShowMsg] = useState(false);

  const init = {
    servicdate: new Date(),
    pickuptime: { value: "", error: "", valid: false, touched: false },
    vehicleid: 0,
    brandid: localStorage.getItem("bid"),
    servicecenterid: localStorage.getItem("scid"),
    packageid: localStorage.getItem("pkgid"),
    bookingdate: new Date(),
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case "update":
        return {
          ...state,
          [action.fld]: action.value,
        };
      case "reset":
        return init;
    }
  };
  const [info, dispatch] = useReducer(reducer, init);
  const validate = (nm, val) => {
    if (info.pickuptime.touched === false) {
      info.pickuptime = "00:00:00";
    }
    //console.log("Pickuptime " + info.pickuptime);

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
    }

    // console.log(val + "," + error + "," + valid);
    dispatch({ type: "update", fld: nm, value: val, error, valid, touched });
  };

  const sendData = () => {
    // console.log("*************************");
    // console.log(info);
    // console.log("*************************");
    const reqOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(info),
    };

    fetch(`${API}/addServiceRequest`, reqOptions)
      .then((resp) => resp.json())
      .then((jsonData) => {
        setBookingData(jsonData);
        // console.log(jsonData);
        if (jsonData.servicerequestid !== 0) {
          alert("Booking Successful...!");
          navigate("/customerhome/serviceprogress");
          //window.location.reload();
        }
      })
      .catch((e) => {
        alert("Booking Failed...!");
        window.location.reload();
        console.log(e);
      });
  };

  useEffect(() => {
    if (localStorage.getItem("pkgid") === null) {
      setShowRes(true);
      setShowMsg(false);
    } else {
      setShowRes(false);
      setShowMsg(true);
      // document.getElementById("msg").setAttribute("style", "display:none");
      // document.getElementById("res").setAttribute("style", "display:block");
      getVehData();
    }
  }, []);

  const getVehData = () => {
    var custid = localStorage.getItem("custid");
    var brandid = localStorage.getItem("bid");
    //console.log("Veh data fetch");
    var url =
      `${API}/getVehiclesByCidBid?cid=` +
      custid +
      "&bid=" +
      brandid;
    fetch(url)
      .then((resp) => resp.json())
      .then((jsonData) => {
        if (jsonData.length === 0) {
          //setMsg("No data Available - Please Register vehicle");
        } else {
          setVehData(jsonData);
          // console.log("Attribute");
          // console.log(jsonData);
          //document.getElementById("res").setAttribute("style", "display:block");
        }
      })
      .catch((e) => console.log(e));
  };

  useEffect(() => {
    var date = new Date();

    var sevendate = new Date();
    var seventh_day = new Date(sevendate.setDate(sevendate.getDate() + 7));

    var startdate = moment(date).format("YYYY-MM-DD");
    setStartDate(startdate);
    let enddate = moment(seventh_day).format("YYYY-MM-DD");
    setEndDate(enddate);
    // console.log("Date-" + startdate);
    // console.log("NextDate-" + enddate);
  });

  return (
    <div style={{ minHeight: "100%" }}>
      <h3>Book Appointment</h3>
      <hr />
      <span id="msg" style={{ display: showMsg ? "none" : "block" }}>
        <h5>
          Select Service Center and Package first - To select Please Go to
          <span style={{ color: "red" }}> View Service Centers Menu</span>
        </h5>
      </span>
      {/* ------------------ res --------------------------- */}
      <div id="res" style={{ display: showRes ? "none" : "block" }}>
        <div style={{ width: "auto", overflowX: "auto", overflowY: "auto" }}>
          <form onSubmit={(e) => e.preventDefault()}>
            <table className="table table table-striped">
              <tbody>
                <tr>
                  <td>Select vehicle :</td>
                  <td>
                    <select
                      className="form-group"
                      id="vehicleid"
                      name="vehicleid"
                      onChange={(e) => {
                        dispatch({
                          type: "update",
                          fld: "vehicleid",
                          value: e.target.value,
                        });
                      }}
                    >
                      <option>Select One</option>
                      {vehData?.map((veh, index) => {
                        return (
                          <option value={veh.vehicleid} key={index}>
                            {veh.vehiclenumber}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                </tr>
                <tr className="form-group">
                  <td>
                    <label htmlFor="servicedate">Select Service Date:</label>
                  </td>
                  <td>
                    <input
                      type="date"
                      className="form-control"
                      id="servicdate"
                      name="servicdate"
                      value={info.servicdate.value}
                      min={startDate}
                      max={endDate}
                      onChange={(e) => {
                        validate("servicdate", e.target.value);
                      }}
                      onBlur={(e) => {
                        setServDate(e.target.value);
                      }}
                    />
                    <div
                      id="emailHelp"
                      className="form-text"
                      style={{
                        display:
                          !info.servicdate.valid && info.servicdate.touched
                            ? "block"
                            : "none",
                      }}
                    >
                      {info.servicdate.error}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    Pickup Time (optional)
                    <br />
                    Additional Charges may apply.
                  </td>
                  <td>
                    <input
                      type="time"
                      className="form-control"
                      id="pickuptime"
                      name="pickuptime"
                      value={info.pickuptime.value}
                      min="09:00"
                      max="12:00"
                      onChange={(e) => {
                        validate("pickuptime", e.target.value);
                      }}
                    />
                    <div
                      id="emailHelp"
                      className="form-text"
                      style={{
                        display:
                          !info.pickuptime.valid && info.pickuptime.touched
                            ? "block"
                            : "none",
                      }}
                    >
                      {info.pickuptime.error}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <button className="btn btn-primary" onClick={sendData}>
                      Book
                    </button>
                    <hr />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>Want To Change Service Center/Package ?</td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <button className="btn btn-primary">
                      <Link to="/customerhome/viewScLogin" className="nav-link">
                        Change
                      </Link>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
