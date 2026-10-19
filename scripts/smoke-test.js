/**
 * Render smoke test.
 *
 * Boots the production build (React/build) inside jsdom and renders every
 * route, asserting that each one produces visible content with no thrown
 * errors. This catches the class of bug where a bad API response blanks a
 * whole page.
 *
 * Usage:   npm run build && npm run smoke
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { JSDOM, ResourceLoader, VirtualConsole } = require("jsdom");

const BUILD = path.join(__dirname, "..", "build");
const PORT = 5177;

if (!fs.existsSync(path.join(BUILD, "index.html"))) {
  console.error("No production build found. Run `npm run build` first.");
  process.exit(2);
}

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".map": "application/json",
  ".txt": "text/plain",
  ".png": "image/png",
};

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]);
  let file = path.join(BUILD, p);
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    file = path.join(BUILD, "index.html"); // SPA fallback
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  res.end(fs.readFileSync(file));
});

// Load assets from our own server only; stub out fonts/CDNs.
class LocalOnly extends ResourceLoader {
  fetch(url, options) {
    if (url.startsWith(`http://localhost:${PORT}`)) return super.fetch(url, options);
    return Promise.resolve(Buffer.from(""));
  }
}

// [route, human label, signed in?]
const ROUTES = [
  ["/", "Landing", false],
  ["/", "Landing (signed in)", true],
  ["/userlogin", "Login", false],
  ["/forgotpwd", "Forgot password", false],
  ["/customerregistration", "Customer registration", false],
  ["/servicecenterregistration", "Centre registration", false],
  ["/viewservicecenters", "Service centres", false],
  ["/customerhome", "Customer dashboard", true],
  ["/customerhome/bookAppointment", "Customer > book", true],
  ["/customerhome/vehdetails", "Customer > vehicles", true],
  ["/customerhome/serviceprogress", "Customer > progress", true],
  ["/customerhome/rate", "Customer > rating", true],
  ["/customerhome/registervehicle", "Customer > add vehicle", true],
  ["/customerhome/changePwd", "Customer > password", true],
  ["/serviceHome", "Centre dashboard", true],
  ["/serviceHome/updateProgress", "Centre > progress", true],
  ["/serviceHome/packages", "Centre > packages", true],
  ["/serviceHome/changePwd", "Centre > password", true],
  ["/adminHome", "Admin dashboard", true],
  ["/adminHome/view", "Admin > requests", true],
  ["/adminHome/changePwd", "Admin > password", true],
];

const HTML = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");

function render(route, loggedIn) {
  return new Promise((resolve) => {
    const errors = [];
    const vc = new VirtualConsole();
    vc.on("jsdomError", (e) => errors.push("jsdomError: " + (e.message || e)));
    vc.on("error", (...a) =>
      errors.push(
        "console.error: " + a.map((x) => (x && x.message) || String(x)).join(" ")
      )
    );

    let dom;
    try {
      dom = new JSDOM(HTML, {
        url: `http://localhost:${PORT}${route}`,
        runScripts: "dangerously",
        resources: new LocalOnly(),
        pretendToBeVisual: true,
        virtualConsole: vc,
        beforeParse(window) {
          window.localStorage.setItem("loggedIn", loggedIn ? "true" : "false");
          window.localStorage.setItem("loginid", "55");
          window.localStorage.setItem("custid", "23");
          window.localStorage.setItem("scid", "8");
          window.fetch = () =>
            Promise.resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve([]),
              text: () => Promise.resolve(""),
            });
          window.scrollTo = () => {};
          window.matchMedia = () => ({
            matches: false,
            media: "",
            onchange: null,
            addListener() {},
            removeListener() {},
            addEventListener() {},
            removeEventListener() {},
            dispatchEvent() {
              return false;
            },
          });
          window.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
          };
          window.IntersectionObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
            takeRecords() {
              return [];
            }
          };
          window.addEventListener("error", (e) =>
            errors.push(
              "window.error: " + ((e.error && e.error.message) || e.message)
            )
          );
          window.addEventListener("unhandledrejection", (e) =>
            errors.push("rejection: " + ((e.reason && e.reason.message) || e.reason))
          );
        },
      });
    } catch (e) {
      return resolve({ route, errors: ["construct: " + e.message], chars: 0 });
    }

    setTimeout(() => {
      const root = dom.window.document.getElementById("root");
      const text = ((root && root.textContent) || "").replace(/\s+/g, " ").trim();
      resolve({
        route,
        errors: [...new Set(errors)],
        chars: text.length,
        snippet: text.slice(0, 90),
      });
      dom.window.close();
    }, 2500);
  });
}

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const results = [];
  for (const [route, label, auth] of ROUTES) {
    results.push({ label, ...(await render(route, auth)) });
  }
  server.close();

  let failed = 0;
  console.log("\n" + "FLAG".padEnd(8) + "PAGE".padEnd(30) + "chars".padStart(6));
  console.log("-".repeat(50));
  for (const r of results) {
    const bad = r.errors.length > 0 || r.chars < 30;
    if (bad) failed++;
    console.log(
      (bad ? "[FAIL]" : "[OK]").padEnd(8) +
        r.label.padEnd(30) +
        String(r.chars).padStart(6) +
        (r.errors.length ? "\n        " + r.errors.join("\n        ") : "")
    );
  }

  console.log(
    `\n${results.length - failed}/${results.length} routes rendered cleanly.`
  );
  process.exit(failed ? 1 : 0);
})();
