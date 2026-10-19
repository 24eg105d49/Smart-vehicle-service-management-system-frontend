import { Link } from "react-router-dom";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiShield,
  FiTool,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { BsGearFill } from "react-icons/bs";

const features = [
  {
    icon: <FiMapPin />,
    tone: "",
    title: "Verified service centres",
    body: "Browse authorised centres by city, area and brand, with ratings, contact details and the facilities they offer.",
  },
  {
    icon: <FiCalendar />,
    tone: "accent",
    title: "Slot booking in seconds",
    body: "Pick a package, choose a date and confirm. Your appointment is registered instantly against your vehicle.",
  },
  {
    icon: <FiClock />,
    tone: "info",
    title: "Live service tracking",
    body: "Follow every stage — check-in, inspection, repair, quality check and delivery — all from one timeline.",
  },
  {
    icon: <FiShield />,
    tone: "success",
    title: "Transparent invoicing",
    body: "Itemised invoices and digital payments attached to each job, so there are never any surprises at handover.",
  },
  {
    icon: <FiTool />,
    tone: "",
    title: "Service packages",
    body: "Compare fixed-price maintenance packages and add-ons before you commit — no hidden line items.",
  },
  {
    icon: <FiTrendingUp />,
    tone: "accent",
    title: "Rate & review",
    body: "Score the work you received. Great centres rise to the top and every driver benefits.",
  },
];

const steps = [
  {
    title: "Find your centre",
    body: "Search verified service centres by location and brand, then compare packages and ratings side by side.",
  },
  {
    title: "Book a slot",
    body: "Register your vehicle, pick a package and confirm the appointment. You get an immediate booking reference.",
  },
  {
    title: "Track & drive",
    body: "Watch progress live, approve the work, settle the invoice and collect your car — all in the app.",
  },
];

export default function Home() {
  return (
    <>
      {/* ------------------------------------------------ Hero */}
      <section className="hero">
        <div className="hero__inner">
          <div>
            <span className="eyebrow eyebrow--accent anim-up">
              <BsGearFill size={13} /> Vehicle care, managed
            </span>

            <h1 className="anim-up anim-d1">
              Every service booking,
              <br />
              under <span className="accent">one roof</span>.
            </h1>

            <p className="hero__lead anim-up anim-d2">
              VSMS connects drivers with authorised service centres — from the
              first appointment to the final invoice. Book in seconds, follow
              each stage of the job in real time, and keep a complete history
              for every vehicle you own.
            </p>

            <div className="hero__cta anim-up anim-d3">
              <Link to="/customerregistration" className="btn btn-hero-primary">
                Get started free
              </Link>
              <Link to="/viewservicecenters" className="btn btn-hero-ghost">
                Browse service centres
              </Link>
            </div>

            <div className="hero__meta anim-up anim-d4">
              <div className="hero__meta-item">
                <strong>12k+</strong>
                <span>Appointments completed</span>
              </div>
              <div className="hero__meta-item">
                <strong>180+</strong>
                <span>Authorised centres</span>
              </div>
              <div className="hero__meta-item">
                <strong>4.8/5</strong>
                <span>Average driver rating</span>
              </div>
            </div>
          </div>

          {/* Live-looking service status card */}
          <div className="hero__visual anim-up anim-d2">
            <div className="hero-card">
              <div className="hero-card__head">
                <div>
                  <p className="hero-card__title">Service status</p>
                  <small style={{ color: "var(--ink-400)" }}>
                    Job #SR-2041 · Maruti Suzuki Baleno
                  </small>
                </div>
                <span className="badge bg-primary">In progress</span>
              </div>

              <div className="hero-progress">
                <div className="hero-progress__row">
                  <span className="hero-progress__icon hero-progress__icon--done">
                    <FiCheckCircle />
                  </span>
                  <div className="hero-progress__body">
                    <b>Vehicle checked in</b>
                    <span>09:15 AM · Bay 2</span>
                  </div>
                </div>

                <div className="hero-progress__row">
                  <span className="hero-progress__icon hero-progress__icon--done">
                    <FiCheckCircle />
                  </span>
                  <div className="hero-progress__body">
                    <b>Inspection completed</b>
                    <span>10:40 AM · 42-point check</span>
                  </div>
                </div>

                <div className="hero-progress__row">
                  <span className="hero-progress__icon hero-progress__icon--active">
                    <BsGearFill />
                  </span>
                  <div className="hero-progress__body">
                    <b>Service in progress</b>
                    <span>Engine oil &amp; filter replacement</span>
                  </div>
                </div>

                <div className="hero-progress__bar" aria-hidden="true">
                  <i style={{ width: "68%" }} />
                </div>

                <div className="hero-progress__row">
                  <span className="hero-progress__icon hero-progress__icon--pending">
                    <FiClock />
                  </span>
                  <div className="hero-progress__body">
                    <b>Quality check &amp; delivery</b>
                    <span>Expected by 04:30 PM</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="float-chip float-chip--a">
              <FiShield style={{ color: "var(--success)" }} />
              <span>
                6 months warranty
                <small>On all service packages</small>
              </span>
            </div>

            <div className="float-chip float-chip--b">
              <FiUsers style={{ color: "var(--brand-600)" }} />
              <span>
                1,240 online now
                <small>Across 180 centres</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ Features */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Why VSMS</span>
            <h2>Everything a driver needs, nothing they don't</h2>
            <p className="lead-text">
              One platform for customers, service centres and administrators —
              built around the way vehicle servicing actually works.
            </p>
          </div>

          <div className="grid">
            {features.map((f) => (
              <article className="feature" key={f.title}>
                <div className={`feature__icon ${f.tone ? `feature__icon--${f.tone}` : ""}`}>
                  {f.icon}
                </div>
                <h4>{f.title}</h4>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ How it works */}
      <section className="section section--alt">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2>Booked in three simple steps</h2>
          </div>

          <div className="steps">
            {steps.map((s) => (
              <div className="step" key={s.title}>
                <div className="step__num" />
                <h4>{s.title}</h4>
                <p>{s.body}</p>
              </div>
            ))}
          </div>

          <div className="cta-band section-gap">
            <h2>Ready to service your vehicle?</h2>
            <p>
              Create a free account, register your car and book your first
              appointment — it takes less than two minutes.
            </p>
            <div className="hero__cta">
              <Link to="/customerregistration" className="btn btn-accent btn-lg">
                Create an account
              </Link>
              <Link to="/servicecenterregistration" className="btn btn-hero-ghost btn-lg">
                I run a service centre
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
