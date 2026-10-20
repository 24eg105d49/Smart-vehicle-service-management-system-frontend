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
    servicdate: moment(new Date()).format("YYYY-MM-DD"),
    pickuptime: "09:00",
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
      default:
        return state;
    }
  };
  const [info, dispatch] = useReducer(reducer, init);
  const validate = (nm, val) => {
    dispatch({ type: "update", fld: nm, value: val });
  };

  const sendData = (e) => {
    if (e) e.preventDefault();
    if (!info.vehicleid || info.vehicleid === "Select One" || Number(info.vehicleid) === 0) {
      alert("Please select a vehicle.");
      return;
    }
    const servDateVal =
      typeof info.servicdate === "string" && info.servicdate
        ? info.servicdate
        : servDate || moment(new Date()).format("YYYY-MM-DD");
    const pickTimeVal =
      typeof info.pickuptime === "string" && info.pickuptime
        ? info.pickuptime
        : "09:00:00";
    const scidVal = Number(info.servicecenterid || localStorage.getItem("scid"));
    const pkgidVal = Number(info.packageid || localStorage.getItem("pkgid"));

    const payload = {
      bookingdate: new Date(),
      servicdate: servDateVal,
      pickuptime: pickTimeVal.length === 5 ? pickTimeVal + ":00" : pickTimeVal,
      vehicleid: Number(info.vehicleid),
      servicecenterid: scidVal,
      packageid: pkgidVal,
    };

    const reqOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    };

    fetch(`${API}/addServiceRequest`, reqOptions)
      .then((resp) => {
        if (!resp.ok) {
          throw new Error("Failed to book appointment");
        }
        return resp.json();
      })
      .then((jsonData) => {
        setBookingData(jsonData);
        if (jsonData && (jsonData.servicerequestid || jsonData.serviceRequestId)) {
          alert("Booking Successful...!");
          navigate("/customerhome/serviceprogress");
        } else {
          alert("Booking failed. Please check details.");
        }
      })
      .catch((e) => {
        alert("Booking Failed...!");
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
      getVehData();
    }
  }, []);

  const getVehData = () => {
    var custid = localStorage.getItem("custid");
    var brandid = localStorage.getItem("bid");
    var url =
      `${API}/getVehiclesByCidBid?cid=` +
      custid +
      "&bid=" +
      brandid;
    fetch(url)
      .then((resp) => resp.json())
      .then((jsonData) => {
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
          setVehData([]);
        } else {
          setVehData(jsonData);
        }
      })
      .catch((e) => {
        console.log(e);
        setVehData([]);
      });
  };

  useEffect(() => {
    var date = new Date();

    var sevendate = new Date();
    var seventh_day = new Date(sevendate.setDate(sevendate.getDate() + 7));

    var startdate = moment(date).format("YYYY-MM-DD");
    setStartDate(startdate);
    let enddate = moment(seventh_day).format("YYYY-MM-DD");
    setEndDate(enddate);
  }, []);

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
                      value={
                        typeof info.servicdate === "string"
                          ? info.servicdate
                          : servDate || ""
                      }
                      min={startDate}
                      max={endDate}
                      onChange={(e) => {
                        setServDate(e.target.value);
                        validate("servicdate", e.target.value);
                      }}
                    />
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
                      value={
                        typeof info.pickuptime === "string"
                          ? info.pickuptime
                          : "09:00"
                      }
                      min="09:00"
                      max="12:00"
                      onChange={(e) => {
                        validate("pickuptime", e.target.value);
                      }}
                    />
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
