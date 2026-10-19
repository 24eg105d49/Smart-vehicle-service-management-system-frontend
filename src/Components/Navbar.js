import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Dropdown } from "react-bootstrap";
import { BsGearFill } from "react-icons/bs";
import { FiChevronRight, FiLogOut, FiUser } from "react-icons/fi";

/**
 * Application shell header.
 *
 * Deliberately minimal: brand on the left, optional primary links, and a
 * single user menu on the right. Feature entry points live on the dashboard
 * itself, so they are NOT repeated here.
 *
 * props:
 *   items  : [{ label, to, icon?, end? }]   primary links (public site only)
 *   user   : { name, role, initials?, profileTo? }
 *   homeTo : where the brand logo points
 */
export default function Navbar({ items = [], user = null, homeTo = "/" }) {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (to) =>
    Boolean(to) &&
    (location.pathname === to ||
      (to !== "/" && location.pathname.startsWith(to + "/")));

  const renderItem = (item) => {
    const cls = `nav-link-vsms${isActive(item.to) ? " is-active" : ""}${
      item.accent ? " nav-link-vsms--accent" : ""
    }`;
    const content = (
      <>
        {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
        {item.label}
      </>
    );
    return item.to ? (
      <Link key={item.to} to={item.to} className={cls} onClick={() => setOpen(false)}>
        {content}
      </Link>
    ) : (
      <a
        key={item.href || item.label}
        href={item.href || "#"}
        className={cls}
        onClick={() => setOpen(false)}
      >
        {content}
      </a>
    );
  };

  const userMenu = user ? (
    <Dropdown className="user-menu" align="end">
      <Dropdown.Toggle variant="link" id="vsms-user-menu" className="user-pill">
        <span className="user-pill__avatar">{user.initials}</span>
        <span className="user-pill__text">
          <b>{user.name}</b>
          <small>{user.role}</small>
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="user-menu__panel">
        <Dropdown.Header>
          <span className="user-menu__name">{user.name}</span>
          <span className="user-menu__role">{user.role}</span>
        </Dropdown.Header>
        {user.profileTo ? (
          <Dropdown.Item as={Link} to={user.profileTo}>
            <FiUser size={15} /> Profile &amp; password
          </Dropdown.Item>
        ) : null}
        <Dropdown.Divider />
        <Dropdown.Item as={Link} to="/logout" className="user-menu__logout">
          <FiLogOut size={15} /> Sign out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  ) : null;

  const hasLinks = items.length > 0;

  return (
    <header className={`navbar-vsms${stuck ? " is-stuck" : ""}`}>
      <div className="navbar-vsms__inner">
        <Link to={homeTo} className="brand" aria-label="VSMS home">
          <span className="brand__mark" aria-hidden="true">
            <BsGearFill size={19} />
          </span>
          <span className="brand__text">
            <span className="brand__name">VSMS</span>
            <span className="brand__tag">Vehicle Care</span>
          </span>
        </Link>

        {/* Desktop */}
        {hasLinks ? (
          <ul className="nav-vsms nav-vsms--desktop">
            {items.map(renderItem)}
          </ul>
        ) : (
          <span className="nav-vsms__spacer" />
        )}

        <div className="nav-vsms__right nav-vsms--desktop">{userMenu}</div>

        {/* Mobile: hamburger (drawer is rendered below, one copy only) */}
        <button
          type="button"
          className={`nav-toggle${open ? " is-open" : ""}`}
          aria-expanded={open}
          aria-controls="vsms-drawer"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle__box">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>

      <nav
        id="vsms-drawer"
        className={`nav-drawer${open ? " is-open" : ""}`}
        aria-label="Main navigation"
        aria-hidden={!open}
      >
        {hasLinks ? (
          <ul className="nav-vsms">{items.map(renderItem)}</ul>
        ) : null}
        {user ? (
          <div className="nav-drawer__user">
            <span className="user-pill__avatar">{user.initials}</span>
            <span className="user-pill__text">
              <b>{user.name}</b>
              <small>{user.role}</small>
            </span>
            {user.profileTo ? (
              <Link to={user.profileTo} className="nav-drawer__link">
                Profile &amp; password
                <FiChevronRight size={16} />
              </Link>
            ) : null}
            <Link to="/logout" className="nav-drawer__link nav-drawer__link--out">
              Sign out
              <FiLogOut size={16} />
            </Link>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
