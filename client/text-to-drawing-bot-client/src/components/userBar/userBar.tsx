import "./UserBar.css";

type Props = {
  email: string;
  onLogout: () => void;
};

export function UserBar({ email, onLogout }: Props) {
  return (
    <div className="user-bar-container">
      <div className="user-info">
        <span className="user-greeting">Hi,</span> 
        <span className="user-email">{email}</span>
      </div>
      <button className="btn-logout" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}