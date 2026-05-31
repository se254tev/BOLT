import { NavLink } from 'react-router-dom';

const links = [
  { label: 'Dashboard', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Properties', path: '/properties' },
  { label: 'Users', path: '/users' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Categories', path: '/categories' },
  { label: 'Ads', path: '/ads' },
  { label: 'Settings', path: '/settings' },
];

const Sidebar = () => (
  <div className="min-h-screen w-64 bg-slate-900 border-r border-slate-800 p-4 hidden md:block">
    <div className="mb-8 text-slate-100 text-lg font-semibold">BOLT Admin</div>
    <nav className="space-y-2">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default Sidebar;
