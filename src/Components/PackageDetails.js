import { API } from "../api";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

export default function PackageDetails() {
  let [packages, setPackages] = useState([]);
  let [packageinfo, setPackageinfo] = useState({});
  let [city, setCity] = useState([]);
  let [selectCity, setSelectcity] = useState([]);
  let [area, setArea] = useState([]);
  let [brand, setBrand] = useState([]);
  let [servicecenters, setServiceCenters] = useState([]);
  // let [brand, setBrand] = useState([]);
  // let [serviceCenters, setServiceCenters] = useEffect();

  async function fetchPackageinfo() {
    let response = await axios.get(`${API}/getPackageById?id=1`);
    let data = await response.data;
    setPackageinfo(data);
    console.log(data);
  }
  async function fetchCities() {
    let response = await axios.get(`${API}/getCities`);
    let data = await response.data;
    setCity(data);
    console.log(data);
  }

  async function fetchArea() {
    let response = await axios.get(
      `${API}/getAreaByCityId?id=1`
    );
    let data = await response.data;
    setArea(data);
    console.log(data);
  }

  async function fetchServiceCenter() {
    let response = await axios.get(
      `${API}/getScByBrandArea?bid=1&aid=1`
    );
    let data = await response.data;
    setServiceCenters(data);
    console.log(data);
  }

  async function fetchPackages() {
    // var scid = 1;
    let response = await axios.get(
      `${API}/getPackageByScId?scid=1`
    );
    let data = await response.data;
    setPackages(data);
    console.log(data);
  }

  async function fetchBrand() {
    let response = await axios.get(`${API}/getBrands`);
    let data = await response.data;
    setBrand(data);
    console.log(data);
  }

  useEffect(() => {
    fetchCities();
    fetchBrand();
  }, []);

  return (
    <div
      className="container"
      style={{ width: "auto", overflowX: "auto", overflowY: "auto" }}
    >
      <form>
        <table
          border={1}
          cellPadding={15}
          className="table table table-striped"
          style={{ textAlign: "right" }}
        >
          <tbody>
            <tr>
              <td
                style={{
                  textAlign: "center",
                }}
                colSpan="3"
              >
                <b>Please Select following Options</b>
              </td>
            </tr>
            <tr>
              <td style={{ textAlign: "right" }}>Select City :</td>
              <td style={{ textAlign: "left" }}>
                <select
                  onSelect={(e) => setSelectcity(e.target.value)}
                  onChange={fetchArea}
                >
                  <option>Select One</option>
                  {city.map((cts) => {
                    return (
                      <option value={cts?.cityid} key={cts?.cityid}>
                        {cts?.cityname}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
            <tr>
              <td>Select Area :</td>
              <td style={{ textAlign: "left" }}>
                <select>
                  <option>Select One</option>
                  {area.map((cts) => {
                    return (
                      <option value={cts?.areaid} key={cts?.areaid}>
                        {cts?.areaname}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
            <tr>
              <td>Select Brand :</td>
              <td style={{ textAlign: "left" }}>
                <select
                  onSelect={(e) => setBrand(e.target.value)}
                  onChange={fetchServiceCenter}
                >
                  <option>Select One</option>
                  {brand.map((cts) => {
                    return (
                      <option value={cts?.brandid} key={cts?.brandid}>
                        {cts?.bname}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
            <tr>
              <td>Select Service Center :</td>
              <td style={{ textAlign: "left" }}>
                <select onChange={fetchPackages}>
                  <option>Select One</option>
                  {servicecenters.map((cts) => {
                    return (
                      <option
                        value={cts?.servicecenterid}
                        key={cts?.servicecenterid}
                      >
                        {cts?.scname}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
            <tr>
              <td>Select Package :</td>
              <td style={{ textAlign: "left" }}>
                <select onSelect={fetchPackageinfo}>
                  <option>Select One</option>
                  {packages.map((cts) => {
                    return (
                      <option
                        value={cts?.packagedetailsid}
                        key={cts?.packagedetailsid}
                      >
                        {cts?.packagename}
                      </option>
                    );
                  })}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <table
          border={1}
          cellPadding={15}
          className="table table table-striped"
        >
          <tbody>
            <tr>
              <td
                style={{
                  textAlign: "center",
                }}
                colSpan="3"
              >
                <b>Package Details</b>
              </td>
            </tr>
            <tr>
              <td>Service Center Name :</td>
              <td>{packageinfo?.servicecenter?.scname}</td>
            </tr>
            <tr>
              <td>Service Center Address :</td>
              <td>{packageinfo?.servicecenter?.lane}</td>
            </tr>
            <tr>
              <td>Brand Name :</td>
              <td>{packageinfo?.servicecenter?.brand?.bname}</td>
            </tr>
            <tr>
              <td>Package Name :</td>
              <td>{packageinfo?.servicecenter?.brand?.bname}</td>
            </tr>
            <tr>
              <td>Package cost :</td>
              <td>{packageinfo?.cost}</td>
            </tr>
            <tr>
              <td>Facilities</td>
              <td>a</td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}
