import { LogOut, Plane } from "lucide-react";
import { iconFor, labelFor } from "./navConfig";

export function Sidebar({ session, tabs, active, onNavigate, onSignOut }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <Plane size={26} />
        <div>
          <strong>SkyBook</strong>
          <span>{session.role === "ADMIN" ? "Admin console" : "Booking desk"}</span>
        </div>
      </div>
      <nav>
        {tabs.map((tab) => (
          <button
            key={tab}
            className={active === tab ? "nav-item active" : "nav-item"}
            onClick={() => onNavigate(tab)}
            title={labelFor(tab)}
          >
            {iconFor(tab)}
            <span>{labelFor(tab)}</span>
          </button>
        ))}
      </nav>
      <div className="account">
        <div className="avatar">{session.email.slice(0, 1).toUpperCase()}</div>
        <div>
          <strong>{session.email}</strong>
          <span>{session.role}</span>
        </div>
        <button className="icon-button" onClick={onSignOut} title="Sign out">
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
