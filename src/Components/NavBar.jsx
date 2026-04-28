import React from 'react'
import { Link } from 'react-router-dom';
import logo from "../assets/images/header-logo.png";

const availabilityUrl = '/files/PNP_Availability_List.xlsx';

const NavBar = () => {
    return (
        <nav class="navbar navbar-expand-lg bg-white navbar-light sticky-top p-2">
            <Link to="/" class="navbar-brand d-flex align-items-center px-4 px-lg-5"><img src={logo} alt="Peels Native Plants Ltd." className="header-logo" width="103" height="104" decoding="async" /></Link>

            <button type="button" class="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarCollapse">
                <div class="navbar-nav ms-auto p-4 p-lg-0">
                    <Link to="/" class="nav-item nav-link">Home</Link>

                    <Link to={"/about"} state={{ hiddenParam: 'nobtn' }} class="nav-item nav-link">About</Link>

                    <Link to="/plants" class="nav-item nav-link">Plants</Link>
                     {/* <Link to="/plantstest" class="nav-item nav-link">PlantsTest</Link> */}
                      {/* <Link to="/dragdrop" class="nav-item nav-link">DragDrop</Link> */}

                    <div class="nav-item dropdown">
                        <button type="button" class="nav-link dropdown-toggle border-0 bg-transparent" data-bs-toggle="dropdown" aria-expanded="false">Sales</button>
                        <div class="dropdown-menu bg-light m-0">
                            <Link to="/sales/information" class="dropdown-item">Information</Link>

                        </div>
                    </div>

                    {/* <Link to="" class="nav-item nav-link" onClick={handleDownload}>Availability</Link> */}
                    <Link to="/faq" class="nav-item nav-link">FAQ</Link>
                    <Link to="/contact" class="nav-item nav-link">Contact</Link>
                    <Link to="/admin" class="nav-item nav-link">Admin</Link>
                </div>
                <a href={availabilityUrl} download class="btn btn-primary py-4 px-lg-4 rounded-0 d-none d-lg-block" style={{ marginRight: '2px' }}>Availability<i class="fa fa-download ms-3"></i></a>
                <Link to="/quote" class="btn btn-primary py-4 px-lg-4 rounded-0 d-none d-lg-block">Get A Quote <i class="fa fa-arrow-right ms-3"></i></Link>

            </div>
        </nav>
    )
}

export default NavBar
