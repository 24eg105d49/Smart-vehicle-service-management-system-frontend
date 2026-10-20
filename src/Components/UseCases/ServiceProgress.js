import { API } from "../../api";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiClock, FiFileText, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function ServiceProgress() {
  const [servcData, setServcData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [selectedSrid, setSelectedSrid] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    let custid = null;
    const storedCust = localStorage.getItem("custid");
    if (storedCust) {
      try {
        custid = JSON.parse(storedCust);
      } catch (e) {
        custid = storedCust;
      }
    }

    const loadBookings = (cid) => {
      if (!cid || cid === "null" || Number(cid) <= 0) {
        setLoading(false);
        setMsg("No bookings found yet. Please book an appointment first.");
        return;
      }

      fetch(`${API}/getSerReqsByCid?cid=` + cid)
        .then((resp) => (resp.ok ? resp.json() : []))
        .then((jsonData) => {
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            setServcData(jsonData);
            setMsg("");
          } else {
            setServcData([]);
            setMsg("No service bookings found on your account.");
          }
        })
        .catch((e) => {
          console.error(e);
          setServcData([]);
          setMsg("Could not load booking details. Please try again.");
        })
        .finally(() => setLoading(false));
    };

    if (custid && Number(custid) > 0) {
      loadBookings(custid);
    } else {
      // Attempt resolving custid via loginid
      const storedLogin = localStorage.getItem("loginid") || localStorage.getItem("userid");
      if (storedLogin) {
        let lid = null;
        try {
          lid = JSON.parse(storedLogin);
        } catch (e) {
          lid = storedLogin;
        }
        fetch(`${API}/getCustomerdetails?loginid=` + (lid || storedLogin))
          .then((r) => (r.ok ? r.json() : null))
          .then((cust) => {
            if (cust && cust.customerid) {
              localStorage.setItem("custid", JSON.stringify(cust.customerid));
              loadBookings(cust.customerid);
            } else {
              setLoading(false);
              setMsg("No bookings found yet. Please book an appointment first.");
            }
          })
          .catch(() => {
            setLoading(false);
            setMsg("Could not load your account bookings.");
          });
      } else {
        setLoading(false);
        setMsg("Please log in to view your service progress.");
      }
    }
  }, []);

  const showProgress = (servicerequestid) => {
    setSelectedSrid(servicerequestid);
    setProgressData(null);
    setProgressError("");
    setShowInvoice(false);
    setProgressLoading(true);

    fetch(`${API}/getServProgIdByServreqId?ServReqId=` + servicerequestid)
      .then((resp) => (resp.ok ? resp.text() : null))
      .then((text) => {
        if (!text || !text.trim()) {
          setProgressError("No job card created yet. The service centre will update progress once your vehicle arrives.");
          return;
        }
        try {
          const jsonData = JSON.parse(text);
          if (jsonData && jsonData.serviceprogressid) {
            setProgressData(jsonData);
            setProgressError("");
          } else {
            setProgressError("No job card created yet. The service centre will update progress once your vehicle arrives.");
          }
        } catch (err) {
          setProgressError("No job card created yet. The service centre will update progress once your vehicle arrives.");
        }
      })
      .catch((e) => {
        console.error(e);
        setProgressError("Could not retrieve progress information.");
      })
      .finally(() => setProgressLoading(false));
  };

  const getInvoiceData = (servicerequestid) => {
    if (!servicerequestid) return;
    setInvoiceLoading(true);
    setShowInvoice(true);
    fetch(`${API}/getInvoiceBySvReqId?sreqid=` + servicerequestid)
      .then((resp) => (resp.ok ? resp.text() : null))
      .then((text) => {
        if (text && text.trim()) {
          try {
            setInvoiceData(JSON.parse(text));
          } catch (e) {
            setInvoiceData(null);
          }
        } else {
          setInvoiceData(null);
        }
      })
      .catch((e) => {
        console.error(e);
        setInvoiceData(null);
      })
      .finally(() => setInvoiceLoading(false));
  };

  const formatTime = (ts) => {
    if (!ts) return "Pending";
    try {
      const s = String(ts);
      if (s.includes("T")) {
        return s.slice(11, 19);
      }
      return s.slice(0, 19);
    } catch (e) {
      return String(ts);
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow--accent">Track Service</span>
          <h1 className="page-header__title">Service Progress</h1>
          <p className="page-header__sub">
            Follow every vehicle job from check-in through to delivery and invoice.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="panel p-4 text-center">
          <p>Loading your service bookings…</p>
        </div>
      ) : servcData.length === 0 ? (
        <div className="panel p-4 text-center">
          <div className="empty-state">
            <FiClock size={36} style={{ color: "var(--color-primary, #0d6efd)", marginBottom: 12 }} />
            <h4>{msg || "No Service Bookings Found"}</h4>
            <p className="text-muted">You haven't scheduled any service appointments yet.</p>
            <Link to="/customerhome/viewScLogin" className="btn btn-primary mt-2">
              Book a Service
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel mb-4">
          <div className="card-header" style={{ padding: "16px 20px" }}>
            <h5 className="m-0">Your Service Bookings</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking ID</th>
                  <th>Service Date</th>
                  <th>Vehicle</th>
                  <th>Pickup Time</th>
                  <th>Service Centre</th>
                  <th>Package</th>
                  <th>Cost</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {servcData.map((s, index) => {
                  const dateStr = s.servicdate ? String(s.servicdate).slice(0, 10) : "N/A";
                  const vehPlate = s.vehid?.vehiclenumber || "N/A";
                  const brandName = s.vehid?.brandid?.bname || "";
                  const scName = s.scid?.scname || "Authorised Centre";
                  const pkgName = s.pkgid?.packagename || "Standard";
                  const cost = s.pkgid?.cost != null ? `₹${s.pkgid.cost}` : "—";
                  const isSelected = selectedSrid === s.servicerequestid;

                  return (
                    <tr key={s.servicerequestid || index} className={isSelected ? "table-active" : ""}>
                      <td>#{s.servicerequestid}</td>
                      <td><b>{dateStr}</b></td>
                      <td>
                        <b>{vehPlate}</b>
                        {brandName ? <small className="text-muted d-block">{brandName}</small> : null}
                      </td>
                      <td>{s.pickuptime || "Standard"}</td>
                      <td>{scName}</td>
                      <td>{pkgName}</td>
                      <td>{cost}</td>
                      <td>
                        <button
                          type="button"
                          className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-outline-primary"}`}
                          onClick={() => showProgress(s.servicerequestid)}
                        >
                          <FiClock size={14} style={{ marginRight: 4 }} /> Track
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Progress Detail Block */}
      {selectedSrid ? (
        <div className="panel mb-4">
          <div className="card-header" style={{ padding: "16px 20px" }}>
            <h5 className="m-0">
              Live Progress Details for Booking #{selectedSrid}
            </h5>
          </div>
          <div className="card-body p-4">
            {progressLoading ? (
              <p className="text-muted">Loading live progress details…</p>
            ) : progressError ? (
              <div className="alert alert-info d-flex align-items-center" role="alert">
                <FiAlertCircle size={20} className="me-2" />
                <div>{progressError}</div>
              </div>
            ) : progressData ? (
              <div>
                <div className="table-responsive">
                  <table className="table table-bordered align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Job Card ID</th>
                        <th>Check In</th>
                        <th>Stage-I Complete</th>
                        <th>Stage-II Complete</th>
                        <th>Check Out</th>
                        <th>Delivery Status</th>
                        <th>Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>#{progressData.serviceprogressid}</td>
                        <td>{formatTime(progressData.checkin)}</td>
                        <td>{formatTime(progressData.stageone)}</td>
                        <td>{formatTime(progressData.stagetwo)}</td>
                        <td>{formatTime(progressData.checkout)}</td>
                        <td>
                          {progressData.delivered ? (
                            <span className="badge bg-success">
                              <FiCheckCircle className="me-1" /> Delivered
                            </span>
                          ) : (
                            <span className="badge bg-warning text-dark">In Service</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() =>
                              getInvoiceData(
                                progressData.servicerequestid?.servicerequestid || selectedSrid
                              )
                            }
                          >
                            <FiFileText size={14} className="me-1" /> View Invoice
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Invoice Section */}
                {showInvoice ? (
                  <div className="mt-4 p-3 border rounded bg-light">
                    <h5>Invoice Breakdown</h5>
                    {invoiceLoading ? (
                      <p className="text-muted">Loading invoice…</p>
                    ) : invoiceData && invoiceData.invoiceid ? (
                      <table className="table table-striped table-bordered mt-2 bg-white">
                        <tbody>
                          <tr>
                            <th>Invoice Number</th>
                            <td>#{invoiceData.invoiceid}</td>
                          </tr>
                          <tr>
                            <th>Transaction Ref</th>
                            <td>{invoiceData.transactionid?.transactionid || "N/A"}</td>
                          </tr>
                          <tr>
                            <th>Amount Paid</th>
                            <td>₹{invoiceData.transactionid?.amount || "0"}</td>
                          </tr>
                          <tr>
                            <th>Payment Mode</th>
                            <td>{invoiceData.transactionid?.paymentmode || "Cash / Card"}</td>
                          </tr>
                          <tr>
                            <th>Payment Timestamp</th>
                            <td>{invoiceData.transactionid?.date ? String(invoiceData.transactionid.date).slice(0, 19) : "N/A"}</td>
                          </tr>
                          <tr>
                            <th>Status</th>
                            <td><span className="badge bg-success">Settled</span></td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <div className="alert alert-warning mb-0">
                        Invoice is not generated yet. The service centre generates the invoice upon checkout.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
