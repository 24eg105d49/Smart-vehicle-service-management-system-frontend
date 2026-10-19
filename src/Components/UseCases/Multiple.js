import { API } from "../../api";
import React, { useEffect, useState } from "react";

function Multiple() {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState({
    languages: [],
    response: [],
  });

  useEffect(() => {
    var scid = localStorage.getItem("scid");
    fetch(`${API}/getfacilities`)
      .then((resp) => resp.json())
      .then((jsonData) => {
        setFacilities(jsonData);
        console.log(jsonData);
      })
      .catch((e) => console.log(e));
  }, []);

  const handleChange = (e) => {
    // Destructuring
    const { value, checked } = e.target;
    const { facilities } = selectedFacilities;

    console.log(`${value} is ${checked}`);

    // Case 1 : The user checks the box
    if (checked) {
      selectedFacilities({
        selectedFacilities: [...facilities, value],
        response: [...facilities, value],
      });
    }

    // Case 2 : The user unchecks the box
    else {
      setSelectedFacilities({
        selectedFacilities: facilities.filter((e) => e !== value),
        response: facilities.filter((e) => e !== value),
      });
    }
  };

  return (
    <>
      <div className="container-fluid top ">
        <div className="container mt-5 pb-5 pt-5">
          <h3 className="form-head-contact-h3 ">Select Facilites</h3>

          <form>
            {facilities.map((f, index) => {
              return (
                <div className="form-check m-3" key={index}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="languages"
                    value={f.facilityid}
                    id="flexCheckDefault"
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    {f.facilityname}
                  </label>
                </div>
              );
            })}

            {/* <div className="row">
              <div className="col-md-6">
                <div className="form-check m-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="languages"
                    value="Javascript"
                    id="flexCheckDefault"
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    Javascript
                  </label>
                </div>
                <div className="form-check m-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="languages"
                    value="Python"
                    id="flexCheckDefault"
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    Python
                  </label>
                </div>
                <div className="form-check m-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="languages"
                    value="Java"
                    id="flexCheckDefault"
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    Java
                  </label>
                </div>
                <div className="form-check m-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="languages"
                    value="PHP"
                    id="flexCheckDefault"
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    PHP
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check m-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="languages"
                    value="C#"
                    id="flexCheckDefault"
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    C#
                  </label>
                </div>
                <div className="form-check m-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="languages"
                    value="C++"
                    id="flexCheckDefault"
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    C++
                  </label>
                </div>
                <div className="form-check m-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="languages"
                    value="C"
                    id="flexCheckDefault"
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    C
                  </label>
                </div>
                <div className="form-check m-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="languages"
                    value="Typescript"
                    id="flexCheckDefault"
                    onChange={handleChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor="flexCheckDefault"
                  >
                    Typescript
                  </label>
                </div>
              </div>
            </div>

            <div className="form-floating mt-3 mb-3 text-center">
              <label htmlFor="exampleFormControlTextarea1">
                You're proficient in the following languages :{" "}
              </label>
              <textarea
                className="form-control text"
                name="response"
                value={userinfo.response}
                placeholder="The checkbox values will be displayed here "
                id="floatingTextarea2"
                style={{ height: "150px" }}
                onChange={handleChange}
              ></textarea>
            </div> */}
          </form>
        </div>
      </div>
    </>
  );
}

export default Multiple;
