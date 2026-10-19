import { API } from "../../api";
import moment from "moment";
import { useEffect, useState } from "react";
import Transaction from "./Transaction";

export default function UpdateServiceProgress() {
  const [data, setDate] = useState([]);
  const [servProg, setServProg] = useState([]);
  const [msg, setMsg] = useState("");
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [displayList, setDisplayList] = useState(false);
  const [paymentMode, setPaymentMode] = useState(null);
  const [transactionData, setTransactionData] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [serviceRequestId, setServiceRequestId] = useState(0);
  // Was hardcoded to today inside the effect, so a centre could never open a
  // job booked for another day — including yesterday's job it still has to
  // deliver. The endpoint already takes an arbitrary date.
  const [servicdate, setServicdate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );

  const handlePaymentModeChange = (evt) => {
    setPaymentMode(evt.target.value);
  };

  //Handle Transaction-----------------------
  const handleTransaction = () => {
    if (servProg) {
      console.log("ServProg" + servProg);
      setShowCheckoutDialog(true);

      localStorage.setItem("serviceprogressid", servProg?.serviceprogressid);

      const reqOptions = {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          amount: servProg?.servicerequestid?.pkgid?.cost,
          date: new Date(),
          paymentmode: paymentMode,
          serviceprogressid: servProg?.serviceprogressid,
        }),
      };
      //To Add Transaction details in table ------------
      fetch(`${API}/addTransaction`, reqOptions)
        .then((resp) => resp.json())
        .then((jsonData) => {
          setTransactionData(jsonData);
          setShowCheckoutDialog(false);
          return jsonData;
        })
        .then((transactionData) => {
          //call checkout here
          checkOut(
            transactionData?.serviceprogres.servicerequestid.servicerequestid
          );
          console.log("jsonData-", transactionData);

          const reqOptions = {
            mode: "no-cors",
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              status: true,
              servicerequestid:
                transactionData?.serviceprogres.servicerequestid
                  .servicerequestid,
              transactionid: transactionData?.transactionid,
            }),
          };
          console.log("Request Options " + reqOptions);
          return fetch(`${API}/createInvoice`, reqOptions)
            .then((response) => response.json())
            .then((jsonData) => {
              setInvoiceData(jsonData);
            })

            .catch((e) => console.log(e));
        })

        .catch((e) => console.log(e));
    }
  };

  //Enter Check In details-----------------------
  const checkIn = (servicerequestId) => {
    const reqOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        checkin: new Date().toISOString(),
        stageone: null,
        stagetwo: null,
        checkout: null,
        delivered: null,
        servicerequestid: servicerequestId,
      }),
    };
    fetch(`${API}/addCheckIn`, reqOptions)
      .then((resp) => resp.json())
      .then((jsonData) => {
        if (jsonData.checkin !== null) {
          alert("Check In Complete!");
        }
        console.log(jsonData);
      })
      .catch((e) => console.log(e));
  };

  //Enter Stage One details-----------------------
  const stageOne = (servicerequestId) => {
    const reqOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stageone: new Date().toISOString(),
        stagetwo: null,
        checkout: null,
        delivered: null,
        checkin: null,
        servicerequestid: servicerequestId,
      }),
    };
    fetch(`${API}/addStageOne`, reqOptions)
      .then((resp) => resp.json())
      .then((jsonData) => {
        if (jsonData.stageone !== null) {
          alert("Stage One Complete!");
        }
        console.log(jsonData);
      })
      .catch((e) => console.log(e));
  };

  //Enter Stage Two details-----------------------
  const stageTwo = (servicerequestId) => {
    const reqOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        stageone: null,
        stagetwo: new Date().toISOString(),
        checkout: null,
        delivered: null,
        checkin: null,
        servicerequestid: servicerequestId,
      }),
    };
    fetch(`${API}/addStageTwo`, reqOptions)
      .then((resp) => resp.json())
      .then((jsonData) => {
        if (jsonData.stagetwo !== null) {
          alert("Stage Two Complete!");
        }
        console.log(jsonData);
      })
      .catch((e) => console.log(e));
  };

  //Enter Check Out details-----------------------
  const checkOut = (servicerequestId) => {
    const reqOptions = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        checkin: null,
        stageone: null,
        stagetwo: null,
        checkout: new Date().toISOString(),
        delivered: null,
        servicerequestid: servicerequestId,
      }),
    };
    fetch(`${API}/addCheckOut`, reqOptions)
      .then((resp) => resp.json())
      .then((jsonData) => {
        if (jsonData.checkout !== null) {
          alert("Checkout Complete!");
        }
        console.log(jsonData);
      })
      .catch((e) => console.log(e));

    fetch(
      `${API}/getServProgIdByServreqId?ServReqId=` +
        servicerequestId
    )
      .then((resp) => resp.json())
      .then((jsonData) => setServProg(jsonData))
      .then(() => {
        // setShowCheckoutDialog(true);
      })
      .catch((e) => console.log(e));
  };

  //Enter delivered details-----------------------
  const delivered = (servicerequestId) => {
    changeServiceStatus(servicerequestId);
    fetch(`${API}/addDelivered?srid=` + servicerequestId)
      .then((resp) => resp.json())
      .then((jsonData) => {
        if (jsonData.delivered === true) {
          alert("Service Complete!");
        }
        console.log(jsonData);
      })
      .catch((e) => console.log(e));
  };

  const changeServiceStatus = (servicerequestId) => {
    fetch(`${API}/changeStatus?srid=` + servicerequestId)
      .then((resp) => {
        if (resp.status === 200) {
          alert("Service Complete");
          return resp.json();
        }
      })
      .catch((e) => console.log(e));
  };

  const fetchServiceProgress = (servicerequestId) => {
    fetch(
      `${API}/getServProgIdByServreqId?ServReqId=` +
        servicerequestId
    )
      .then((resp) => resp.json())
      .then((jsonData) => setServProg(jsonData))
      .then(() => {
        // setShowCheckoutDialog(true);
      })
      .catch((e) => console.log(e));
  };

  const openCheckoutDialog = (servicerequestId) => {
    fetchServiceProgress(servicerequestId);
    setShowCheckoutDialog(true);
  };

  // Fetch this centre's service requests for the selected date.
  useEffect(() => {
    var url =
      `${API}/getAllServiceReqsByDateSc?date=` +
      servicdate +
      "&scid=" +
      localStorage.getItem("scid");
    fetch(url)
      .then((resp) => resp.json())
      .then((jsonData) => {
        const list = Array.isArray(jsonData) ? jsonData : [];
        setDate(list);
        if (list.length === 0) {
          setDisplayList(true);
          setMsg(
            servicdate === moment(new Date()).format("YYYY-MM-DD")
              ? "No bookings today"
              : "No bookings on " + servicdate
          );
        } else {
          setDisplayList(false);
          setMsg("");
        }
      })
      .catch((e) => {
        setDisplayList(true);
        setMsg("Could not reach the server. Please try again.");
      });
  }, [servicdate]);

  const today = moment(new Date()).format("YYYY-MM-DD");

  return (
    <div className="container-fluid">
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow--accent">Workshop</span>
          <h1 className="page-header__title">Booking list</h1>
          <p className="page-header__sub">
            Pick a date to see the jobs booked for it, then move each one
            through check-in, repair, QC and delivery.
          </p>
        </div>
        <div className="page-header__actions">
          <label className="form-label" htmlFor="svc-date">
            Service date
          </label>
          <input
            id="svc-date"
            type="date"
            className="form-control"
            value={servicdate}
            max="2099-12-31"
            onChange={(e) => e.target.value && setServicdate(e.target.value)}
          />
          {servicdate !== today && (
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setServicdate(today)}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {msg && (
        <div
          className={`alert ${displayList ? "alert-info" : "alert-danger"}`}
          role="alert"
        >
          {msg}
        </div>
      )}
      <table
        className="table table table-striped"
        style={{
          display: displayList ? "none" : "block",
          overflowX: "auto",
          width: "auto",
        }}
      >
        <thead>
          <tr>
            <th>Vehicle Number</th>
            <th>Owner Name</th>
            <th>Owner Contact Number</th>
            <th>Pickup Time</th>
            <th>Address</th>
            <th>Package</th>
            <th colSpan={4}>Update Progress</th>
            <th colSpan={2}>Completion Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((b, index) => {
            return (
              <tr key={index} value={b.servicerequestid}>
                <td>{b.vehid.vehiclenumber}</td>
                <td>{b.vehid.customerid?.firstname}</td>
                <td>{b.vehid.customerid?.contactno}</td>
                <td>{b.pickuptime}</td>
                <td>{b.vehid.customerid?.lane}</td>
                <td>{b.pkgid.packagename}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => checkIn(b.servicerequestid)}
                  >
                    Check-In
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-info"
                    onClick={() => stageOne(b.servicerequestid)}
                  >
                    Stage-1 Complete
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-warning"
                    onClick={() => stageTwo(b.servicerequestid)}
                  >
                    Stage-2 Complete
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => openCheckoutDialog(b.servicerequestid)}
                  >
                    Check-Out
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-success"
                    onClick={() => delivered(b.servicerequestid)}
                  >
                    Delivered
                  </button>
                </td>
                <td>{b.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Transaction
        show={showCheckoutDialog}
        data={servProg}
        onClose={() => setShowCheckoutDialog(true)}
        handleSave={handleTransaction}
        handlePaymentModeChange={handlePaymentModeChange}
      />
    </div>
  );
}
