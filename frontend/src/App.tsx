import { BrowserRouter, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';
import ProjectAdmin from './components/ProjectAdmin';
import './App.css';

function AppContent() {
  const location = useLocation();

  // When URL is /admin, render ONLY the admin panel — no navbar, no footer, nothing else
  if (location.pathname === '/admin') {
    return <ProjectAdmin />;
  }

  // Normal portfolio site
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <footer className="footer">
        <p>© {new Date().getFullYear()} Alex Developer. Built with React & TypeScript.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;