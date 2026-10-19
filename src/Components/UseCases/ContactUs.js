function ContactUs() {
  return (
    <>
      <h1 className="text-center mt-5">Contact Us </h1>
      <form className="container justify-content-center align-items-center">
        <div class="form-group">
          <label for="exampleFormControlInput1">Email address</label>
          <input type="email" class="form-control" placeholder="Email" />
        </div>

        <div class="form-group">
          <label for="exampleFormControlTextarea1">Feedback</label>
          <textarea
            class="form-control"
            id="exampleFormControlTextarea1"
            rows="3"
          ></textarea>
          <button
            class=" btn btn-primary mt-3 mt-sm-0 text-center "
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
}
export default ContactUs;
