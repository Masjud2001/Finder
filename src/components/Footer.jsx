import React from "react";

function Footer() {
  return (
    <footer className="landing-footer">
      <p>© 2026 what's Left, Inc. All rights reserved.</p>
      <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginTop: "12px", fontSize: "12px" }}>
        <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: "var(--text-gray)", textDecoration: "none" }}>Privacy</a>
        <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: "var(--text-gray)", textDecoration: "none" }}>Terms</a>
        <a href="#cookie" onClick={(e) => e.preventDefault()} style={{ color: "var(--text-gray)", textDecoration: "none" }}>Cookie Policy</a>
        <a href="#safety" onClick={(e) => e.preventDefault()} style={{ color: "var(--text-gray)", textDecoration: "none" }}>Safety Centre</a>
      </div>
    </footer>
  );
}

export default Footer;
