"use client";

import { useState } from "react";
import { createAuthClient } from "@/lib/supabase/auth-client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createAuthClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-logo">
            <span className="logo-bdgs">BDGS</span>{" "}
            <span className="logo-radar">Client Radar</span>
          </h1>
          <p className="login-subtitle">Plateforme de veille financière</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p className="login-footer">
          Accès réservé aux membres de BDGS Associés
        </p>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #F8F9FA;
          padding: 1rem;
        }
        .login-card {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 2.5rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-logo {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }
        .logo-bdgs {
          color: #1E3A5F;
        }
        .logo-radar {
          color: #6B7280;
          font-weight: 400;
        }
        .login-subtitle {
          color: #6B7280;
          font-size: 0.875rem;
          margin: 0;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }
        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #1A1A2E;
        }
        .form-group input {
          padding: 0.625rem 0.75rem;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s;
        }
        .form-group input:focus {
          border-color: #1E3A5F;
          box-shadow: 0 0 0 3px rgba(30, 58, 95, 0.1);
        }
        .login-error {
          background: #FEF2F2;
          color: #DC2626;
          padding: 0.625rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8125rem;
          border: 1px solid #FECACA;
        }
        .login-button {
          background: #1E3A5F;
          color: #FFFFFF;
          border: none;
          padding: 0.625rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.15s;
        }
        .login-button:hover:not(:disabled) {
          background: #162d4a;
        }
        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .login-footer {
          text-align: center;
          font-size: 0.75rem;
          color: #9CA3AF;
          margin: 1.5rem 0 0;
        }
      `}</style>
    </div>
  );
}
