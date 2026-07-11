import React from "react";

function Navbar({ onSignInClick }) {
  return (
    <nav className="landing-header">
      <div className="landing-logo">
        <span>❤️</span> SoulSync
      </div>
      <div className="landing-nav">
        <ul>
          <li><a href="#discover" onClick={(e) => e.preventDefault()}>Discover</a></li>
          <li><a href="#compatibility" onClick={(e) => e.preventDe