import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import { API } from "../../api";

const money = (v) =>
  Number(v || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

export default function ViewServiceCenters() {
  const [allarea, setAllarea] = useState([]);
  const [allbrands, setAllbrands] = useState([]);
  const [allcities, setAllcities] = useState([]);
  const [cityid, setCityid] = useState(0);
  const [areaid, setAreaid] = useState(0);
  const [brandid, setBrandid] = useState(0);
  const [data, setData] = useState([]);
  const [msg, setMsg] = useState("");

  // Public listing extras: each result row shows the centre's average rating
  // and its packages. Both are per-centre calls, so they are loaded for
  // whatever the search returned.
  const [ratings, setRatings] = useState({});
  const [packages, setPackages] = useState({});

  const loadDetails = (centers) => {
    centers.forEach((c) => {
      const id = c.servicecenterid;
      fetch(API + "/getRating?scid=" + id)
        .then((r) => (r.ok ? r.json() : null))
        .then((v) => setRatings((prev) => ({ ...prev, [id]: v })))
        .catch(() => setRatings((prev) => ({ ...prev, [id]: null })));

      fetch(API + "/getPackageByScId?scid=" + id)
        .then((r) => (r.ok ? r.json() : []))
        .then((v) => setPackages((prev) => ({ ...prev, [id]: Array.isArray(v) ? v : [] })))
        .catch(() => setPackages((prev) => ({ ...prev, [id]: [] })));
    });
  };
  const sendData = (e) => {
    e.preventDefault();

    // "Select One" is the untouched placeholder; sending it produced a
    // malformed query and an empty table with no explanation.
    if (!brandid || brandid === "Select One" || !areaid || areaid === "Select One") {
      setMsg("Choose an area and a brand, then press Search.");
      setData([]);
      return;
    }

    const url = API + "/getScByBrandArea?bid=" + brandid + "&aid=" + areaid;
    fetch(url)
      .then((resp) => resp.json())
      .then((jsonData) => {
        const list = Array.isArray(jsonData) ? jsonData : [];
        setData(list);
        setRatings({});
        setPackages({});
        if (list.length === 0) {
          setMsg("No service centres found for that area and brand.");
        } else {
          setMsg("");
          loadDetails(list);
        }
      })
      .catch(() => {
        setData([]);
        setMsg("Could not reach the server. Please try again.");
      });
  };

  // Areas were fetched from the city <select>'s onClick, so the list still
  // showed the previous city's areas right after switching. Drive it off the
  // chosen city instead.
  useEffect(() => {
    if (!cityid || cityid === "Select One") {
      setAllarea([]);
      setAreaid("");
      return;
    }
    fetch(API + "/getAreaByCityId?id=" + cityid)
      .then((resp) => (resp.ok ? resp.json() : []))
      .then((a) => setAllarea(Array.isArray(a) ? a : []))
      .catch(() => setAllarea([]));
    setAreaid("");
  }, [cityid]);

  useEffect(() => {
    fetch(`${API}/getBrands`)
      .then((resp) => resp.json())
      .then((c) => setAllbrands(c));

    fetch(`${API}/getCities`)
      .then((resp) => resp.json())
      .then((c) => setAllcities(c));
  }, []);

  return (
    <div
      className="container-fluid p-3 mb-5 text-black shadow rounded-2"
      style={{ minHeight: "80vh" }}
    >
      <div style={{ backgroundColor: "white" }}>
        <h3 style={{ color: "black" }}>Search Service Centers</h3>
        <hr />
        <form>
          <table className="table table table-striped">
            <tbody>
              <tr>
                <td>Select City :</td>
                <td>
                  <select
                    onChange={(e) => {
                      setCityid(e.target.value);
                    }}
                  >
                    <option>Select One</option>
                    {allcities.map((city) => {
                      return (
                        <option value={city.cityid} key={city.cityid}>
                          {city.cityname}
                        </option>
                      );
                    })}
                  </select>
                </td>
              </tr>
              <tr>
                <td>Select Area :</td>
                <td>
                  <select
                    className="form-group"
                    id="areaid"
                    name="areaid"
                    onChange={(e) => {
                      setAreaid(e.target.value);
                    }}
                  >
                    <option>Select One</option>
                    {allarea.map((area) => {
                      return (
                        <option value={area.areaid} key={area.areaid}>
                          {area.areaname}
                        </option>
                      );
                    })}
                  </select>
                </td>
              </tr>
              <tr>
                <td>Select Brand :</td>
                <td>
                  <select
                    className="form-group"
                    id="brandid"
                    name="brandid"
                    onChange={(e) => {
                      setBrandid(e.target.value);
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
                </td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <button
                    type="submit"
                    className="btn btn-primary mb-3"
                    onClick={sendData}
                  >
                    Search
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <br />
          {msg && (
            <div className="alert alert-info" role="alert">
              {msg}
            </div>
          )}

          {data.length > 0 && (
          <div>
            <h3 style={{ backgroundColor: "skyblue" }}>
              Service Centers Information
            </h3>
            <hr />
            <table className="table table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Contact Number</th>
                  <th>Emailid</th>
                  <th>Address</th>
                  <th>Rating</th>
                  <th>Service Packages</th>
                </tr>
              </thead>

              <tbody>
                {data.map((b) => {
                  const id = b.servicecenterid;
                  const avg = ratings[id];
                  const pkgs = packages[id] || [];
                  const cheapest = pkgs.length
                    ? Math.min(...pkgs.map((p) => Number(p.cost)))
                    : null;

                  return (
                    <tr key={id}>
                      <td>{b.scname}</td>
                      <td>{b.brand ? b.brand.bname : "—"}</td>
                      <td>{b.contactno}</td>
                      <td>{b.emailid}</td>
                      <td>{b.lane}</td>
                      <td>
                        {avg > 0 ? (
                          <strong aria-label={`${avg} out of 5`}>
                            {avg} / 5
                          </strong>
                        ) : (
                          <span className="text-muted">No ratings yet</span>
                        )}
                      </td>
                      <td>
                        {pkgs.length === 0 ? (
                          <span className="text-muted">—</span>
                        ) : (
                          <span>
                            {pkgs.length} available
                            {cheapest != null && (
                              <span className="text-muted">
                                {" "}
                                · from {money(cheapest)}
                              </span>
                            )}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <br />
            <table className="table table table-striped">
              <tbody>
                <tr>
                  <td>To View More Details Please Login.</td>
                  <td>Not a Customer? Please Register.</td>
                </tr>
                <tr>
                  <td>
                    <button className="btn btn-primary">
                      <a className="nav-link" href="/userlogin">
                        Login
                      </a>
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-primary">
                      <a className="nav-link" href="/customerregistration">
                        Register
                      </a>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          )}
        </form>
        <Outlet />
      </div>
    </div>
  );
}
