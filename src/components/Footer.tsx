export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <strong>NISQ VANGUARD</strong>
            <span>DEFENCE TECHNOLOGIES</span>
          </div>

          <p>
            Educate. Assess. Defend.
          </p>
        </div>

        <div>
          <h3>Explore</h3>
          <a href="/solutions">Solutions</a>
          <a href="/campus">Campus</a>
          <a href="/academy">Academy</a>
          <a href="/innovation">Innovation</a>
        </div>

        <div>
          <h3>Company</h3>
          <a href="/about">About</a>
          <a href="/intelligence">Intelligence</a>
          <a href="/case-studies">Case Studies</a>
          <a href="/contact">Contact</a>
        </div>

        <div>
          <h3>Legal</h3>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/security">Security</a>
          <a href="/responsible-disclosure">Responsible Disclosure</a>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} NISQ Vanguard – Defence Technologies.</span>
        <span>Educate. Assess. Defend.</span>
      </div>
    </footer>
  );
}