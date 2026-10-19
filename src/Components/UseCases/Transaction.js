import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default function Transaction({
  show = false,
  onClose,
  handleSave,
  data,
  handlePaymentModeChange,
}) {
  return (
    <div>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-striped">
            <tbody>
              <tr>
                <td>Package Name:</td>
                <td>{data?.servicerequestid?.pkgid?.packagename}</td>
              </tr>
              <tr>
                <td>Package Cost:</td>
                <td>{data?.servicerequestid?.pkgid?.cost}</td>
              </tr>
              <tr>
                <td>Progress ID:</td>
                <td>{data.serviceprogressid}</td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: "center" }}>
                  <select onChange={handlePaymentModeChange}>
                    <option>Select One</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Mark Paid
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
