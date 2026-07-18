import React from "react";

function Features() {
  return (
    <section className="features-section">
      <div className="feature-card" id="compatibility-section">
        <h3>❤️ Compatibility</h3>
        <p>Find people who share your values and lifestyle choices, moving beyond superficial swiping.</p>
      </div>

      <div className="feature-card">
        <h3>🔒 Privacy First</h3>
        <p>Control who sees your profile, toggle stealth mode, and block/report unwanted accounts easily.</p>
      </div>

      <div className="feature-card">
        <h3>🤖 AI Recommendation</h3>
        <p>Intelligent, interest-driven suggestions match you with profiles that align with your lifestyle tags.</p>
      </div>
    </section>
  );
}

export default Features;
