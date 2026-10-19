import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { useSelector } from "react-redux";

import ServRegistration from "./Components/Registration/ServRegistration";
import CustRegistration from "./Components/Registration/CustRegistration";
import VehRegistration from "./Components/Registration/VehRegistration";
import CustomerHomePage from "./Components/HomePages/CustomerHomePage";
import LoginPage from "./Components/LoginPage/LoginPage";
import ViewServiceCenters from "./Components/UseCases/ViewServiceCenters";
import VehDetails from "./Components/UseCases/VehDetails";
import BookAppointment from "./Components/UseCases/BookAppointment";
import Booking from "./Components/UseCases/Booking";
import ServiceProgress from "./Components/UseCases/ServiceProgress";
import ServiceCenterHome from "./Components/HomePages/ServiceCenterHome";
import UpdateServiceProgress from "./Components/UseCases/UpdateServiceProgress";
import CreatePackages from "./Components/UseCases/CreatePackages";

import ViewServiceRequests from "./Components/UseCases/ViewServiceRequests";

import Home from "./Components/HomePages/Home";
import ForgotPassword from "./Components/UseCases/ForgotPassword";
import Logout from "./Components/Logout";
import ChangePassword from "./Components/UseCases/ChangePassword";
import AdminHome from "./Components/UseCases/AdminHome";
import Rating from "./Components/UseCases/Rating";

import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import {
  FiHome,
  FiMapPin,
  FiLogIn,
  FiUserPlus,
  FiGrid,
  FiLogOut,
} from "react-icons/fi";

// Jump to the top whenever the route changes, so a feature the user just
// opened is visible instead of sitting below the fold.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Keeps a rendering error inside one section instead of blanking the whole
// app (e.g. when an endpoint returns an unexpected shape).
class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Route render failed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="empty-state" role="alert">
          <div className="empty-state__icon">!</div>
          <h4>This section ran into a problem</h4>
          <p>
            {String(
              (this.state.error && this.state.error.message) ||
                this.state.error
            )}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const publicNav = [
  { label: "Home", to: "/", icon: <FiHome size={15} /> },
  { label: "Service Centres", to: "/viewservicecenters", icon: <FiMapPin size={15} /> },
  { label: "Login", to: "/userlogin", icon: <FiLogIn size={15} /> },
  {
    label: "Sign Up",
    to: "/customerregistration",
    icon: <FiUserPlus size={15} />,
    accent: true,
  },
];

// Signed-in users get a shorter header: no "Login / Sign Up" once they are
// already inside the app.
const memberNav = [
  { label: "Home", to: "/", icon: <FiHome size={15} /> },
  {
    label: "Service Centres",
    to: "/viewservicecenters",
    icon: <FiMapPin size={15} />,
  },
  { label: "My dashboard", to: null, icon: <FiGrid size={15} /> },
  { label: "Sign out", to: "/logout", icon: <FiLogOut size={15} /> },
];

// Routes that render their own application header (so App must not add one).
const isAppRoute = (p) =>
  p.startsWith("/customerhome") ||
  p.startsWith("/serviceHome") ||
  p.startsWith("/adminHome");

function dashboardHome() {
  const rid = localStorage.getItem("roleid");
  if (rid === "2") return "/serviceHome";
  if (rid === "3") return "/adminHome";
  return "/customerhome";
}

// Resolves "My dashboard" for whichever role signed in.
function resolveNav(items) {
  return items.map((i) => (i.to === null ? { ...i, to: dashboardHome() } : i));
}

function App() {
  const mystate = useSelector((state) => state.logged);
  const { pathname } = useLocation();

  // These routes render their own full-width layout (hero / split-screen auth).
  const isFlush = pathname === "/" || pathname === "/userlogin";
  // App routes render their own header and user menu instead of the site header.
  const appRoute = isAppRoute(pathname);
  const navItems = resolveNav(mystate.loggedIn ? memberNav : publicNav);

  return (
    <div className="app-shell">
      <ScrollToTop />
      {appRoute ? null : <Navbar items={navItems} />}

      <main className="app-shell__main">
        <div className={`app-main ${isFlush ? "app-main--flush" : ""}`}>
          <RouteErrorBoundary key={pathname}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="userlogin" element={<LoginPage />} />
            <Route path="forgotpwd" element={<ForgotPassword />} />
            <Route
              path="customerregistration"
              element={<CustRegistration />}
            />
            <Route
              path="servicecenterregistration"
              element={<ServRegistration />}
            />
            <Route
              path="viewservicecenters"
              element={<ViewServiceCenters />}
            />
            {/* ---------------------------------- Customer ----------------------------------*/}
            <Route path="customerhome" element={<CustomerHomePage />}>
              <Route path="changePwd" element={<ChangePassword />} />
              <Route path="registervehicle" element={<VehRegistration />} />
              <Route path="vehdetails" element={<VehDetails />} />
              <Route path="bookAppointment" element={<BookAppointment />} />
              <Route path="serviceprogress" element={<ServiceProgress />} />
              <Route path="rate" element={<Rating />} />
              <Route path="viewScLogin" element={<Booking />} />
            </Route>
            {/* ---------------------------------- Customer ----------------------------------*/}

            {/* ---------------------------------- Service Center ----------------------------------*/}
            <Route path="serviceHome" element={<ServiceCenterHome />}>
              <Route path="updateProgress" element={<UpdateServiceProgress />} />
              <Route path="changePwd" element={<ChangePassword />} />
              {/* The "Service packages" tile used to point at viewScLogin,
                  i.e. the public centre search — a customer screen, not a
                  workshop one. Packages have their own route now. */}
              <Route path="packages" element={<CreatePackages />} />
            </Route>
            {/* ---------------------------------- Service Center ----------------------------------*/}
            {/*----------- Admin Home ----------*/}
            <Route path="adminHome" element={<AdminHome />}>
              <Route path="view" element={<ViewServiceRequests />} />
              <Route path="changePwd" element={<ChangePassword />} />
            </Route>
          </Routes>
          </RouteErrorBoundary>
        </div>
      </main>

      {appRoute ? null : <Footer />}
    </div>
  );
}

export default App;
