import { Link } from "react-router-dom";
import { BsGearFill } from "react-icons/bs";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiGithub,
  FiLinkedin,
  FiTwitter,
} from "react-icons/fi";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <Link to="/" className="brand">
            <span className="brand__mark" aria-hidden="true">
              <BsGearFill size={19} />
            </span>
            <span className="brand__text">
              <span className="brand__name">VSMS</span>
              <span className="brand__tag">Vehicle Care</span>
            </span>
          </Link>
          <p>
            A complete vehicle care management platform — book trusted service
            centres, track every stage of the job, and keep your fleet running
            at its best.
          </p>
          <div className="footer__social">
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
              <FiTwitter size={17} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <FiLinkedin size={17} />
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <FiGithub size={17} />
            </a>
          </div>
        </div>

        <div>
          <h6>Product</h6>
          <ul>
            <li><Link to="/viewservicecenters">Find a service centre</Link></li>
            <li><Link to="/customerregistration">Book an appointment</Link></li>
            <li><Link to="/userlogin">Track service status</Link></li>
            <li><Link to="/servicecenterregistration">List your centre</Link></li>
          </ul>
        </div>

        <div>
          <h6>Company</h6>
          <ul>
            <li><Link to="/">About us</Link></li>
            <li><Link to="/">Careers</Link></li>
            <li><Link to="/">Support</Link></li>
            <li><Link to="/">Privacy policy</Link></li>
          </ul>
        </div>

        <div>
          <h6>Get in touch</h6>
          <ul className="footer__contact">
            <li>
              <FiMapPin size={16} />
              <span>Kothrud, Pune, Maharashtra 411038</span>
            </li>
            <li>
              <FiPhone size={16} />
              <a href="tel:+919876543210">+91 98765 43210</a>
            </li>
            <li>
              <FiMail size={16} />
              <a href="mailto:care@vsms.io">care@vsms.io</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <span>© {year} VSMS — The Vehicle Service Management System.</span>
        <div className="footer__legal">
          <Link to="/">Terms</Link>
          <Link to="/">Privacy</Link>
          <Link to="/">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
