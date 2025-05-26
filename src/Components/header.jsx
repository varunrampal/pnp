import { Link } from 'react-router-dom';
import "../main.css"; // Ensure you have global styles
import logo from "../assets/images/header-logo.png"; // Update path if using public folder

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        
           <Link to="/" class="nav-item nav-link"><img src={logo} alt="Peels Native Plants" className="header-logo" /></Link>
        {/* Navigation Menu */}
        <nav className="nav-menu">
          <ul>
            <li><a href="#">Home</a></li>
            <li><a href="#">Plants</a></li>
            <li><a href="#">Quote</a></li>
            <li><a href="#">Sales</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
