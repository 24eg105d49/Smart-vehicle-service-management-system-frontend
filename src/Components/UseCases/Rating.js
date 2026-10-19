import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { API } from "../../api";

/**
 * Customer feedback: pick a service centre, give it 1-5 stars, add a comment.
 * The average is what drivers see on the public centre listing.
 */
export default function Rating() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedsc, setSelectedsc] = useState("");
  const [centers, setCenters] = useState([]);
  const [banner, setBanner] = useState(null);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const custid = localStorage.getItem("custid");

  useEffect(() => {
    fetch(API + "/allservicecenters")
      .then((resp) => resp.json())
      .then((list) => setCenters(Array.isArray(list) ? list : []))
      .catch(() =>
        setBanner({ kind: "danger", text: "Could not load service centres." })
      );
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;

    if (!selectedsc) {
      setBanner({ kind: "danger", text: "Select the service centre you want to rate." });
      return;
    }
    if (rating < 1) {
      setBanner({ kind: "danger", text: "Tap the stars to choose a rating." });
      return;
    }

    setSending(true);
    try {
      const resp = await fetch(API + "/setRating", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          rating,
          comment,
          customerid: custid,
          servicecenterid: Number(selectedsc),
        }),
      });

      const text = await resp.text();
      let body = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch (err) {
        body = null;
      }

      // The endpoint used to answer 200 with an empty body even when it had
      // saved nothing, so success is now judged on the payload too.
      if (!resp.ok || !body || body.ratingid == null) {
        setBanner({
          kind: "danger",
          text: (body && body.message) || "Your feedback could not be saved.",
        });
        return;
      }

      setBanner({ kind: "success", text: "Thanks — your feedback has been sent." });
      setTimeout(() => navigate("/customerhome"), 900);
    } catch (err) {
      setBanner({ kind: "danger", text: "Could not reach the server. Please try again." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow--accent">Feedback</span>
          <h1 className="page-header__title">Rate a service centre</h1>
          <p className="page-header__sub">
            Tell other drivers how it went. Your rating becomes the average
            score shown on the public listing.
          </p>
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

      <div className="panel" style={{ maxWidth: 640 }}>
        <div className="card-body">
          <form onSubmit={submit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="rate-sc">
                Service centre
              </label>
              <select
                id="rate-sc"
                className="form-select"
                value={selectedsc}
                onChange={(e) => setSelectedsc(e.target.value)}
              >
                <option value="">Select a centre…</option>
                {centers.map((s) => (
                  <option key={s.servicecenterid} value={s.servicecenterid}>
                    {s.scname}
                    {s.area ? ` — ${s.area.areaname}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <span className="form-label">Your rating</span>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
                    onClick={() => setRating(starValue)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 2,
                      cursor: "pointer",
                      lineHeight: 0,
                    }}
                  >
                    <FaStar
                      size={32}
                      color={starValue <= rating ? "#f5a623" : "#c8ccd4"}
                    />
                  </button>
                ))}
                <span className="text-muted" style={{ marginLeft: 10 }}>
                  {rating ? `${rating} out of 5` : "Not rated yet"}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rate-comment">
                Comment <span className="text-muted">(optional)</span>
              </label>
              <textarea
                id="rate-comment"
                className="form-control"
                rows="4"
                maxLength={500}
                placeholder="What went well? Anything they could improve?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={sending}>
              {sending ? "Sending…" : "Submit feedback"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
