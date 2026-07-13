import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-greeting">Hello, I'm</p>
        <h1 className="hero-title">Alex Developer</h1>
        <p className="hero-subtitle">
          Full-stack engineer building clean, performant web experiences
        </p>
        <div className="hero-buttons">
          <a href="#projects" className="btn btn-primary">View Work</a>
          <a href="#contact" className="btn btn-secondary">Contact Me</a>
        </div>
      </div>
      <div className="hero-scroll">
        <span></span>
      </div>
    </section>
  );
};

export default Hero;