import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="about section">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        <div className="about-grid">
          <div className="about-image">
            <div className="image-placeholder">
              <span>Your Photo</span>
            </div>
          </div>
          <div className="about-text">
            <p>
              I'm a passionate developer with 5+ years of experience crafting 
              digital products. I specialize in React, TypeScript, and Node.js 
              ecosystems.
            </p>
            <p>
              When I'm not coding, you'll find me exploring new design patterns, 
              contributing to open source, or hiking with my camera.
            </p>
            <div className="about-stats">
              <div className="stat">
                <span className="stat-number">5+</span>
                <span className="stat-label">Years Experience</span>
              </div>
              <div className="stat">
                <span className="stat-number">40+</span>
                <span className="stat-label">Projects Completed</span>
              </div>
              <div className="stat">
                <span className="stat-number">20+</span>
                <span className="stat-label">Happy Clients</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;