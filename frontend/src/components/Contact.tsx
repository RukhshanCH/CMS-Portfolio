import { useState, type JSX } from 'react';
import type { Contact } from '../utils/supabase';
import {
  FaEnvelope,
  FaLinkedin,
  FaPhone,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaReddit,
  FaGithub,
  FaTwitter,
  FaYoutube,
  FaDribbble,
} from 'react-icons/fa';

interface ContactProps {
  data?: Contact | null;
}

export default function Contact({ data }: ContactProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(form_success_message);
    setFormData({ name: '', email: '', message: '' });
  };

  // Destructure with defaults — TypeScript now knows every property
  const {
    heading = 'Get In Touch',
    description = "Have a project in mind? Let's work together.",
    email,
    phone,
    location,
    whatsapp_number,
    whatsapp_message = 'Hello!',
    form_enabled = true,
    form_success_message,
    linkedin_url,
    github_url,
    twitter_url,
    instagram_url,
    facebook_url,
    reddit_url,
    youtube_url,
    dribbble_url,
    behance_url,
  } = data || {};

  const whatsappNumber = whatsapp_number ? String(whatsapp_number) : undefined;
  const whatsappMsg = String(whatsapp_message);

  const socials = [
    { url: linkedin_url, icon: <FaLinkedin size={20} />, label: 'LinkedIn' },
    { url: github_url, icon: <FaGithub size={20} />, label: 'GitHub' },
    { url: twitter_url, icon: <FaTwitter size={20} />, label: 'Twitter' },
    { url: instagram_url, icon: <FaInstagram size={20} />, label: 'Instagram' },
    { url: facebook_url, icon: <FaFacebook size={20} />, label: 'Facebook' },
    { url: reddit_url, icon: <FaReddit size={20} />, label: 'Reddit' },
    { url: youtube_url, icon: <FaYoutube size={20} />, label: 'YouTube' },
    { url: dribbble_url, icon: <FaDribbble size={20} />, label: 'Dribbble' },
    { url: behance_url, icon: <FaDribbble size={20} />, label: 'Behance' },
    {
      url: whatsappNumber
        ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMsg)}`
        : undefined,
      icon: <FaWhatsapp size={20} />,
      label: 'WhatsApp',
    },
  ].filter((s): s is { url: string; icon: JSX.Element; label: string } => !!s.url);

  return (
    <section id="contact" className="contact section">
      <div className="container">
        <h2 className="section-title">{String(heading)}</h2>
        <div className="contact-grid">
          <div className="contact-info">
            <h3>{String(description)}</h3>

            <div className="contact-details">
              {email && (
                <a href={`mailto:${String(email)}`} className="contact-detail">
                  <FaEnvelope size={16} />
                  <span>{String(email)}</span>
                </a>
              )}
              {phone && (
                <a href={`tel:${String(phone)}`} className="contact-detail">
                  <FaPhone size={16} />
                  <span>{String(phone)}</span>
                </a>
              )}
              {location && (
                <span className="contact-detail">
                  <FaMapMarkerAlt size={16} />
                  <span>{String(location)}</span>
                </span>
              )}
            </div>

            {socials.length > 0 && (
              <div className="social-links">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {form_enabled !== false && (
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell me about your project..."
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}