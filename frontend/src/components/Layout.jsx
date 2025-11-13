import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Package, Users, Key, Activity, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'editor', 'user'] },
    { path: '/products', label: 'Produtos', icon: Package, roles: ['admin', 'editor', 'user'] },
    { path: '/admin/users', label: 'Usuários', icon: Users, roles: ['admin'] },
    { path: '/admin/codes', label: 'Códigos', icon: Key, roles: ['admin'] },
    { path: '/audit', label: 'Histórico', icon: Activity, roles: ['admin', 'editor'] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)' }}>
      {/* Sidebar */}
      <aside className="w-64 border-r" style={{
        background: 'rgba(26, 61, 46, 0.1)',
        backdropFilter: 'blur(16px)',
        borderColor: 'rgba(212, 175, 55, 0.15)'
      }}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
              }}>
                <ShieldCheck className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="font-bold" style={{ color: '#f4d03f' }}>CRUD System</h2>
                <p className="text-xs text-gray-500">Gestão Segura</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
                background: user?.role === 'admin' 
                  ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                  : 'rgba(45, 95, 70, 0.5)'
              }}>
                <span className="text-sm font-bold" style={{ 
                  color: user?.role === 'admin' ? '#0a0a0a' : '#f4d03f' 
                }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate" style={{ color: '#e0e0e0' }}>
                  {user?.name}
                </p>
                <p className="text-xs truncate" style={{
                  color: user?.role === 'admin' ? '#d4af37' : '#2d5f46'
                }}>
                  {user?.role}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  data-testid={`nav-${item.path.replace(/\//g, '-')}`}
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                  style={{
                    background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'transparent',
                    color: isActive ? '#f4d03f' : '#9ca3af',
                    border: isActive ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid transparent'
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.15)' }}>
            <Button
              data-testid="logout-button"
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start gap-3"
              style={{
                borderColor: 'rgba(212, 175, 55, 0.3)',
                color: '#e0e0e0'
              }}
            >
              <LogOut className="w-5 h-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}