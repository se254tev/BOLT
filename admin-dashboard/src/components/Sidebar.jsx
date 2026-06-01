import { NavLink } from 'react-router-dom';

const links = [
  { label: 'Dashboard', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Properties', path: '/properties' },
  { label: 'Users', path: '/users' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Categories', path: '/categories' },
  { label: 'Ads', path: '/ads' },
  { label: 'Payments', path: '/payments' },
  { label: 'Settings', path: '/settings' },
];

const Sidebar = () => (
  <div className="min-h-screen w-64 bg-white border-r border-gray-200 p-4 hidden md:block">
    <div className="mb-8 text-black text-lg font-semibold">BOLT Admin</div>
    <nav className="space-y-2">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 text-sm font-medium ${isActive ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default Sidebar;
