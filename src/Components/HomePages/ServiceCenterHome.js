import { API } from "../../api";
import { useEffect, useState } from "react";
import { Link, useNavigate, useOutlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FiArrowLeft,
  FiExternalLink,
  FiKey,
  FiPackage,
  FiSettings,
} from "react-icons/fi";
import Navbar from "../Navbar";

const GROUPS = [
  {
    title: "Workshop",
    desc: "Day-to-day running of your service centre.",
    items: [
      {
        to: "updateProgress",
        title: "Update service progress",
        body: "Move each job through check-in, repair, QC and delivery.",
        icon: <FiSettings />,
      },
      {
        to: "packages",
        title: "Service packages",
        body: "Create and manage the fixed-price packages you offer.",
        icon: <FiPackage />,
      },
    ],
  },
  {
    title: "Account",
    desc: "Your centre profile and security.",
    items: [
      {
        to: "changePwd",
        title: "Change password",
        body: "Update the credentials for this centre account.",
        icon: <FiKey />,
      },
      {
        to: "/",
        title: "View public listing",
        body: "See how drivers find and compare your centre.",
        icon: <FiExternalLink />,
      },
    ],
  },
];

export default function ServiceCenterHome() {
  const [data, setData] = useState({});
  const mystate = useSelector((state) => state.logged);
  const navigate = useNavigate();
  const outlet = useOutlet();

  useEffect(() => {
    if (mystate.loggedIn === false) {
      navigate("/userlogin");
      return;
    }
    const loginid = localStorage.getItem("loginid") || localStorage.getItem("userid");
    if (loginid) {
      fetch(`${API}/getScDetailsByLoginid?loginid=` + loginid)
        .then((resp) => resp.json())
        .then((jsonData) => {
          setData(jsonData || {});
          if (jsonData && jsonData.servicecenterid != null) {
            localStorage.setItem("scid", jsonData.servicecenterid);
          }
        })
        .catch((e) => console.log(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name = data?.scname || "Service centre";
  const initials =
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0] || "")
      .join("")
      .toUpperCase() || "SC";

  const user = {
    name,
    initials,
    role: "Service centre",
    profileTo: "/serviceHome/changePwd",
  };

  return (
    <>
      <Navbar homeTo="/serviceHome" user={user} />

      <div className="app-main">
        {outlet ? (
          <div className="work-area">
            <Link to="/serviceHome" className="back-link">
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
                    <p className="dash-hero__greet">Service centre dashboard</p>
                    <h1 className="dash-hero__name">{name}</h1>
                    <p className="dash-hero__sub">
                      {data?.brand?.bname
                        ? `Authorised for ${data.brand.bname}`
                        : "Manage packages and workshop progress."}
                    </p>
                  </div>
                </div>
                <span className="dash-hero__chip">
                  <span className="dot-live" /> Centre online
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
                      <Link to={a.to} className="action-tile" key={a.title}>
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
