import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  changePassword,
  requestPasswordReset,
  requestOneTimeCode,
  resetPassword,
  signIn,
  signUp,
  verifyOneTimeCode,
} from "../../store/hrmSlice.js";
import "./auth.css";

const pageContent = {
  login: {
    title:"Sign In",
    description:"Welcome back — sign in to your workspace.",
    submit:"Sign In",
  },
  signup: {
    title:"Create your account",
    description:"Set up your AdblissHRM workspace account.",
    submit:"Create Account",
  },
  forgot: {
    title:"Forgot password?",
    description:"Enter your work email and we'll help you get back in.",
    submit:"Send reset link",
  },
  reset: {
    title:"Set a new password",
    description:"Choose a new password for your account.",
    submit:"Reset Password",
  },
  change: {
    title:"Change Password",
    description:"Choose a new password to keep your account secure.",
    submit:"Save New Password",
  },
};

function AuthBrand() {
  return (
    <Link to="/login" className="auth-brand" aria-label="AdblissHRM sign in">
      ADBLISSHRM
    </Link>
  );
}

function FormField({ id, label, icon, type = "text", value, onChange, suffix, ...props }) {
  return (
    <div className="auth-field">
      <span className="auth-field-icon" aria-hidden="true">{icon}</span>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        autoComplete={props.autoComplete}
        required={props.required !== false}
        minLength={props.minLength}
      />
      {suffix}
    </div>
  );
}

export default function AuthPage({ mode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const user = useSelector((state) => state.hrm.auth.user);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [resetToken, setResetToken] = useState(searchParams.get("token") || "");
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(location.state?.message || "");
  const [developmentResetLink, setDevelopmentResetLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const content = pageContent[mode];
  const passwordEye = (fieldLabel) => (
    <button
      className="auth-eye-button"
      type="button"
      onClick={() => setShowPassword((value) => !value)}
      aria-label={`${showPassword ? "Hide" : "Show"} ${fieldLabel}`}
      title={`${showPassword ? "Hide" : "Show"} password`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {showPassword
          ? <><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>
          : <><path d="m3 3 18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c6.1 0 9.5 6 9.5 6a16 16 0 0 1-3.1 3.6M6.2 6.6C3.8 8.1 2.5 12 2.5 12s3.4 6 9.5 6c1.2 0 2.3-.3 3.3-.7" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>}
      </svg>
    </button>
  );

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (["signup", "reset", "change"].includes(mode) && password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await dispatch(otpRequested
          ? verifyOneTimeCode({ email, code:otpCode })
          : signIn({ email, password })).unwrap();
        navigate(location.state?.from?.pathname || "/", { replace:true });
      } else if (mode === "signup") {
        await dispatch(signUp({ name, email, password })).unwrap();
        navigate("/", { replace:true });
      } else if (mode === "forgot") {
        const result = await dispatch(requestPasswordReset(email)).unwrap();
        setSuccess(result.message);
        if (result.resetToken) {
          const resetUrl = `/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(result.resetToken)}`;
          setDevelopmentResetLink(resetUrl);
        }
      } else if (mode === "reset") {
        await dispatch(resetPassword({ email, resetToken, password })).unwrap();
        navigate("/login", {
          replace:true,
          state:{ message:"Your password has been reset. Sign in with your new password." },
        });
      } else if (mode === "change") {
        const result = await dispatch(changePassword({ currentPassword, newPassword:password })).unwrap();
        setSuccess(result.message);
        setPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      }
    } catch (requestError) {
      setError(requestError.message || "We couldn't complete your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await dispatch(requestOneTimeCode(email)).unwrap();
      setOtpRequested(true);
      setOtpCode(result.code || "");
      setSuccess(result.message);
    } catch (requestError) {
      setError(requestError.message || "We couldn't send a sign-in code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-story">
        <AuthBrand />
        <div className="auth-story-content">
          <h1>{mode === "login" ? "Welcome back" : "People, made simple."}</h1>
          <p>Payroll, attendance, and compliance —<br />all synced and ready for you.</p>
          <div className="auth-feature">
            <span className="auth-feature-icon" aria-hidden="true">👁️</span>
            <div>
              <small>ADBLISSHRM</small>
              <strong>AI Face Recognition Attendance</strong>
              <span>Face / Mobile / Geo tracking</span>
            </div>
          </div>
          <div className="auth-feature-dots" aria-hidden="true"><i /><i /><i /></div>
        </div>
      </section>

      <section className="auth-form-side">
        <div className="auth-card">
          <header className="auth-card-heading">
            <div>
              <h2>{content.title}</h2>
              {(mode === "login" || mode === "signup") && (
                <p>{content.description}</p>
              )}
            </div>
            {(mode === "login" || mode === "signup") && (
              <div className="auth-switch">
                <span>{mode === "login" ? "New to AdblissHRM?" : "Already have an account?"}</span>
                <Link to={mode === "login" ? "/signup" : "/login"}>
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </Link>
              </div>
            )}
          </header>
          {mode !== "login" && mode !== "signup" && (
            <p className="auth-card-description">{content.description}</p>
          )}

          <form className="auth-form" onSubmit={submit}>
            {mode === "signup" && (
              <FormField
                id="signup-name"
                label="Full name"
                icon="♙"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            )}
            {mode !== "change" && (
              <FormField
                id={`${mode}-email`}
                label="Work email"
                icon="♙"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            )}
            {mode === "reset" && (
              <FormField
                id="reset-token"
                label="Password reset token"
                icon="⌑"
                value={resetToken}
                onChange={(event) => setResetToken(event.target.value)}
                autoComplete="one-time-code"
              />
            )}
            {mode === "login" && otpRequested && (
              <FormField
                id="login-otp"
                label="Six-digit sign-in code"
                icon="⌑"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                autoComplete="one-time-code"
              />
            )}
            {mode === "change" && (
              <FormField
                id="current-password"
                label="Current password"
                icon="♙"
                type={showPassword ? "text" : "password"}
                suffix={passwordEye("current password")}
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
              />
            )}
            {["login", "signup", "reset", "change"].includes(mode) && !(mode === "login" && otpRequested) && (
              <FormField
                id={`${mode}-password`}
                label={mode === "login" ? "Password" : "New password"}
                icon="♙"
                type={showPassword ? "text" : "password"}
                suffix={passwordEye(mode === "login" ? "password" : "new password")}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={8}
              />
            )}
            {["signup", "reset", "change"].includes(mode) && (
              <FormField
                id={`${mode}-confirm-password`}
                label="Confirm password"
                icon="♙"
                type={showPassword ? "text" : "password"}
                suffix={passwordEye("confirm password")}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
              />
            )}
            {mode === "login" && (
              <div className="auth-forgot-link">
                <Link to="/forgot-password">Forgot password?</Link>
              </div>
            )}
            {error && <p className="auth-message error" role="alert">{error}</p>}
            {success && <p className="auth-message success" role="status">{success}</p>}
            {developmentResetLink && (
              <Link className="auth-reset-preview" to={developmentResetLink}>
                Continue to reset your password
              </Link>
            )}
            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait…" : content.submit} <span aria-hidden="true">→</span>
            </button>
          </form>

          {mode === "login" && (
            <div className="auth-or"><span>OR</span></div>
          )}
          {mode === "login" && (
            <button
              className="auth-secondary"
              type="button"
              onClick={otpRequested ? () => { setOtpRequested(false); setOtpCode(""); setSuccess(""); } : sendOtp}
              disabled={loading}
            >
              ▣ {otpRequested ? "Sign In with Password" : "Sign In with OTP"}
            </button>
          )}
          {mode === "change" && (
            <Link className="auth-back-link" to="/">← Back to your workspace</Link>
          )}
        </div>
        <footer className="auth-footer">© 2026 AdblissHRM · People, made simple.</footer>
      </section>
    </main>
  );
}
