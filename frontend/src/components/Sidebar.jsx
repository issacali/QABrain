import { Link, useLocation } from "react-router-dom";

const items = [
  ["/", "Dashboard"],
  ["/test-cases", "Test Case Generator"],
  ["/defects", "Defect Generator"],
  ["/jira", "Jira Integration"],
  ["/settings", "Settings"]
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-full md:w-64 bg-slate-900 text-white p-4 min-h-screen">
      <h1 className="text-xl font-semibold mb-6">QA Assistant</h1>
      <nav className="space-y-2">
        {items.map(([to, label]) => (
          <Link
            key={to}
            to={to}
            className={`block px-3 py-2 rounded-lg ${pathname === to ? "bg-indigo-600" : "hover:bg-slate-800"}`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
