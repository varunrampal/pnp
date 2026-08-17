import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from "../assets/images/header-logo.png";

const availabilityUrl = '/files/PEELS-Native-Plants-Availability.xlsx';

const NavBar = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light sticky-top premium-navbar">
          <div className="premium-navbar__inner">
            <Link to="/" className="navbar-brand" aria-label="PEELS Native Plants home"><img src={logo} alt="PEELS Native Plants" className="header-logo" width="240" height="160" decoding="async" /></Link>

            <button type="button" className="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarCollapse">
                <div className="navbar-nav ms-auto">
                    <NavLink to="/plants" className={({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`}>Plants</NavLink>
                    <a href="/#applications" className="nav-item nav-link">Applications</a>
                    <a href="/#expertise" className="nav-item nav-link">Expertise</a>
                    <div className="nav-item dropdown">
                        <button type="button" className="nav-link dropdown-toggle border-0 bg-transparent" data-bs-toggle="dropdown" aria-expanded="false">Resources</button>
                        <div className="dropdown-menu bg-light m-0">
                            <Link to="/plant-advisor" className="dropdown-item">Plant Advisor <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>
                            <Link to="/satellite-site-analysis" className="dropdown-item">Site Analysis</Link>
                            <Link to="/climate-resilience-selector" className="dropdown-item">Climate Selector</Link>
                            <Link to="/sales/information" className="dropdown-item">Ordering Information</Link>
                            <Link to="/faq" className="dropdown-item">FAQ</Link>
                        </div>
                    </div>
                    <NavLink to="/about" state={{ hiddenParam: 'nobtn' }} className={({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`}>About</NavLink>
                    <NavLink to="/contact" className={({ isActive }) => `nav-item nav-link${isActive ? ' active' : ''}`}>Contact</NavLink>
                </div>
                <div className="nav-actions">
                    <a href={availabilityUrl} download className="nav-availability">Availability <i className="fa fa-download" aria-hidden="true"></i></a>
                    <Link to="/quote" className="nav-quote">Get a quote <i className="fa fa-arrow-right" aria-hidden="true"></i></Link>
                </div>

            </div>
          </div>
        </nav>
    )
}

export default NavBar
