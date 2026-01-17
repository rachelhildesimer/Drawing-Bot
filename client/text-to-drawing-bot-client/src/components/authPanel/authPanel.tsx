import { useState, useMemo } from "react";
import { login, register } from "../../services/api";
import "./AuthPanel.css";

type Props = {
  onAuthed: () => void;
};

export function AuthPanel({ onAuthed }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEmailValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, [email]);

  const isPasswordValid = useMemo(() => {
    return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/.test(password);
  }, [password]);

  async function handleLogin() {
    if (!isEmailValid || !isPasswordValid) {
      setError("נא למלא פרטים תקינים");
      return;
    }
    submitAction(login);
  }

  async function handleRegister() {
    if (!isEmailValid || !isPasswordValid) {
      setError("נא למלא פרטים תקינים");
      return;
    }
    submitAction(register);
  }

  async function submitAction(apiFunc: Function) {
    setError(null);
    setLoading(true);
    try {
      const { token } = await apiFunc(email, password);
      localStorage.setItem("token", token);
      onAuthed();
    } catch (e: any) {
      setError(e?.message ?? "הפעולה נכשלה");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <h3 className="auth-title">Login / Register</h3>
      
      <div className="auth-input-group">
        <div className="field-group">
          <input
            className={`auth-input ${email && !isEmailValid ? "input-error" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
            type="email"
          />
          {email && !isEmailValid && (
            <div className="validation-hint hint-invalid">כתובת מייל לא תקינה</div>
          )}
        </div>

        <div className="field-group">
          <input
            className={`auth-input ${password && !isPasswordValid ? "input-error" : ""}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            type="password"
          />
          {password && !isPasswordValid && (
            <div className="validation-hint hint-invalid">
              הסיסמה צריכה 6 תווים, אותיות ומספרים
            </div>
          )}
        </div>

        <div className="auth-button-group">
          <button 
            className="auth-btn btn-login" 
            onClick={handleLogin} 
            disabled={loading || !isEmailValid || !isPasswordValid}
          >
            {loading ? "..." : "Login"}
          </button>
          <button 
            className="auth-btn btn-register" 
            onClick={handleRegister} 
            disabled={loading || !isEmailValid || !isPasswordValid}
          >
            {loading ? "..." : "Register"}
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-footer-text">
        </div>
      </div>
    </div>
  );
}