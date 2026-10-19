import { API } from "../../api";
import { useEffect, useState } from "react";
import { resolvePath } from "react-router-dom";

export default function ServiceProgress() {
  const [servcData, SetServcData] = useState([]);
  const [msg, setMsg] = useState("");
  const [noProgress, setNoProgress] = useState("");
  const [progressData, setProgressData] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [displayProgress, setDisplayProgress] = useState(false);
  const [listDisplay, setListDisplay] = useState(false);
  const [stageOneMsg, setStageOneMsg] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [showMsg, setShowMsg] = useState(false);

  useEffect(() => {
    var custid = localStorage.getItem("custid");
    fetch(`${API}/getSerReqsByCid?cid=` + custid)
      .then((resp) => resp.json())
      .then((jsonData) => {
        console.log(jsonData);
        if (jsonData.length === 0) {
          setListDisplay(false);
          setMsg("No Booking Details Found");
        } else {
          SetServcData(jsonData);
          setListDisplay(true);
          setMsg("");
        }
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  const showProgress = (servicerequestid) => {
    console.log("Service Request ID" + servicerequestid);
    setDisplayProgress(false);
    fetch(
      `${API}/getServProgIdByServreqId?ServReqId=` +
        servicerequestid
    )
      .then((resp) => resp.json())
      .then((jsonData) => {
        console.log("JSON DATA", jsonData);
        setProgressData(jsonData);
        return jsonData;
      })
      .catch((e) => console.log(e));
  };

  //get Invoice Details by ServiceRequest ID
  const getInvoiceData = (servicerequestid) => {
    fetch(
      `${API}/getInvoiceBySvReqId?sreqid=` + servicerequestid
    )
      .then((resp) => resp.json())
      .then((jsonData) => {
        setInvoiceData(jsonData);
        setShowInvoice(true);
        console.log("Invoice ", jsonData);
        return jsonData;
      })
      .catch((e) => console.log(e));
  };

  return (
    <div>
      <div style={{ backgroundColor: "lightgray" }}>
        <h3>Service Progress</h3>
      </div>
      <hr />
      <h5 style={{ color: "red" }}>{msg}</h5>
      <div style={{ display: listDisplay ? "block" : "none" }}>
        <h5 style={{ backgroundColor: "lightgray" }}>Service Request List</h5>
        <div
          style={{
            overflowX: "auto",
            width: "auto",
          }}
        >
          <div style={{ width: "auto", overflowX: "auto", overflowY: "auto" }}>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Service Date</th>
                  <th>Vehicle Number</th>
                  <th>Pickup Time</th>
                  <th>Brand</th>
                  <th>Service Center Name</th>
                  <th>Package Name</th>
                  <th>Cost</th>
                  <th>Facilities Count</th>
                  <th>Track Progress</th>
                </tr>
              </thead>
              <tbody>
                {servcData.map((s, index) => {
                  return (
                    <tr key={index}>
                      <td>{JSON.stringify(s.servicdate).slice(1, 11)}</td>
                      <td>{s.vehid.vehiclenumber}</td>
                      <td>{s.pickuptime}</td>
                      <td>{s.vehid.brandid.bname}</td>
                      <td>{s.scid.scname}</td>
                      <td>{s.pkgid.packagename}</td>
                      <td>{s.pkgid.cost}</td>
                      <td>{s.pkgid.facilities.length}</td>
                      <td>
                        <button
                          onClick={() => showProgress(s.servicerequestid)}
                        >
                          Track
                        </button>
                      </td>
                      <td>{s.servicerequestid}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <br />
          {/* <h3 style={{ display: showMsg ? "block" : "none", color: "red" }}>
            {noProgress}
          </h3> */}
          <div style={{ display: displayProgress ? "none" : "block" }}>
            <h3>Progress Details</h3>

            <br />
            <div
              style={{ width: "auto", overflowX: "auto", overflowY: "auto" }}
            >
              <table className="table table table-striped">
                <thead>
                  <tr>
                    <th>Job Card ID</th>
                    <th>Check In</th>
                    <th>Stage-I Completion</th>
                    <th>Stage-II Completion</th>
                    <th>Check Out</th>
                    <th>Delivery Completion Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{progressData?.serviceprogressid}</td>
                    <td>{progressData?.checkin?.slice(11, 19)}</td>
                    <td>{progressData?.stageone?.slice(11, 19)}</td>
                    <td>{progressData?.stagetwo?.slice(11, 19)}</td>
                    <td>{progressData?.checkout?.slice(11, 19)}</td>
                    <td>{progressData?.delivered?.toString()}</td>
                    <td>
                      <button
                        onClick={() => {
                          getInvoiceData(
                            progressData?.servicerequestid?.servicerequestid
                          );
                        }}
                      >
                        Invoice
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <br />
              <div
                className="panel"
                style={{ display: showInvoice ? "block" : "none" }}
              >
                <h3>Invoice Details</h3>
                <div>
                  <table className="table table-striped">
                    <tbody>
                      <tr>
                        <td>Invoice ID</td>
                        <td>{invoiceData?.invoiceid}</td>
                      </tr>
                      <tr>
                        <td>Transaction ID</td>
                        <td>{invoiceData?.transactionid?.transactionid}</td>
                      </tr>
                      <tr>
                        <td>Job Card ID</td>
                        <td>
                          {
                            invoiceData?.transactionid?.serviceprogres
                              ?.serviceprogressid
                          }
                        </td>
                      </tr>
                      <tr>
                        <td>Service Center Name</td>
                        <td>
                          {
                            invoiceData?.transactionid?.serviceprogres
                              ?.servicerequestid?.pkgid?.servicecenter?.scname
                          }
                        </td>
                      </tr>
                      <tr>
                        <td>Package Name</td>
                        <td>
                          {
                            invoiceData?.transactionid?.serviceprogres
                              ?.servicerequestid?.pkgid?.packagename
                          }
                        </td>
                      </tr>
                      <tr>
                        <td>Vehicle Number</td>
                        <td>
                          {
                            invoiceData?.transactionid?.serviceprogres
                              ?.servicerequestid?.vehid?.vehiclenumber
                          }
                        </td>
                      </tr>
                      <tr>
                        <td>Customer Name</td>
                        <td>
                          {
                            invoiceData?.transactionid?.serviceprogres
                              ?.servicerequestid?.vehid?.customerid?.firstname
                          }
                          &nbsp;
                          {
                            invoiceData?.transactionid?.serviceprogres
                              ?.servicerequestid?.vehid?.customerid?.lastname
                          }
                        </td>
                      </tr>
                      <tr>
                        <td>Amount</td>
                        <td>{invoiceData?.transactionid?.amount}</td>
                      </tr>
                      <tr>
                        <td>Payment Mode</td>
                        <td>{invoiceData?.transactionid?.paymentmode}</td>
                      </tr>
                      <tr>
                        <td>Payment Date</td>
                        <td>
                          {invoiceData?.transactionid?.date?.slice(0, 10)}
                        </td>
                      </tr>
                      <tr>
                        <td>Payment Time</td>
                        <td>
                          {invoiceData?.transactionid?.date?.slice(11, 19)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
