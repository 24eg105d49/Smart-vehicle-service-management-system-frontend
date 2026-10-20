import { API } from "../../api";
import { useEffect, useState } from "react";
import { Link, useNavigate, useOutlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiGrid,
  FiMapPin,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import Navbar from "../Navbar";

const GROUPS = [
  {
    title: "Book a service",
    desc: "Find an authorised centre and reserve a slot.",
    items: [
      {
        to: "bookAppointment",
        title: "Book appointment",
        body: "Choose a package and confirm a date for your vehicle.",
        icon: <FiCalendar />,
      },
      {
        to: "viewScLogin",
        title: "Browse service centres",
        body: "Compare centres by city, brand, facilities and ratings.",
        icon: <FiMapPin />,
      },
    ],
  },
  {
    title: "My garage",
    desc: "Everything you have registered with VSMS.",
    items: [
      {
        to: "vehdetails",
        title: "My vehicles",
        body: "View the cars on your account and their details.",
        icon: <FiTruck />,
      },
      {
        to: "registervehicle",
        title: "Register a vehicle",
        body: "Add a new car so you can book servicing for it.",
        icon: <FiGrid />,
      },
    ],
  },
  {
    title: "Track & review",
    desc: "Follow live jobs and share feedback.",
    items: [
      {
        to: "serviceprogress",
        title: "Service progress",
        body: "Follow every job from check-in through to delivery.",
        icon: <FiClock />,
      },
      {
        to: "rate",
        title: "Rate a service",
        body: "Score the work you received and help other drivers.",
        icon: <FiStar />,
      },
    ],
  },
];

export default function CustomerHomePage() {
  const [data, setData] = useState({});
  const mystate = useSelector((state) => state.logged);
  const navigate = useNavigate();
  const outlet = useOutlet();

  useEffect(() => {
    if (mystate.loggedIn === false) {
      navigate("/userlogin");
      return;
    }
    const storedLoginId = localStorage.getItem("loginid");
    const storedUserId = localStorage.getItem("userid") || "";
    let loginid = null;
    try {
      loginid = storedLoginId ? JSON.parse(storedLoginId) : null;
    } catch (e) {
      loginid = storedLoginId;
    }
    const queryParam = loginid != null ? loginid : storedUserId;
    if (queryParam) {
      fetch(`${API}/getCustomerdetails?loginid=` + queryParam)
        .then((resp) => (resp.ok ? resp.json() : null))
        .then((jsonData) => {
          if (jsonData && typeof jsonData === "object") {
            setData(jsonData);
            if (jsonData.customerid != null) {
              localStorage.setItem("custid", JSON.stringify(jsonData.customerid));
            }
          }
        })
        .catch((e) => console.log(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const storedUser = localStorage.getItem("userid") || "";
  const fullName = [data.firstname, data.lastname].filter(Boolean).join(" ");
  const name = fullName || storedUser || "Customer";
  const initials = (
    fullName
      ? `${(data.firstname || "C")[0]}${(data.lastname || "")[0] || ""}`
      : (storedUser ? storedUser.slice(0, 2) : "CU")
  ).toUpperCase();

  const user = {
    name,
    initials,
    role: "Customer",
    profileTo: "/customerhome/changePwd",
  };


  return (
    <>
      <Navbar homeTo="/customerhome" user={user} />

      <div className="app-main">
        {outlet ? (
          /* ---- A feature is open: give it the full work area ---- */
          <div className="work-area">
            <Link to="/customerhome" className="back-link">
              <FiArrowLeft size={16} /> Back to dashboard
            </Link>
            <div className="work-area__body">{outlet}</div>
          </div>
        ) : (
          <>
            <section className="dash-hero">
              <div className="dash-hero__inner">
                <div className="dash-hero__who">
                  <span className="avatar">{initials}</span>
                  <div style={{ minWidth: 0 }}>
                    <p className="dash-hero__greet">Customer dashboard</p>
                    <h1 className="dash-hero__name">Welcome back, {name}</h1>
                    <p className="dash-hero__sub">
                      Manage your vehicles, bookings and service history in one
                      place.
                    </p>
                  </div>
                </div>
                <span className="dash-hero__chip">
                  <span className="dot-live" /> Account active
                </span>
              </div>
            </section>

            <div className="tile-groups">
              {GROUPS.map((group) => (
                <section className="tile-group" key={group.title}>
                  <div className="tile-group__head">
                    <h2 className="tile-group__title">{group.title}</h2>
                    <p className="tile-group__desc">{group.desc}</p>
                  </div>
                  <div className="grid grid--2">
                    {group.items.map((a) => (
                      <Link to={a.to} className="action-tile" key={a.to}>
                        <span className="action-tile__icon">{a.icon}</span>
                        <b>{a.title}</b>
                        <span>{a.body}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
