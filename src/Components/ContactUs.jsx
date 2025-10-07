import React, { useRef,useState } from 'react';
import emailjs from '@emailjs/browser';
import ReactJsAlert from "reactjs-alert";

const ContactUs = () => {

    const form = useRef();
    const [status, setStatus] = useState(false);
    const [type, setType] = useState("success");
    const [title, setTitle] = useState("Thank you for your inquiry. We will get back to you as soon as possible.");
    const sendEmail = (e) => {
      e.preventDefault();
     
     
      emailjs
        .sendForm('service_9wwh682', 'template_btoua8k', form.current, {
          publicKey: 'LjissUB9pujYt6oa7',
        })
        .then(
          () => {
            console.log('SUCCESS!');

          setStatus(true);
          setType("success");
          setTitle("Thank you for your inquiry. We will get back to you as soon as possible.");
  
          },
          (error) => {
            console.log('FAILED...', error.text);
          },
        );
    };

  return (
    <>

  <div class="container-xxl py-5">
  <div class="container">
      <div class="row g-5">
          <div class="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
              {/* <p class="fs-5 fw-bold text-primary">Contact Us</p> */}
              <h1 class="display-5 mb-5">If You Have Any Query, Please Contact Peels Native Plants Ltd</h1>
              {/* <p class="mb-4">The contact form is currently inactive. Get a functional and working contact form with Ajax & PHP in a few minutes. Just copy and paste the files, add a little code and you're done. <a href="https://htmlcodex.com/contact-form">Download Now</a>.</p> */}
              <form class="formContainer" ref={form} onSubmit={sendEmail}>
                  <div class="row g-3">
                      <div class="col-md-6">
                          <div class="form-floating">
                              <input type="text" class="form-control" id="name" name='name' placeholder="Your Name"/>
                              <label for="name">Your Name</label>
                          </div>
                      </div>
                      <div class="col-md-6">
                          <div class="form-floating">
                              <input type="email" class="form-control" id="email" name='email' placeholder="Your Email"/>
                              <label for="email">Your Email</label>
                          </div>
                      </div>
                      <div class="col-12">
                          <div class="form-floating">
                              <input type="tel" class="form-control" id="phone" name='phone' placeholder="Phone"/>
                              <label for="subject">Phone</label>
                          </div>
                      </div>
                      <div class="col-12">
                          <div class="form-floating">
                              <textarea class="form-control" placeholder="Leave a message here" id="message" name='message' style={{height:'100px'}}></textarea>
                              <label for="message">Message</label>
                          </div>
                      </div>
                      <div class="col-12">
                          <button class="btn btn-primary py-3 px-4" type="submit">Send Message</button>
                      </div>
                  </div>
              </form>
              
          </div>
          <div class="col-lg-6 wow fadeIn" data-wow-delay="0.5s" style={{minHeight:'450px', border:'0'}}>
              <div class="position-relative rounded overflow-hidden h-100">
                  <iframe class="position-relative w-100 h-100"
                  title="Peel Native Plants Location"  src="https://www.google.com/maps?q=22064+64+Ave,+Langley,+BC,+V2Y+2N8&amp;output=embed"
                  frameborder="0" style={{minHeight:'450px', border:'0'}} allowfullscreen="" aria-hidden="false"
                  tabindex="0"></iframe>
              </div>
          </div>
      </div>
  </div>
</div>
<ReactJsAlert
        status={status}
        type={type}
        title={title}
        Close={() => setStatus(false)}
      />
</>
  )
}

export default ContactUs