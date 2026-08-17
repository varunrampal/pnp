import React, { useRef, useState } from 'react';
import ReactJsAlert from 'reactjs-alert';

const MAX_ATTACHMENT_BYTES = 2.5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = '.xlsx,.xls,.csv,.pdf,.doc,.docx,.jpg,.jpeg,.png';

const fileToBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1]);
  reader.onerror = () => reject(new Error('The selected file could not be read.'));
  reader.readAsDataURL(file);
});

const Quote = () => {
  const form = useRef();
  const [status, setStatus] = useState(false);
  const [type, setType] = useState('success');
  const [title, setTitle] = useState('Thank you. We will review your request and follow up shortly.');
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState(null);

  const showMessage = (message, messageType = 'error') => {
    setType(messageType);
    setTitle(message);
    setStatus(true);
  };

  const selectAttachment = event => {
    const file = event.target.files?.[0];
    if (!file) {
      setAttachment(null);
      return;
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      event.target.value = '';
      setAttachment(null);
      showMessage('Please choose a file smaller than 2.5 MB.');
      return;
    }
    setAttachment(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    const input = form.current?.elements?.plantListFile;
    if (input) input.value = '';
  };

  const sendEmail = async event => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const plantList = String(data.get('message') || '').trim();
    if (!plantList && !attachment) {
      showMessage('Enter your plant requirements or attach a plant list.');
      return;
    }

    setIsSending(true);
    try {
      const encodedAttachment = attachment ? {
        name: attachment.name,
        contentType: attachment.type || 'application/octet-stream',
        contentBytes: await fileToBase64(attachment),
        size: attachment.size,
      } : null;
      const response = await fetch('/api/quote-resend.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: data.get('cname'), fullName: data.get('name'), email: data.get('email'),
          phone: data.get('phone'), location: data.get('project_location'), requiredBy: data.get('required_timing'),
          plantList, website: data.get('website'), attachment: encodedAttachment,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.error || 'Your request could not be sent. Please try again.');
      form.current?.reset();
      setAttachment(null);
      setType('success');
      setTitle('Thank you. We will review your request and follow up shortly.');
      setStatus(true);
    } catch (error) {
      console.error('Quote request submission failed', error);
      showMessage(error.message || 'Your request could not be sent. Please try again or contact the nursery directly.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="quote-experience">
      <section className="quote-section" aria-labelledby="quote-form-title">
        <div className="container">
          <div className="quote-intro">
            <div><p className="editorial-kicker">WHOLESALE PLANT MATERIAL</p><h2 id="quote-form-title">Tell us what your project needs.</h2></div>
            <p>Share your species, quantities, sizes and timing. If your plant list is still taking shape, send what you know and our nursery team can help refine it.</p>
          </div>

          <div className="quote-layout">
            <form className="quote-form" ref={form} onSubmit={sendEmail}>
              <input className="quote-honeypot" type="text" name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" />
              <div className="quote-form-heading"><span>01</span><div><h3>Contact details</h3><p>Fields marked with * are required.</p></div></div>
              <div className="row g-4">
                <div className="col-md-6"><label htmlFor="quote-company">Company or organization</label><input type="text" className="form-control" id="quote-company" name="cname" autoComplete="organization" /></div>
                <div className="col-md-6"><label htmlFor="quote-name">Full name *</label><input required type="text" className="form-control" id="quote-name" name="name" autoComplete="name" /></div>
                <div className="col-md-6"><label htmlFor="quote-email">Email *</label><input required type="email" className="form-control" id="quote-email" name="email" autoComplete="email" /></div>
                <div className="col-md-6"><label htmlFor="quote-phone">Phone</label><input type="tel" className="form-control" id="quote-phone" name="phone" autoComplete="tel" inputMode="tel" /></div>
              </div>

              <div className="quote-form-heading quote-form-heading--project"><span>02</span><div><h3>Project requirements</h3><p>Approximate information is welcome.</p></div></div>
              <div className="row g-4">
                <div className="col-md-6"><label htmlFor="quote-location">Project location</label><input type="text" className="form-control" id="quote-location" name="project_location" placeholder="City or region" /></div>
                <div className="col-md-6"><label htmlFor="quote-timing">Required timing</label><input type="text" className="form-control" id="quote-timing" name="required_timing" placeholder="Season, month or date" /></div>
                <div className="col-12"><label htmlFor="quote-message">Plant list and project notes</label><textarea className="form-control" id="quote-message" name="message" rows="8" placeholder={'Example:\n20 × Red-osier dogwood — #1 container\n50 × Sitka willow — live stakes\nDelivery required in Langley, September'}></textarea><p className="quote-field-help">Enter your requirements here or attach an existing plant list below.</p></div>
                <div className="col-12"><div className="quote-upload"><div><label htmlFor="quote-attachment">Attach a plant list</label><p>Excel, CSV, PDF, Word, JPG or PNG — maximum 2.5 MB.</p></div><label className="quote-upload-button" htmlFor="quote-attachment"><i className="fa fa-paperclip" aria-hidden="true"></i> Choose file</label><input id="quote-attachment" name="plantListFile" type="file" accept={ACCEPTED_FILE_TYPES} onChange={selectAttachment} />{attachment && <div className="quote-selected-file" aria-live="polite"><i className="fa fa-file-o" aria-hidden="true"></i><span>{attachment.name} <small>({(attachment.size / 1024).toFixed(0)} KB)</small></span><button type="button" onClick={removeAttachment} aria-label={`Remove ${attachment.name}`}>Remove</button></div>}</div></div>
                <div className="col-12 quote-submit-row"><button className="btn btn-primary py-3 px-4" type="submit" disabled={isSending} aria-busy={isSending}>{isSending ? 'Sending request…' : 'Request a quote'} <i className="fa fa-arrow-right ms-3" aria-hidden="true"></i></button><span>We respond during nursery business hours.</span></div>
              </div>
            </form>

            <aside className="quote-guide" aria-label="What happens next">
              <p className="editorial-kicker">WHAT HAPPENS NEXT</p><h3>A practical response from the nursery.</h3>
              <ol>
                <li><span>01</span><div><strong>We review your list</strong><p>We check availability, suitable formats and project timing.</p></div></li>
                <li><span>02</span><div><strong>We clarify the details</strong><p>If needed, we will contact you about substitutions, delivery or lead times.</p></div></li>
                <li><span>03</span><div><strong>You receive a quote</strong><p>We provide pricing and the next steps for confirming your order.</p></div></li>
              </ol>
              <div className="quote-direct"><span>PREFER TO TALK?</span><a href="tel:+16048328791">1-833-498-9898</a><a href="mailto:info@peelsnativeplants.com">info@peelsnativeplants.com</a></div>
            </aside>
          </div>
        </div>
      </section>
      <ReactJsAlert status={status} type={type} title={title} Close={() => setStatus(false)} />
    </main>
  );
};

export default Quote;
