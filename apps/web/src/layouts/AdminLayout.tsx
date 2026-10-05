import { LayoutDashboard, LogOut, Menu, Package, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../hooks/useAuth';
import styles from './AdminLayout.module.css';

const NAVIGATION_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Productos', icon: Package, end: false },
  { to: '/orders', label: 'Pedidos', icon: ShoppingBag, end: false },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className={styles.shell}>
      <a href="#main-content" className={styles.skipLink}>
        Saltar al contenido
      </a>

      <header className={styles.topbar}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="admin-sidebar"
        >
          {isMenuOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
          <span className="visually-hidden">{isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}</span>
        </button>
        <span className={styles.topbarBrand}>Woo Companion</span>
        <ThemeToggle />
      </header>

      <aside
        id="admin-sidebar"
        className={`${styles.sidebar} ${isMenuOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            W
          </span>
          <span>
            Woo Companion
            <small className={styles.brandCaption}>Panel de tienda</small>
          </span>
        </div>

        <nav aria-label="Navegación principal" className={styles.nav}>
          {NAVIGATION_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <Icon aria-hidden="true" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.account}>
          <div className={styles.accountInfo}>
            <span className={styles.accountName}>{user?.name}</span>
            <span className={styles.accountEmail}>{user?.email}</span>
          </div>
          <button type="button" className={styles.logoutButton} onClick={logout}>
            <LogOut aria-hidden="true" size={16} />
            Salir
          </button>
        </div>
      </aside>

      {isMenuOpen && <div className={styles.backdrop} onClick={closeMenu} aria-hidden="true" />}

      <div className={styles.contentColumn}>
        <div className={styles.desktopToolbar}>
          <ThemeToggle />
        </div>
        <main id="main-content" className={styles.main} tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
