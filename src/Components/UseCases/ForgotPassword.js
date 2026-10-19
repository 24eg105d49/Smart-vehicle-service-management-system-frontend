import { API } from "../../api";
import { useReducer, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../slice";
import { Button } from "react-bootstrap";

const ForgotPassword = () => {
  const [question, setQuestion] = useState([]);
  const [question_id, setQuestionid] = useState(0);
  const [display, setDisplay] = useState(false);
  const [form, setForm] = useState(true);

  //-------------------------------------------------
  const obj = {
    uid: "",
    pwd: "",
  };
  const reducer2 = (state, action) => {
    switch (action.type) {
      case "update":
        return { ...state, [action.fld]: action.val };
      case "reset":
        return obj;
    }
  };

  const [send, dispatch2] = useReducer(reducer2, obj);

  const changePwd = (e) => {
    e.preventDefault();
    setmsg("");
    if (!send.pwd) {
      setmsg("Please enter a new password.");
      return;
    }
    if (!/[A-Z]/.test(send.pwd)) {
      setmsg("Password must contain at least one capital letter");
      return;
    }
    if (!/\d/.test(send.pwd)) {
      setmsg("Password must contain at least one number");
      return;
    }
    if (!/[!@#$%^&*]/.test(send.pwd)) {
      setmsg("Password must contain at least one special character (!@#$%^&*)");
      return;
    }

    // Encode the query string: characters such as '#' and '&' would
    // otherwise truncate the value before it reaches the server.
    const params = new URLSearchParams({
      userid: send.uid.trim(),
      newPwd: send.pwd,
    });

    fetch(`${API}/changePwd?` + params.toString(), {
      method: "POST",
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((rows) => {
        // The server returns the number of rows updated; 0 means no account
        // matched and must not be reported as a success.
        if (Number(rows) === 1) {
          alert("Password changed Successfully. Try Login...");
          navigate("/userlogin");
        } else {
          setmsg("No account matched that user ID, so nothing was changed.");
        }
      })
      .catch(() => setmsg("Could not reach the server. Please try again."));
  };
  //-------------------------------------------------
  useEffect(() => {
    const getquestion = async () => {
      const resquestion = await fetch(`${API}/getQuestions`);
      const resques = await resquestion.json();
      setQuestion(await resques);
    };
    getquestion();
  }, []);

  const handlequestion = (event) => {
    const getquestionid = event.target.value;
    setQuestionid(getquestionid);
  };

  const init = {
    uid: "",
    answer: "",
  };
  const reducer = (state, action) => {
    switch (action.type) {
      case "update":
        return { ...state, [action.fld]: action.val };
      case "reset":
        return init;
    }
  };
  const [info, dispatch] = useReducer(reducer, init);
  const [msg, setmsg] = useState("");
  const navigate = useNavigate();
  const reduxAction = useDispatch();

  const sendData = (e) => {
    e.preventDefault();
    setmsg("");
    if (!info.uid.trim()) {
      setmsg("Please enter your user ID.");
      return;
    }
    if (!info.answer.trim()) {
      setmsg("Please answer your security question.");
      return;
    }

    // Answers commonly contain spaces and symbols, so this query string
    // must be encoded or the server receives a truncated value.
    const params = new URLSearchParams({
      userid: info.uid.trim(),
      answer: info.answer,
    });

    fetch(`${API}/checkAnswer?` + params.toString(), {
      method: "POST",
    })
      .then((resp) => (resp.ok ? resp.text() : Promise.reject(resp.status)))
      .then((text) => {
        const trimmed = (text || "").trim();
        return trimmed ? JSON.parse(trimmed) : null;
      })
      .then((jsonData) => {
        if (jsonData && jsonData.userid === info.uid.trim()) {
          setDisplay(true);
          setForm(false);
        } else {
          setmsg("That user ID and answer do not match our records.");
        }
      })
      .catch(() => setmsg("Could not reach the server. Please try again."));
  };

  return (
    <div className=" back app">
      <br />
      <h3 className="title" style={{ textAlign: "center", paddingBottom: 30 }}>
        Forgot Password
      </h3>
      {msg ? (
        <div
          className="alert alert-danger"
          role="alert"
          style={{ maxWidth: 520, margin: "0 auto 18px" }}
        >
          {msg}
        </div>
      ) : null}
      <form style={{ display: form ? "block" : "none" }}>
        <div className="row">
          <div className="col"></div>
          <div className="col">
            <div className="form">
              <div className="mb-3">
                <label htmlFor="uid" className="form-label">
                  Enter Uid:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="uid"
                  name="uid"
                  size="sm"
                  value={info.uid}
                  onChange={(e) =>
                    dispatch({
                      type: "update",
                      fld: "uid",
                      val: e.target.value,
                    })
                  }
                  placeholder="Enter uid"
                />
                <div id="emailHelp" className="form-text"></div>
              </div>

              <div className="mb-3">
                <label htmlFor="question" className="label-control">
                  Select Question:
                </label>
                <select
                  name="question"
                  className="form-control"
                  onChange={(e) =>
                    dispatch({
                      type: "update",
                      fld: "questionid",
                      val: e.target.value,
                    })
                  }
                >
                  <option value="">--Select Security Question--</option>
                  {question.map((getques, index) => (
                    <option key={index} value={getques.questionid}>
                      {getques.questiontext}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="answer" className="form-label">
                  Enter Answer:
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="answer"
                  name="answer"
                  size="sm"
                  value={info.answer}
                  onChange={(e) =>
                    dispatch({
                      type: "update",
                      fld: "answer",
                      val: e.target.value,
                    })
                  }
                  placeholder="Enter Answer"
                />
                <div id="emailHelp" className="form-text"></div>
              </div>
              <Button
                color="primary"
                type="submit"
                onClick={(e) => {
                  sendData(e);
                }}
              >
                Submit
              </Button>
              <Button
                color="secondary"
                type="reset"
                className="ms-4"
                onClick={() => {
                  dispatch({ type: "reset" });
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          <div className="col"></div>
        </div>
      </form>
      <br />
      {/*************************** Change Password ********************************************/}
      <div style={{ display: display ? "block" : "none" }}>
        <form>
          <h3>Change Password</h3>
          <div className="row">
            <div className="col"></div>
            <div className="col">
              <div className="form">
                <div className="mb-3">
                  <label htmlFor="uid" className="form-label">
                    Enter Uid:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="uid"
                    name="uid"
                    size="sm"
                    value={send.uid}
                    onChange={(e) =>
                      dispatch2({
                        type: "update",
                        fld: "uid",
                        val: e.target.value,
                      })
                    }
                    placeholder="Enter uid"
                  />
                  <div id="emailHelp" className="form-text"></div>
                </div>

                <div className="mb-3">
                  <label htmlFor="pwd" className="form-label">
                    Enter New Password:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="pwd"
                    name="pwd"
                    size="sm"
                    value={send.pwd}
                    onChange={(e) =>
                      dispatch2({
                        type: "update",
                        fld: "pwd",
                        val: e.target.value,
                      })
                    }
                    placeholder="Enter New Password"
                  />
                  <div id="emailHelp" className="form-text"></div>
                </div>
                <Button
                  color="primary"
                  type="submit"
                  onClick={(e) => {
                    changePwd(e);
                  }}
                >
                  Submit
                </Button>
                <Button
                  color="secondary"
                  type="reset"
                  className="ms-4"
                  onClick={() => {
                    dispatch({ type: "reset" });
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
            <div className="col"></div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
