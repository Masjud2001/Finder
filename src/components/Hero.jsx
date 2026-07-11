import React from "react";

function Hero({ onGetStartedClick }) {
  return (
    <section className="landing-hero" style={{ minHeight: "65vh" }}>
      <h1>Meet People Who Share Your Values</h1>
      <p style={{ margin: "24px auto 36px", padding: 0 }}>
        SoulSync helps you build genuine connections through compatibility, personality matches, shared lifestyles, and interactive conversations.
      </p>
      <button className="btn-primary-gradient" onClick={onGetS