import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, Shield, Activity } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    users: 0,
    pending: 0,
    logs: 0
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(userData);
    loadStats(userData);
  }, []);

  const loadStats = async (userData) => {
    try {
      const productsRes = await axios.get(`${API}/products`);
      let usersCount = 0;
      let pendingCount = 0;
      let logsCount = 0;

      if (userData?.role === 'admin') {
        const usersRes = await axios.get(`${API}/users`);
        const pendingRes = await axios.get(`${API}/users/pending`);
        const logsRes = await axios.get(`${API}/audit-logs`);
        usersCount = usersRes.data.length;
        pendingCount = pendingRes.data.length;
        logsCount = logsRes.data.length;
      } else if (userData?.role === 'editor') {
        const logsRes = await axios.get(`${API}/audit-logs`);
        logsCount = logsRes.data.length;
      }

      setStats({
        products: productsRes.data.length,
        users: usersCount,
        pending: pendingCount,
        logs: logsCount
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return '#d4af37';
      case 'editor': return '#2d5f46';
      default: return '#666';
    }
  };

  return (
    <Layout>
      <div className="space-y-8 fade-in">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#f4d03f' }}>
              Olá, {user?.name}!
            </h1>
            <p className="text-gray-400">Bem-vindo ao sistema de gestão</p>
          </div>
          <div className="px-4 py-2 rounded-full font-semibold" style={{
            background: `linear-gradient(135deg, ${getRoleColor(user?.role)} 0%, ${getRoleColor(user?.role)}dd 100%)`,
            color: user?.role === 'admin' ? '#0a0a0a' : '#f4d03f'
          }}>
            {user?.role?.toUpperCase()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            data-testid="products-stat-card"
            className="glass-card cursor-pointer"
            onClick={() => navigate('/products')}
            style={{ background: 'rgba(26, 61, 46, 0.2)', borderColor: 'rgba(212, 175, 55, 0.2)' }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Produtos</CardTitle>
              <Package className="w-5 h-5" style={{ color: '#d4af37' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#f4d03f' }}>
                {loading ? '...' : stats.products}
              </div>
              <p className="text-xs text-gray-500 mt-1">Total de produtos cadastrados</p>
            </CardContent>
          </Card>

          {user?.role === 'admin' && (
            <>
              <Card
                data-testid="users-stat-card"
                className="glass-card cursor-pointer"
                onClick={() => navigate('/admin/users')}
                style={{ background: 'rgba(26, 61, 46, 0.2)', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Usuários</CardTitle>
                  <Users className="w-5 h-5" style={{ color: '#d4af37' }} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: '#f4d03f' }}>
                    {loading ? '...' : stats.users}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Usuários cadastrados</p>
                </CardContent>
              </Card>

              <Card
                data-testid="pending-stat-card"
                className="glass-card cursor-pointer"
                onClick={() => navigate('/admin/users')}
                style={{ background: 'rgba(26, 61, 46, 0.2)', borderColor: 'rgba(212, 175, 55, 0.2)' }}
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Pendentes</CardTitle>
                  <Shield className="w-5 h-5" style={{ color: '#d4af37' }} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold" style={{ color: '#f4d03f' }}>
                    {loading ? '...' : stats.pending}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Aguardando aprovação</p>
                </CardContent>
              </Card>
            </>
          )}

          {(user?.role === 'admin' || user?.role === 'editor') && (
            <Card
              data-testid="logs-stat-card"
              className="glass-card cursor-pointer"
              onClick={() => navigate('/audit')}
              style={{ background: 'rgba(26, 61, 46, 0.2)', borderColor: 'rgba(212, 175, 55, 0.2)' }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Atividades</CardTitle>
                <Activity className="w-5 h-5" style={{ color: '#d4af37' }} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: '#f4d03f' }}>
                  {loading ? '...' : stats.logs}
                </div>
                <p className="text-xs text-gray-500 mt-1">Registros no histórico</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#e0e0e0' }}>Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              data-testid="quick-view-products-button"
              onClick={() => navigate('/products')}
              className="p-4 rounded-lg text-left"
              style={{
                background: 'rgba(45, 95, 70, 0.3)',
                border: '1px solid rgba(212, 175, 55, 0.2)'
              }}
            >
              <Package className="w-6 h-6 mb-2" style={{ color: '#d4af37' }} />
              <h3 className="font-semibold mb-1" style={{ color: '#f4d03f' }}>Ver Produtos</h3>
              <p className="text-sm text-gray-400">Visualizar todos os produtos</p>
            </button>

            {(user?.role === 'admin' || user?.role === 'editor') && (
              <button
                data-testid="quick-create-product-button"
                onClick={() => navigate('/products/new')}
                className="p-4 rounded-lg text-left"
                style={{
                  background: 'rgba(45, 95, 70, 0.3)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <Package className="w-6 h-6 mb-2" style={{ color: '#d4af37' }} />
                <h3 className="font-semibold mb-1" style={{ color: '#f4d03f' }}>Novo Produto</h3>
                <p className="text-sm text-gray-400">Cadastrar novo produto</p>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                data-testid="quick-manage-users-button"
                onClick={() => navigate('/admin/users')}
                className="p-4 rounded-lg text-left"
                style={{
                  background: 'rgba(45, 95, 70, 0.3)',
                  border: '1px solid rgba(212, 175, 55, 0.2)'
                }}
              >
                <Users className="w-6 h-6 mb-2" style={{ color: '#d4af37' }} />
                <h3 className="font-semibold mb-1" style={{ color: '#f4d03f' }}>Gerenciar Usuários</h3>
                <p className="text-sm text-gray-400">Aprovar e gerenciar usuários</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}