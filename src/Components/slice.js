import { createSlice } from "@reduxjs/toolkit";

// Persist the auth flag so a page refresh doesn't bounce a signed-in user
// back to the login screen (redux state is in-memory only).
const readInitial = () => {
  try {
    return localStorage.getItem("loggedIn") === "true";
  } catch (e) {
    return false;
  }
};

const persist = (value) => {
  try {
    if (value) localStorage.setItem("loggedIn", "true");
    else localStorage.removeItem("loggedIn");
  } catch (e) {
    /* storage unavailable — ignore */
  }
};

export const loggedSlice = createSlice({
  name: "logged",
  initialState: {
    loggedIn: readInitial(),
  },
  reducers: {
    login: () => {
      persist(true);
      return { loggedIn: true };
    },

    logout: () => {
      persist(false);
      return { loggedIn: false };
    },
  },
});
export const { login, logout } = loggedSlice.actions;
export default loggedSlice.reducer;
