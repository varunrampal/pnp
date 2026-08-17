import React, { useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import ReactJsAlert from 'reactjs-alert';

const ContactUs = () => {
  const form = useRef();
  const [status, setStatus] = useState(false);
  const [type, setType] = useState('success');
  const [title, setTitle] = useState('Thank you. Our team will respond as soon as possible.');
  const [isSending, setIsSending] = useState(false);

  const sendEmail = async event => {
    event.preventDefault();
    setIsSending(true);
    try {
      await emailjs.sendForm('service_9wwh682', 'template_btoua8k', form.current, { publicKey: 'LjissUB9pujYt6oa7' });
      form.current?.reset();
      setType('success');
      setTitle('Thank you. Our team will respond as soon as possible.');
      setStatus(true);
    } catch (error) {
      console.error('Contact form submission failed', error);
      setType('error');
      setTitle('Your message could not be sent. Please call or email the nursery directly.');
      setStatus(true);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="contact-premium">
      <section className="contact-enquiry editorial-section" aria-labelledby="contact-form-title">
        <div className="container">
          <div className="contact-layout">
            <div className="contact-form-panel">
              <p className="editorial-kicker">TELL US ABOUT THE WORK</p>
              <h2 id="contact-form-title">Project enquiry</h2>
              <p className="contact-form-intro">Share the project location, site conditions, timing and approximate quantities. The more context you provide, the more useful our first response can be.</p>
              <form ref={form} onSubmit={sendEmail}>
                <div className="row g-4">
                  <div className="col-md-6"><label htmlFor="contact-name">Name</label><input required type="text" className="form-control" id="contact-name" name="name" autoComplete="name" /></div>
                  <div className="col-md-6"><label htmlFor="contact-organization">Organization</label><input type="text" className="form-control" id="contact-organization" name="organization" autoComplete="organization" /></div>
                  <div className="col-md-6"><label htmlFor="contact-email">Email</label><input required type="email" className="form-control" id="contact-email" name="email" autoComplete="email" /></div>
                  <div className="col-md-6"><label htmlFor="contact-phone">Phone</label><input type="tel" className="form-control" id="contact-phone" name="phone" autoComplete="tel" /></div>
                  <div className="col-md-6"><label htmlFor="contact-project-type">Project type</label><select className="form-select" id="contact-project-type" name="project_type" defaultValue=""><option value="" disabled>Select an application</option><option>Riparian restoration</option><option>Wetland or stormwater</option><option>Habitat enhancement</option><option>Municipal landscape</option><option>Mitigation or reclamation</option><option>Other</option></select></div>
                  <div className="col-md-6"><label htmlFor="contact-location">Project location</label><input type="text" className="form-control" id="contact-location" name="project_location" placeholder="City or region" /></div>
                  <div className="col-12"><label htmlFor="contact-message">Project details</label><textarea required className="form-control" id="contact-message" name="message" rows="7" placeholder="Site conditions, species, quantities, schedule, delivery requirements…"></textarea></div>
                  <div className="col-12 contact-submit-row"><button className="btn btn-primary py-3 px-4" type="submit" disabled={isSending}>{isSending ? 'Sending…' : 'Send project enquiry'} <i className="fa fa-arrow-right ms-3" aria-hidden="true"></i></button><span>We typically respond during nursery business hours.</span></div>
                </div>
              </form>
            </div>

            <aside className="contact-direct" aria-label="Direct contact details">
              <p className="editorial-kicker">DIRECT CONTACT</p>
              <h2>Talk to the nursery.</h2>
              <a href="tel:+16048328791" className="contact-method"><span>PHONE</span><strong>1-833-498-9898</strong></a>
              <a href="mailto:info@peelsnativeplants.com" className="contact-method"><span>EMAIL</span><strong>info@peelsnativeplants.com</strong></a>
              <div className="contact-method"><span>NURSERY</span><address>24095 65 Ave<br />Langley Township, BC<br />V2Y 2H1</address></div>
              <div className="contact-preparation"><span>HELP US PREPARE</span><ul><li>Project location and schedule</li><li>Known site conditions</li><li>Species or planting objectives</li><li>Estimated quantities and formats</li></ul></div>
            </aside>
          </div>
        </div>
      </section>

      <section className="contact-location-section" aria-labelledby="visit-title">
        <div className="container">
          <div className="contact-location-grid">
            <div className="contact-page-map"><iframe title="PEELS Native Plants nursery location" src="https://www.google.com/maps?q=24095+65+Ave,+Langley+Twp,+BC,+V2Y+2H1&amp;output=embed" width="100%" height="320" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe></div>
            <div className="contact-visit-copy"><p className="editorial-kicker">LANGLEY TOWNSHIP · BC</p><h2 id="visit-title">Visiting PEELS</h2><p>Please contact the nursery before arriving. We’ll confirm access and make sure the right team member is available to discuss your plant or project requirements.</p><a className="editorial-link" href="https://www.google.com/maps/search/?api=1&query=24095+65+Ave+Langley+BC+V2Y+2H1" target="_blank" rel="noreferrer">Get directions <i className="fa fa-arrow-up" aria-hidden="true"></i></a></div>
          </div>
        </div>
      </section>

      <ReactJsAlert status={status} type={type} title={title} Close={() => setStatus(false)} />
    </main>
  );
};

export default ContactUs;
