/**
 * Single source of truth for the backend base URL.
 *
 * In development: set REACT_APP_API_URL in a local .env file,
 *   or leave it unset — it will default to http://localhost:8080.
 *
 * In production (Vercel): set the REACT_APP_API_URL environment variable
 *   to your Render backend URL, e.g. https://your-app.onrender.com
 *
 * Usage in any component:
 *   import { API } from "../../api";    // adjust relative path as needed
 *   fetch(`${API}/someEndpoint`)
 */
export const API =
  process.env.REACT_APP_API_URL || "http://localhost:8080";
