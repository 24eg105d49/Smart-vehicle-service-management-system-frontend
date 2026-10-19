import { useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiX } from "react-icons/fi";

import { API } from "../../api";

const EMPTY = { packagedetailsid: 0, packagename: "", cost: "" };

/**
 * Service packages — create, edit and delete the fixed-price packages this
 * centre offers. Replaces the old stub, which rendered unbound inputs and a
 * form button that did nothing.
 */
export default function CreatePackages() {
  const [packages, setPackages] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [selected, setSelected] = useState([]); // facilityids
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(null); // {kind, text}
  const [saving, setSaving] = useState(false);

  const scid = Number(localStorage.getItem("scid"));

  const load = useCallback(async () => {
    if (!scid) {
      setBanner({ kind: "danger", text: "Could not identify your service centre." });
      setLoading(false);
      return;
    }
    try {
      const [pk, fs] = await Promise.all([
        fetch(`${API}/getPackageByScId?scid=${scid}`).then((r) => r.json()),
        fetch(`${API}/getfacilities`).then((r) => r.json()),
      ]);
      setPackages(Array.isArray(pk) ? pk : []);
      setFacilities(Array.isArray(fs) ? fs : []);
    } catch (e) {
      setBanner({ kind: "danger", text: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  }, [scid]);

  useEffect(() => {
    load();
  }, [load]);

  const editing = form.packagedetailsid !== 0;

  const reset = () => {
    setForm(EMPTY);
    setSelected([]);
    setBanner(null);
  };

  const startEdit = (pkg) => {
    setForm({
      packagedetailsid: pkg.packagedetailsid,
      packagename: pkg.packagename || "",
      cost: pkg.cost == null ? "" : String(pkg.cost),
    });
    setSelected(
      Array.isArray(pkg.facilities)
        ? pkg.facilities.map((f) => Number(f.facilityid))
        : []
    );
    setBanner(null);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleFacility = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving || busy) return;

    const name = form.packagename.trim();
    const cost = Number(form.cost);

    if (!name) {
      setBanner({ kind: "danger", text: "Enter a package name." });
      return;
    }
    if (!form.cost || Number.isNaN(cost) || cost <= 0) {
      setBanner({ kind: "danger", text: "Enter a package cost greater than zero." });
      return;
    }

    const payload = {
      packagedetailsid: Number(form.packagedetailsid) || 0,
      packagename: name,
      cost,
      servicecenterid: scid,
      facilityids: selected,
    };

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `${API}/updatePackageDetails` : `${API}/addPackageDetails`,
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const body = await res.text();
      let data = null;
      try {
        data = body ? JSON.parse(body) : null;
      } catch (err) {
        data = null;
      }

      if (!res.ok) {
        setBanner({
          kind: "danger",
          text: (data && data.message) || "Could not save the package.",
        });
        return;
      }

      setBanner({
        kind: "success",
        text: editing
          ? "Package updated."
          : "Package created and added to your service list.",
      });
      reset();
      await load();
    } catch (err) {
      setBanner({ kind: "danger", text: "Could not reach the server. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (pkg) => {
    if (busy) return;
    const ok = window.confirm(
      `Delete "${pkg.packagename}"? This cannot be undone.`
    );
    if (!ok) return;

    setBusy(true);
    setBanner(null);
    try {
      const res = await fetch(
        `${API}/deletePackageDetails?id=${pkg.packagedetailsid}`,
        { method: "DELETE" }
      );
      const body = await res.text();
      let data = null;
      try {
        data = body ? JSON.parse(body) : null;
      } catch (err) {
        data = null;
      }

      if (!res.ok) {
        setBanner({
          kind: "danger",
          text: (data && data.message) || "Could not delete the package.",
        });
        return;
      }

      setBanner({ kind: "success", text: "Package deleted." });
      if (form.packagedetailsid === pkg.packagedetailsid) reset();
      await load();
    } catch (err) {
      setBanner({ kind: "danger", text: "Could not reach the server. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  const money = (v) =>
    Number(v || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow--accent">Workshop</span>
          <h1 className="page-header__title">Service packages</h1>
          <p className="page-header__sub">
            Create the fixed-price packages drivers can pick when they book, and
            keep costs and inclusions up to date.
          </p>
        </div>
        <div className="page-header__actions">
          <span className="badge">
            {packages.length} package{packages.length === 1 ? "" : "s"}
          </span>
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

      <div className="grid grid--2">
        <div className="panel">
          <div className="card-header">
            <h3 className="card-title">
              {editing ? "Edit package" : "New package"}
            </h3>
            {editing && (
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={reset}
              >
                <FiX /> Cancel
              </button>
            )}
          </div>
          <div className="card-body">
            <form onSubmit={submit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="pkg-name">
                  Package name
                </label>
                <input
                  id="pkg-name"
                  className="form-control"
                  type="text"
                  maxLength={45}
                  placeholder="e.g. Basic Service"
                  value={form.packagename}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, packagename: e.target.value }))
                  }
                />
                <div className="form-text">
                  Up to 45 characters. Shown to drivers when they book.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="pkg-cost">
                  Cost (₹)
                </label>
                <input
                  id="pkg-cost"
                  className="form-control"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 1890"
                  value={form.cost}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, cost: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <span className="form-label">Included services</span>
                {facilities.length === 0 ? (
                  <div className="form-text">No services are available yet.</div>
                ) : (
                  <div className="tile-groups">
                    {facilities.map((f) => {
                      const on = selected.includes(Number(f.facilityid));
                      return (
                        <label
                          key={f.facilityid}
                          className={`action-tile${on ? " action-tile--on" : ""}`}
                          style={{ cursor: "pointer" }}
                        >
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggleFacility(Number(f.facilityid))}
                            style={{ marginRight: 8 }}
                          />
                          <span>{f.facilityname}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <div className="form-text">
                  Tick everything this package covers. You can leave this empty.
                </div>
              </div>

              <button
                className="btn btn-primary"
                type="submit"
                disabled={saving}
              >
                <FiPlus />
                {saving
                  ? "Saving…"
                  : editing
                  ? "Save changes"
                  : "Create package"}
              </button>
            </form>
          </div>
        </div>

        <div className="panel">
          <div className="card-header">
            <h3 className="card-title">Your packages</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="empty-state">
                <div className="skeleton" style={{ height: 80, width: "100%" }} />
              </div>
            ) : packages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <FiPlus />
                </div>
                <p>No packages yet.</p>
                <p className="text-muted">
                  Create your first package on the left so drivers can book it.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Package</th>
                      <th>Cost</th>
                      <th>Services</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((p) => (
                      <tr key={p.packagedetailsid}>
                        <td>
                          <strong>{p.packagename}</strong>
                          {form.packagedetailsid === p.packagedetailsid && (
                            <span className="badge" style={{ marginLeft: 8 }}>
                              editing
                            </span>
                          )}
                        </td>
                        <td>{money(p.cost)}</td>
                        <td>
                          {Array.isArray(p.facilities) && p.facilities.length ? (
                            <span className="text-muted">
                              {p.facilities.length} included
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => startEdit(p)}
                            aria-label={`Edit ${p.packagename}`}
                          >
                            <FiEdit2 /> Edit
                          </button>{" "}
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => remove(p)}
                            disabled={busy}
                            aria-label={`Delete ${p.packagename}`}
                          >
                            <FiTrash2 /> Delete
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
    </div>
  );
}
