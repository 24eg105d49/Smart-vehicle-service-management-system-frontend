import { useState } from "react";
import React from "react";
import axios from "axios";
import { API } from "../api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./slice";
import { useSelector } from "react-redux";

export default function UserLogin() {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState("");
  const [data, setData] = useState({});
  const [uidCheck, setUidCheck] = useState(false);
  const [pwdCheck, setPwdCheck] = useState(false);
  const [button, setButton] = useState(false);
  const userData = { userid, password };
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const reduxAction = useDispatch();

  const mystate = useSelector((state) => state.logged);

  const validateUid = () => {
    if (userid.length === 0) {
      //alert("Error: Username cannot be blank!");
      document.getElementById("uidmsg").innerHTML = "Username cannot be blank!";
      return;
    }

    if (userid.length < 3) {
      //alert("Error: Username cannot be blank!");
      document.getElementById("uidmsg").innerHTML =
        "User ID should be greater than 3 Character";
      return;
    }
    if (userid.length > 15) {
      //alert("Error: Username cannot be blank!");
      document.getElementById("uidmsg").innerHTML =
        "User ID should be less than 15 Character";
      return;
    }
    if (userid.length !== 0) {
      //alert("Error: Username cannot be blank!");
      document.getElementById("uidmsg").innerHTML = "";
      return;
    }
    if (uidCheck === true && pwdCheck === true) {
      setButton("ok");
    } else {
      setUidCheck(true);
    }
  };

  const validatePassword = () => {
    if (password.length === 0) {
      document.getElementById("pwdmsg").innerHTML = "Fill the password please!";
      return;
    }
    if (password.length < 8) {
      document.getElementById("pwdmsg").innerHTML =
        "Password should not be less than 8 characters";
      return;
    }
    if (password.length > 16) {
      document.getElementById("pwdmsg").innerHTML =
        "Password should not be greater than 16 characters";
      return;
    }
    let re = /[0-9]/;
    if (!re.test(password)) {
      document.getElementById("pwdmsg").innerHTML =
        "Password must contain at least one number (0-9)!";
      return;
    }
    re = /[a-z]/;
    if (!re.test(password)) {
      document.getElementById("pwdmsg").innerHTML =
        "Password must contain at least one lowercase letter (a-z)!";
      return;
    }
    re = /[#?!@$%^&*-]/;
    if (!re.test(password)) {
      document.getElementById("pwdmsg").innerHTML =
        "Password must contain at least one symbol (#?!@$%^&*-)!";
      return;
    }
    re = /[A-Z]/;
    if (!re.test(password)) {
      document.getElementById("pwdmsg").innerHTML =
        "Password must contain at least one uppercase letter (A-Z)!";
      return;
    } else {
      document.getElementById("pwdmsg").innerHTML = "";
      setPwdCheck(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(userid + " " + password);
    axios
      .post(`${API}/logincheck`, { userid, password })
      .then((response) => {
        if (response.status === 200) {
          reduxAction(login());
          console.log("SUCCESSS-", response.status);
          console.log(response);
          sessionStorage.setItem("loggeduser", JSON.stringify(response.data));
          if (data === "") {
            navigate("/userlogin");
            setMsg("User not Exists!");
          }
          if (response.data.roleid.roleid === 1) {
            navigate("/customerhome", {
              state: { userid: userid, loginid: response.data.loginid },
            });
          }
          if (response.data.roleid.roleid === 2) {
            navigate("/servicecenterhome", {
              state: { userid: userid },
            });
          }
          if (response.data.roleid.roleid === 3) {
            navigate("/adminhome", {
              state: { userid: userid },
            });
          }
        }
      })
      .catch((e) => {
        console.log("SOMETHING WENT WRONG -", e);
        setMsg("Login Failed !");
      });
  };

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <div className="container-fulid">
          <form name="form">
            <table
              border={1}
              cellPadding={15}
              style={{ backgroundColor: "white" }}
            >
              <tbody>
                <tr>
                  <td colSpan="2" align="center">
                    <p style={{ color: "red" }}>
                      <b>{msg}</b>
                    </p>
                    <b>Login Page</b>
                  </td>
                </tr>

                <tr>
                  <td>User Id :</td>
                  <td>
                    <input
                      type="text"
                      name="uid"
                      id="uid"
                      placeholder="Enter here ..."
                      required
                      onChange={(e) => setUserid(e.target.value)}
                      onBlur={validateUid}
                    />
                    <br />
                    <span id="uidmsg" style={{ color: "red" }}></span>
                  </td>
                </tr>
                <tr>
                  <td>Password :</td>
                  <td>
                    <input
                      type="password"
                      name="pwd"
                      placeholder="Enter here ..."
                      required
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      onBlur={validatePassword}
                    />

                    <br />
                    <span id="pwdmsg" style={{ color: "red" }}></span>
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" align="center">
                    <input
                      type="submit"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      value="Login"
                    />
                  </td>
                </tr>

                <tr>
                  <td>
                    <p>Forgot Password ?</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </div>
    </div>
  );
}
