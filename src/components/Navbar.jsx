import React from "react";

function Navbar({ onSignInClick }) {
  return (
    <nav className="landing-header">
      <div className="landing-logo">
        <span>❤️</span> what's Left
      </div>
      <div className="landing-nav">
        <ul>
          <li><a href="#discover" onClick={(e) => e.preventDefault()}>Discover</a></li>
          <li><a href="#compatibility" onClick={(e) => e.preventDefault()}>Compatibility</a></li>
          <li><a href="#safety" onClick={(e) => e.preventDefault()}>Safety</a></li>
          <li><a href="#premium" onClick={(e) => e.preventDefault()}>Premium</a></li>
        </ul>
      </div>
      <button className="btn-landing-login" onClick={onSignInClick}>
        Sign In
      </button>
    </nav>
  );
}

export default Navbar;
