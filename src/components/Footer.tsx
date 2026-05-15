import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import styles from "../styles/components-style/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <img src={logo} alt="Dawamz logo" className={styles.logo} />
          <span className={styles.brandText}>
            Dawa<span className={styles.accent}>mz</span>
          </span>
        </div>
        <p className={styles.tagline}>Find open pharmacies near you, anytime.</p>
      </div>

      <div className={styles.divider} />

      <div className={styles.bottom}>
        <p className={styles.copy}>© {new Date().getFullYear()} Dawamz. All rights reserved.</p>
        <div className={styles.footerLinks}>
          <Link to="/about" className={styles.footerLink}>About</Link>
          <Link to="/contact" className={styles.footerLink}>Contact</Link>
        </div>
      </div>
    </footer>
  );
}