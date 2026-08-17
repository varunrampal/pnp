import React from 'react';
import ContactUs from '../Components/ContactUs';

const Contact = () => (
  <>
    <header className="container-fluid page-header contact-page-header py-5">
      <div className="container py-5">
        <div className="row align-items-end g-4">
          <div className="col-lg-8">
            <p className="hero-kicker">PROJECT ENQUIRIES · PEELS NATIVE PLANTS</p>
            <h1 className="display-3 text-white mb-3">Start with the site.</h1>
          </div>
          <div className="col-lg-4">
            <p className="contact-header-copy">Tell us what the landscape needs to accomplish. We’ll help you move from site conditions to dependable plant material.</p>
          </div>
        </div>
      </div>
    </header>
    <ContactUs />
  </>
);

export default Contact;
