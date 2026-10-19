import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash2 } from "react-icons/fi";

import { API } from "../../api";

/** The vehicles this customer has registered. */
export default function VehDetails() {
  const [vehicles, setVehicles] = useState([]);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(0);

  const custid = JSON.parse(localStorage.getItem("custid"));

  const load = useCallback(() => {
    fetch(API + "/getVehiclesByCid?cid=" + custid)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((list) => setVehicles(Array.isArray(list) ? list : []))
      .catch(() =>
        setBanner({ kind: "danger", text: "Could not load your vehicles." })
      )
      .finally(() => setLoading(false));
  }, [custid]);

  useEffect(() => {
    load();
  }, [load]);

  const deleteVeh = async (v) => {
    if (busy) return;
    const ok = window.confirm(
      `Remove ${v.vehiclenumber}? Bookings already made for it will keep their history.`
    );
    if (!ok) return;

    setBusy(v.vehicleid);
    setBanner(null);
    try {
      const resp = await fetch(
        `${API}/deleteVehById?vid=${v.vehicleid}&cid=${custid}`,
        { method: "DELETE" }
      );
      const text = await resp.text();
      let body = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch (err) {
        body = null;
      }

      if (!resp.ok) {
        setBanner({
          kind: "danger",
          text: (body && body.message) || "Could not remove that vehicle.",
        });
        return;
      }

      setBanner({ kind: "success", text: `${v.vehiclenumber} was removed.` });
      load();
    } catch (err) {
      setBanner({ kind: "danger", text: "Could not reach the server. Please try again." });
    } finally {
      setBusy(0);
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow--accent">My garage</span>
          <h1 className="page-header__title">Vehicles</h1>
          <p className="page-header__sub">
            Every vehicle you can book a service for. Add another one whenever
            you buy a car.
          </p>
        </div>
        <div className="page-header__actions">
          <Link to="/customerhome/registervehicle" className="btn btn-primary">
            Add a vehicle
          </Link>
        </div>
      </div>

      {banner && (
        <div
          className={`alert alert-${banner.kind === "danger" ? "danger" : "success"}`}
          role="alert"
        >
          {banner.text}
        </div>
      )}

      <div className="panel">
        <div className="card-body">
          {loading ? (
            <div className="skeleton" style={{ height: 100, width: "100%" }} />
          ) : vehicles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🚗</div>
              <p>No vehicles registered yet.</p>
              <p className="text-muted">
                Add your first vehicle to start booking services.
              </p>
              <Link to="/customerhome/registervehicle" className="btn btn-primary">
                Add a vehicle
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Vehicle number</th>
                    <th>Model</th>
                    <th>Registration year</th>
                    <th>Brand</th>
                    <th>Fuel type</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.vehicleid}>
                      <td>
                        <strong>{v.vehiclenumber}</strong>
                      </td>
                      <td>{v.model || "—"}</td>
                      <td>{v.registrationyear}</td>
                      <td>{v.brandid ? v.brandid.bname : "—"}</td>
                      <td>{v.fueltype}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => deleteVeh(v)}
                          disabled={busy === v.vehicleid}
                          aria-label={`Remove ${v.vehiclenumber}`}
                        >
                          <FiTrash2 />
                          {busy === v.vehicleid ? "Removing…" : "Remove"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
