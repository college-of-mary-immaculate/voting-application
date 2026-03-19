import { Outlet, Link } from 'react-router-dom';

export default function VoterLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-indigo-50 p-4">
        <h2 className="font-bold text-xl mb-4">Voter Menu</h2>
        <nav className="space-y-2">
          <Link to="/voter-dashboard" className="block px-2 py-1 rounded hover:bg-indigo-100">
            Dashboard
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}