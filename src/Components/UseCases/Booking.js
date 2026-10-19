import { API } from "../../api";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Booking() {
  const [allarea, setAllarea] = useState([]);
  const [allbrands, setAllbrands] = useState([]);
  const [allcities, setAllcities] = useState([]);
  const [cityid, setCityid] = useState(0);
  const [areaid, setAreaid] = useState(0);
  const [scid, setScid] = useState(0);
  const [brandid, setBrandid] = useState(0);
  const [pkgs, setPkgs] = useState([]);
  const [pkgid, setPkgid] = useState("");
  const [data, setData] = useState([]);
  const [scmsg, setScmsg] = useState("");
  const [pkgmsg, setPkgmsg] = useState("");

  const [sc_res, setSc_res] = useState(false);
  const [pk_res, setPk_res] = useState(false);

  const [ratings, setRatings] = useState([]);
  const [serv, setServ] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const sids = Object.values(data).map((obj) => obj.servicecenterid);
    setServ(sids);
  }, [data]);

  useEffect(() => {
    const fetchData = async () => {
      const promises = serv.map((id) => {
        const url = `${API}/getRating?scid=` + id;
        return fetch(url).then((resp) => resp.json());
      });
      const data = await Promise.all(promises);
      setRatings(data);
    };
    fetchData();
  }, [serv]);

  const setValues = () => {
    localStorage.setItem("scid", JSON.stringify(scid));
    localStorage.setItem("pkgid", pkgid);
    localStorage.setItem("bid", brandid);
    navigate("/customerhome/bookAppointment");
  };

  const sendData = (e) => {
    e.preventDefault();
    var url =
      `${API}/getScByBrandArea?bid=` +
      brandid +
      "&aid=" +
      areaid;
    console.log(url);
    fetch(url)
      .then((resp) => resp.json())
      .then((jsonData) => {
        if (jsonData.length === 0) {
          setScmsg("No Service Centers Found");
          setSc_res(false);
          setPk_res(false);
        } else {
          setData(jsonData);
          setSc_res(true);
          setPk_res(false);
          setScmsg("");
        }
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getAreas = () => {
    fetch(`${API}/getAreaByCityId?id=` + cityid)
      .then((resp) => resp.json())
      .then((a) => setAllarea(a));
  };

  useEffect(() => {
    fetch(`${API}/getBrands`)
      .then((resp) => resp.json())
      .then((c) => setAllbrands(c));

    fetch(`${API}/getCities`)
      .then((resp) => resp.json())
      .then((c) => setAllcities(c));
  }, []);

  const getPackages = () => {
    fetch(`${API}/getPackageByScId?scid=` + scid)
      .then((resp) => resp.json())
      .then((jsonData) => {
        if (jsonData.length === 0) {
          setPkgmsg("No Packages Found");
          setSc_res(false);
          setPk_res(false);
        } else {
          setPkgs(jsonData);
          setSc_res(false);
          setPk_res(true);
          setPkgmsg("");
          console.log(jsonData);
        }
      })
      .catch((e) => console.log(e));
  };

  return (
    <div style={{ backgroundColor: "white" }}>
      <br />
      <h3>Search Service Centers</h3>
      <hr />
      <form>
        <div style={{ overflowX: "auto" }}>
          <table className="table table table-striped">
            <tbody>
              <tr>
                <td>Select City :</td>
                <td>
                  <select
                    onChange={(e) => {
                      setCityid(e.target.value);
                    }}
                    onClick={getAreas}
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
        </div>

        <br />
        <span style={{ color: "red" }}>
          <h3>{scmsg}</h3>
        </span>
        <div id="scres" style={{ display: sc_res ? "block" : "none" }}>
          <h3>Service Centers Information</h3>
          <hr />
          <div style={{ overflowX: "auto" }}>
            <table className="table table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Contact Number</th>
                  <th>Emailid</th>
                  <th>Address</th>
                  {/* <th>Ratings</th> */}
                  {/* <th>Service Packages</th> */}
                </tr>
              </thead>

              <tbody>
                {data.map((b, index) => {
                  return (
                    <tr key={index}>
                      <td value={b.servicecenterid}>{b.scname}</td>
                      <td value={b.servicecenterid}>{b.brand.bname}</td>
                      <td value={b.servicecenterid}>{b.contactno}</td>
                      <td value={b.servicecenterid}>{b.emailid}</td>
                      <td value={b.servicecenterid}>{b.lane}</td>

                      {/* <td value={b?.servicecenterid}>
                        {ratings?.map((element) => (
                          <div>{element}</div>
                        ))}
                      </td> */}
                      <td value={b.servicecenterid}>
                        <Link
                          to="#"
                          className="nav-link"
                          onClickCapture={(e) => {
                            setScid(b.servicecenterid);
                            console.log(b.servicecenterid);
                          }}
                          onClick={getPackages}
                        >
                          View Packages
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </form>
      <Outlet />
      <span style={{ color: "red" }}>
        <h3>{pkgmsg}</h3>
      </span>
      <div id="pkgres" style={{ display: pk_res ? "block" : "none" }}>
        <div>
          <h2>Packages Information</h2>
          <table className="table table table-striped" border={1}>
            <thead>
              <tr>
                <th>Package Name</th>
                <th>Package Cost</th>
                <th>Facilities</th>
              </tr>
            </thead>
            <tbody>
              {pkgs.map((p, index) => {
                return (
                  <tr key={index}>
                    <td value={p.servicecenterid}>{p.packagename}</td>
                    <td value={p.servicecenterid}>{p.cost}</td>
                    {/* <th>Facilities</th> */}
                    <td value={p.servicecenterid}>
                      <ul>
                        {p.facilities.map((f, index) => {
                          return (
                            <li style={{ textAlign: "left" }} key={index}>
                              {f.facilityname}
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <hr />
          <form>
            <table className="table table-stripped">
              <tbody>
                <tr>
                  <td>Select Package :</td>
                  <td>
                    <select
                      onChange={(e) => {
                        setPkgid(e.target.value);
                      }}
                    >
                      <option>Select One</option>
                      {pkgs.map((p, index) => {
                        return (
                          <option key={index} value={p.packagedetailsid}>
                            {p.packagename}
                          </option>
                        );
                      })}
                    </select>
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <button className="btn btn-primary" onClick={setValues}>
                      Proceed to Booking
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </div>
    </div>
  );
}
