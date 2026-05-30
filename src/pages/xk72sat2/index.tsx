import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../../services/supabase";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Redirect if already logged in as admin
  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        navigate("/zp9qpanel", { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  async function handleLogin(e: React.SyntheticEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    navigate("/zp9qpanel", { replace: true });
  }

  // Blank screen while checking session
  if (checking) {
    return <div style={{ minHeight: "100vh", background: "#0f172a" }} />;
  }

  return (
    <>
      <style>{`
        .admin-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
          padding: 16px;
        }

        .admin-card {
          background: #1e293b;
          padding: 40px;
          border-radius: 12px;
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        }

        .admin-title {
          color: #f1f5f9;
          margin: 0;
          font-size: 22px;
          text-align: center;
        }

        .admin-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .admin-label {
          color: #94a3b8;
          font-size: 13px;
        }

        .admin-input {
          padding: 10px 14px;
          border-radius: 8px;
          border: 1px solid #334155;
          background: #0f172a;
          color: #f1f5f9;
          font-size: 15px;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        .admin-input:focus {
          border-color: #1976d2;
        }

        .admin-button {
          padding: 12px;
          border-radius: 8px;
          border: none;
          background: #1976d2;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
          width: 100%;
          transition: background 0.2s;
        }

        .admin-button:hover:not(:disabled) {
          background: #1565c0;
        }

        .admin-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-error {
          color: #f87171;
          font-size: 13px;
          text-align: center;
          margin: 0;
        }

        @media (max-width: 480px) {
          .admin-card {
            padding: 28px 20px;
            border-radius: 10px;
            gap: 16px;
          }

          .admin-title {
            font-size: 19px;
          }

          .admin-input {
            font-size: 16px; /* prevents iOS zoom on focus */
            padding: 10px 12px;
          }

          .admin-button {
            font-size: 15px;
            padding: 13px;
          }
        }
      `}</style>

      <div className="admin-wrapper">
        <form onSubmit={handleLogin} className="admin-card">
          <h2 className="admin-title">Admin Access</h2>

          {error && <p className="admin-error">{error}</p>}

          <div className="admin-field">
            <label className="admin-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input"
              required
              autoComplete="email"
            />
          </div>

          <div className="admin-field">
            <label className="admin-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="admin-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </>
  );
}
