import React from 'react';
import type { Skill } from '../types';

const skills: Skill[] = [
  { name: 'React / Next.js', level: 5 },
  { name: 'TypeScript', level: 5 },
  { name: 'Node.js', level: 4 },
  { name: 'CSS / Tailwind', level: 5 },
  { name: 'PostgreSQL', level: 4 },
  { name: 'Docker / AWS', level: 3 },
  { name: 'Python', level: 3 },
  { name: 'Figma', level: 4 },
];

const Skills: React.FC = () => {
  return (
    <section id="skills" className="skills section">
      <div className="container">
        <h2 className="section-title">Skills & Tools</h2>
        <div className="skills-grid">
          {skills.map((skill) => (
            <div key={skill.name} className="skill-item">
              <div className="skill-header">
                <span className="skill-name">{skill.name}</span>
                <span className="skill-level">{skill.level}/5</span>
              </div>
              <div className="skill-bar">
                <div 
                  className="skill-fill" 
                  style={{ width: `${(skill.level / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;