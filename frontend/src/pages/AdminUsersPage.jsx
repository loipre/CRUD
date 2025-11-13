import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, Clock, Shield, Mail, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, pendingRes] = await Promise.all([
        axios.get(`${API}/users`),
        axios.get(`${API}/users/pending`)
      ]);
      
      setAllUsers(usersRes.data);
      setPendingUsers(pendingRes.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await axios.post(`${API}/users/${userId}/approve`);
      toast.success('Usuário aprovado com sucesso!');
      loadData();
    } catch (error) {
      toast.error('Erro ao aprovar usuário');
    }
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'badge-admin';
      case 'editor': return 'badge-editor';
      default: return 'badge-user';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const UserCard = ({ user, showApprove = false }) => (
    <Card
      data-testid={`user-card-${user.id}`}
      className="glass-card"
      style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{
              background: user.role === 'admin' 
                ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                : 'rgba(45, 95, 70, 0.5)'
            }}>
              <span className="text-lg font-bold" style={{ 
                color: user.role === 'admin' ? '#0a0a0a' : '#f4d03f' 
              }}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1" style={{ color: '#e0e0e0' }}>
                {user.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-xs ${getRoleBadgeClass(user.role)}`}>
                  {user.role.toUpperCase()}
                </span>
                {user.approved && (
                  <span className="px-3 py-1 rounded-full text-xs" style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    color: '#22c55e'
                  }}>
                    ✓ Aprovado
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
              <Calendar className="w-3 h-3" />
              {formatDate(user.created_at)}
            </div>
            
            {showApprove && (
              <Button
                data-testid={`approve-user-${user.id}`}
                onClick={() => handleApprove(user.id)}
                size="sm"
                className="rounded-full text-black font-semibold"
                style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Aprovar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#f4d03f' }}>Gerência de Usuários</h1>
          <p className="text-gray-400">Aprove e gerencie usuários do sistema</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2" style={{ background: 'rgba(26, 61, 46, 0.2)' }}>
            <TabsTrigger
              value="pending"
              data-testid="pending-users-tab"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#f4d03f] data-[state=active]:text-black"
            >
              <Clock className="w-4 h-4 mr-2" />
              Pendentes ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger
              value="all"
              data-testid="all-users-tab"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#f4d03f] data-[state=active]:text-black"
            >
              <Shield className="w-4 h-4 mr-2" />
              Todos ({allUsers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="shimmer inline-block w-12 h-12 rounded-full"></div>
                <p className="text-gray-400 mt-4">Carregando usuários...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-12 glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
                <UserCheck className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400 text-lg">Nenhum usuário pendente de aprovação</p>
              </div>
            ) : (
              pendingUsers.map(user => <UserCard key={user.id} user={user} showApprove={true} />)
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="shimmer inline-block w-12 h-12 rounded-full"></div>
                <p className="text-gray-400 mt-4">Carregando usuários...</p>
              </div>
            ) : (
              allUsers.map(user => <UserCard key={user.id} user={user} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}