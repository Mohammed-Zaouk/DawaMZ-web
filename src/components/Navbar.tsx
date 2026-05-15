import { Link } from "react-router-dom";
import { useTheme } from "../context/theme/useTheme";
import logo from "../assets/logo.png";
import styles from "../styles/components-style/Navbar.module.css";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <nav className={styles.nav}>
      {/* Logo */}
      <Link to="/" className={styles.brand}>
        <img src={logo} alt="Dawamz logo" className={styles.logo} />
        <span className={styles.brandText}>
          Dawa<span className={styles.accent}>mz</span>
        </span>
      </Link>

      {/* Right side */}
      <div className={styles.right}>

        {/* Theme switch */}
        <button
          onClick={toggleTheme}
          className={styles.themeToggle}
          aria-label="Toggle theme"
        >
          <span className={`${styles.switchTrack} ${isDark ? styles.switchTrackDark : ""}`}>
            <span className={`${styles.switchThumb} ${isDark ? styles.switchThumbDark : ""}`}>
              <i className={isDark ? "ion-ios-moon" : "ion-ios-sunny"} />
            </span>
          </span>
        </button>

        {/* Nav links */}
        <div className={styles.links}>
          <Link to="/" className={styles.link}>
            <i className="ion-ios-home" />
            <span>Home</span>
          </Link>
          <Link to="/about" className={styles.link}>
            <i className="ion-ios-information-circle" />
            <span>About</span>
          </Link>
          <Link to="/contact" className={styles.link}>
            <i className="ion-ios-mail" />
            <span>Contact</span>
          </Link>
        </div>

      </div>
    </nav>
  );
}