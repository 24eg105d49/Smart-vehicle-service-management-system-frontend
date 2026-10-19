import { API } from "../../api";
import { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
// export default function Requests() {
//   const [serviceCenters, setServiceCenters] = useState([
//     { id: 1, name: 'Hundai Service Center' , location: 'Kothrud', status: 'Pending' },
//     { id: 2, name: 'Tata Service Center', location: 'Karve nagar', status: 'Approved' },
//     { id: 3, name: 'Honda Service Center', location: 'Shivaji Nagar', status: 'Rejected' },
//   ]);

//   const approveServiceCenter = (id) => {
//     const updatedServiceCenters = serviceCenters.map((center) =>
//       center.id === id ? { ...center, status: 'Approved' } : center
//     );
//     setServiceCenters(updatedServiceCenters);
//   };

//   const rejectServiceCenter = (id) => {
//     const updatedServiceCenters = serviceCenters.map((center) =>
//       center.id === id ? { ...center, status: 'Rejected' } : center
//     );
//     setServiceCenters(updatedServiceCenters);
//   };

//   return (
//     <>
//     <h1 className="text-center">All Centers :</h1>
//     <Table striped bordered hover>
//       <thead>
//         <tr>
//           <th>ID</th>
//           <th>Name</th>
//           <th>Location</th>
//           <th>Status</th>
//           <th>Actions</th>
//         </tr>
//       </thead>
//       <tbody>
//         {serviceCenters.map((center) => (
//           <tr key={center.id}>
//             <td>{center.id}</td>
//             <td>{center.name}</td>
//             <td>{center.location}</td>
//             <td>{center.status}</td>
//             <td>
//               {center.status === 'Pending' && (
//                 <>
//                   <Button variant="success" onClick={() => approveServiceCenter(center.id)}>
//                     Approve
//                   </Button>{' '}
//                   <Button variant="danger" onClick={() => rejectServiceCenter(center.id)}>
//                     Reject
//                   </Button>
//                 </>
//               )}
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </Table></>

//   );
// };
export default function ViewServiceRequests() {
  const [centers, setCenters] = useState([]);

  function loadRequests() {
    fetch(`${API}/all`)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((jsonData) => setCenters(Array.isArray(jsonData) ? jsonData : []))
      .catch(() => setCenters([]));
  }

  // Load once on mount. Previously this effect also fired the approval PATCH,
  // which opened an alert as soon as the page was shown.
  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Runs only when the admin clicks "Approve".
  const approve = async (loginid) => {
    if (loginid === null || loginid === undefined || loginid === "") return;
    try {
      const resp = await fetch(`${API}/updateReq/` + loginid, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: true }),
      });
      if (resp.status === 200) {
        alert("Request approved.");
        loadRequests(); // refresh in place, so the admin stays on this page
      } else {
        alert("Could not approve the request. Please try again.");
      }
    } catch (e) {
      alert("Could not reach the server. Please try again.");
    }
  };

  return (
    <>
      <h1 className="text-center mt-5">All Requests :</h1>
      <div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {centers.map((center, index) => (
              <tr key={index}>
                <td>{center.loginid}</td>
                <td>{center.userid}</td>

                <td>
                  <span
                    className={`badge ${
                      center.status ? "bg-success" : "bg-warning"
                    }`}
                  >
                    {center.status ? "Approved" : "Needs action"}
                  </span>
                </td>
                <td>
                  {center.status === false && (
                    <>
                      <Button
                        variant="success"
                        onClick={() => approve(center.loginid)}
                      >
                        Approve
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}
