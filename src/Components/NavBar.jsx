import React from 'react'
import { Link } from 'react-router-dom';
import logo from "../assets/images/header-logo.png";
const NavBar = () => {
  return (
    <nav class="navbar navbar-expand-lg bg-white navbar-light sticky-top p-0">
    <a href="index.html" class="navbar-brand d-flex align-items-center px-4 px-lg-5">
        {/* <h1 class="m-0">Gardener</h1> */}
          <img src={logo} alt="Peels Native Plants" className="header-logo" />
    </a>
    <button type="button" class="navbar-toggler me-4" data-bs-toggle="collapse" data-bs-target="#navbarCollapse">
        <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarCollapse">
        <div class="navbar-nav ms-auto p-4 p-lg-0">
           <Link to="/" class="nav-item nav-link">Home</Link>
           <Link to="/about" class="nav-item nav-link">About</Link>

           {/* <Link to={{
      pathname: '/about',
      state: { hiddenParam: 'page' }
    }} class="nav-item nav-link">About</Link> */}

            <a href="service.html" class="nav-item nav-link">Plants</a>
                    <div class="nav-item dropdown">
                <a href="#" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">Sales</a>
                <div class="dropdown-menu bg-light m-0">
                    <Link to="sales/information" class="nav-item nav-link">Information</Link>
                
                </div>
            </div>
            <Link to="/contact" class="nav-item nav-link">Contact</Link>
        </div>
        <a href="" class="btn btn-primary py-4 px-lg-4 rounded-0 d-none d-lg-block">Get A Quote<i class="fa fa-arrow-right ms-3"></i></a>
    </div>
</nav>
  )
}

export default NavBar