import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
export default function Invoice({ show = false, onClose, data }) {
  console.log(data);
  return (
    <div>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className="table table-striped">
            <tbody>
              <tr>
                <td>Invoice ID</td>
                <td>{data.invoiceid}</td>
              </tr>
              <tr>
                <td>Invoice ID</td>
                <td>{data.invoiceid}</td>
              </tr>
              <tr>
                <td>Invoice ID</td>
                <td>{data.invoiceid}</td>
              </tr>
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
