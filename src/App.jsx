import './App.css';

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">My Portfolio</div>
        <nav className="site-nav" aria-label="Primary navigation">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">Professional Media Services</p>
            <h1>Professional Media Services | Digital Advertising | Content Creation</h1>

            <p className="hero-description">
              I help brands grow with premium media strategy, digital advertising, content creation,
              and business promotion services designed for modern digital audiences.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="mailto:hello@yourbrand.com">
                Email Me
              </a>
              <a className="button button-secondary" href="#services">
                View Services
              </a>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-card">
              <span className="card-label">Media & Digital Services</span>
              <h2>Modern campaigns for smart businesses</h2>
              <p>
                Professional media services, advertising strategies, and content creation that help
                brands connect, convert, and perform on every channel.
              </p>
            </div>
          </div>
        </section>

        <section id="about" className="section section-light">
          <div className="section-content">
            <h2>About</h2>
            <p>
              I offer reliable media services, advertising, content creation, and business promotion
              for professionals and growing companies. My work is focused on clean messaging,
              fast delivery, and measurable performance.
            </p>
          </div>
        </section>

        <section id="services" className="section section-dark">
          <div className="section-content">
            <h2>Services</h2>
            <div className="service-grid">
              {[{
                title: 'Social Media Advertising',
                description: 'Targeted campaigns for Facebook, Instagram, and LinkedIn.'
              }, {
                title: 'Content Creation',
                description: 'Branded visuals, video, and copy that engage audiences.'
              }, {
                title: 'Media Reporting',
                description: 'Clear reporting with insights and performance highlights.'
              }, {
                title: 'Business Promotion',
                description: 'Promotional campaigns designed to grow your visibility and leads.'
              }].map((service) => (
                <article key={service.title} className="service-card">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section section-light">
          <div className="section-content contact-grid">
            <div>
              <h2>Contact</h2>
              <p>Phone: +211 XXX XXX XXX</p>
              <p>Email: hello@yourbrand.com</p>
            </div>

            <div className="contact-actions">
              <a className="button button-primary" href="mailto:hello@yourbrand.com">
                Send Email
              </a>
              <a className="button button-secondary" href="https://wa.me/211XXXXXXXXX" target="_blank" rel="noreferrer">
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        © 2026 My Portfolio. All Rights Reserved.
      </footer>

      <a
        className="whatsapp-button"
        href="https://wa.me/211XXXXXXXXX"
        target="_blank"
        rel="noreferrer"
        aria-label="Open WhatsApp chat"
      >
        <span className="whatsapp-icon">💬</span>
        WhatsApp
      </a>
    </div>
  );
}