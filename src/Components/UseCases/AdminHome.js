import { useEffect } from "react";
import { Link, useNavigate, useOutlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiArrowLeft, FiExternalLink, FiKey, FiList } from "react-icons/fi";
import Navbar from "../Navbar";

const GROUPS = [
  {
    title: "Platform oversight",
    desc: "Review and action requests across VSMS.",
    items: [
      {
        to: "view",
        title: "Service requests",
        body: "Approve pending requests and monitor account status.",
        icon: <FiList />,
      },
      {
        to: "/",
        title: "Public site",
        body: "Preview the application as a customer sees it.",
        icon: <FiExternalLink />,
      },
    ],
  },
  {
    title: "Account",
    desc: "Keep your administrator credentials current.",
    items: [
      {
        to: "changePwd",
        title: "Change password",
        body: "Update your administrator password.",
        icon: <FiKey />,
      },
    ],
  },
];

export default function AdminHome() {
  const mystate = useSelector((state) => state.logged);
  const navigate = useNavigate();
  const outlet = useOutlet();

  useEffect(() => {
    if (mystate.loggedIn === false) {
      navigate("/userlogin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = {
    name: "Administrator",
    initials: "AD",
    role: "Admin",
    profileTo: "/adminHome/changePwd",
  };

  return (
    <>
      <Navbar homeTo="/adminHome" user={user} />

      <div className="app-main">
        {outlet ? (
          <div className="work-area">
            <Link to="/adminHome" className="back-link">
              <FiArrowLeft size={16} /> Back to dashboard
            </Link>
            <div className="work-area__body">{outlet}</div>
          </div>
        ) : (
          <>
            <section className="dash-hero">
              <div className="dash-hero__inner">
                <div className="dash-hero__who">
                  <span className="avatar">AD</span>
                  <div style={{ minWidth: 0 }}>
                    <p className="dash-hero__greet">Administration</p>
                    <h1 className="dash-hero__name">Control centre</h1>
                    <p className="dash-hero__sub">
                      Oversee service requests, centres and platform activity.
                    </p>
                  </div>
                </div>
                <span className="dash-hero__chip">
                  <span className="dot-live" /> System healthy
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
