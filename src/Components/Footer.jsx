import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/header-logo.png';

const availabilityUrl = '/files/PEELS-Native-Plants-Availability.xlsx';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer premium-footer text-light">
      <div className="container">
        <div className="footer-project-callout">
          <div>
            <span className="footer-eyebrow">PROJECT SUPPORT</span>
            <h2>Planning a living landscape?</h2>
          </div>
          <Link to="/quote" className="btn btn-outline-light py-3 px-4">Start a project <i className="fa fa-arrow-right ms-3" aria-hidden="true"></i></Link>
        </div>

        <div className="footer-main-grid">
          <div className="footer-intro">
            <Link to="/" className="footer-brand" aria-label="PEELS Native Plants home">
              <img src={logo} alt="PEELS Native Plants" className="footer-logo" width="240" height="160" loading="lazy" decoding="async" />
            </Link>
            <p className="footer-positioning">Specialist native-plant growers for restoration, habitat renewal and resilient landscapes across British Columbia.</p>
          </div>

          <nav className="footer-nav" aria-label="Company links">
            <h3>Company</h3>
            <Link to="/about">About PEELS</Link>
            <Link to="/plants">Plant catalogue</Link>
            <Link to="/sales/information">Ordering</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/contact">Contact</Link>
          </nav>

          <nav className="footer-nav" aria-label="Planning resources">
            <h3>Project tools</h3>
            <Link to="/plant-advisor">Plant Advisor</Link>
            <Link to="/satellite-site-analysis">Site Analysis</Link>
            <Link to="/climate-resilience-selector">Climate Selector</Link>
            <a href={availabilityUrl} download>Availability list <i className="fa fa-download ms-2" aria-hidden="true"></i></a>
          </nav>

          <div className="footer-contact">
            <h3>Nursery</h3>
            <address>24095 65 Ave<br />Langley Township, BC<br />V2Y 2H1</address>
            <a href="tel:+16048328791">1-833-498-9898</a>
            <a href="mailto:info@peelsnativeplants.com">info@peelsnativeplants.com</a>
          </div>
        </div>

        <div className="footer-bottom-line">
          <p>© {currentYear} Peels Native Plants Ltd.</p>
          <p>PEELS · NATIVE PLANTS · BRITISH COLUMBIA</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
