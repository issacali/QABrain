import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="md:flex">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
