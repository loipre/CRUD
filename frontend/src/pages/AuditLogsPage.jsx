import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, Package, Users, Key, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [filter, logs]);

  const loadLogs = async () => {
    try {
      const response = await axios.get(`${API}/audit-logs`);
      setLogs(response.data);
      setFilteredLogs(response.data);
    } catch (error) {
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    if (filter === 'all') {
      setFilteredLogs(logs);
    } else {
      setFilteredLogs(logs.filter(log => log.entity_type === filter));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'create': return '#22c55e';
      case 'update': return '#f59e0b';
      case 'delete': return '#ef4444';
      case 'approve': return '#3b82f6';
      default: return '#9ca3af';
    }
  };

  const getActionLabel = (action) => {
    switch(action) {
      case 'create': return 'Criou';
      case 'update': return 'Atualizou';
      case 'delete': return 'Excluiu';
      case 'approve': return 'Aprovou';
      default: return action;
    }
  };

  const getEntityIcon = (entityType) => {
    switch(entityType) {
      case 'product': return Package;
      case 'user': return Users;
      case 'invite_code': return Key;
      default: return Activity;
    }
  };

  const getEntityLabel = (entityType) => {
    switch(entityType) {
      case 'product': return 'Produto';
      case 'user': return 'Usuário';
      case 'invite_code': return 'Código';
      default: return entityType;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#f4d03f' }}>Histórico de Atividades</h1>
            <p className="text-gray-400">Todas as alterações do sistema</p>
          </div>

          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger
              data-testid="filter-select"
              className="w-48 bg-black/30 border-gray-700 text-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <SelectItem value="all" style={{ color: '#e0e0e0' }}>Todas Atividades</SelectItem>
              <SelectItem value="product" style={{ color: '#e0e0e0' }}>Produtos</SelectItem>
              <SelectItem value="user" style={{ color: '#e0e0e0' }}>Usuários</SelectItem>
              <SelectItem value="invite_code" style={{ color: '#e0e0e0' }}>Códigos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs */}
        {loading ? (
          <div className="text-center py-12">
            <div className="shimmer inline-block w-12 h-12 rounded-full"></div>
            <p className="text-gray-400 mt-4">Carregando histórico...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">Nenhuma atividade registrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => {
              const Icon = getEntityIcon(log.entity_type);
              
              return (
                <Card
                  key={log.id}
                  data-testid={`audit-log-${log.id}`}
                  className="glass-card"
                  style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{
                        background: 'linear-gradient(135deg, #2d5f46 0%, #3a7558 100%)'
                      }}>
                        <Icon className="w-5 h-5" style={{ color: '#f4d03f' }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: `${getActionColor(log.action)}20`, color: getActionColor(log.action) }}
                          >
                            {getActionLabel(log.action)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs" style={{
                            background: 'rgba(212, 175, 55, 0.2)',
                            color: '#d4af37'
                          }}>
                            {getEntityLabel(log.entity_type)}
                          </span>
                        </div>

                        <p className="text-white mb-3">
                          <span className="font-semibold" style={{ color: '#f4d03f' }}>{log.user_name}</span>
                          {' '}{getActionLabel(log.action).toLowerCase()}{' '}
                          um {getEntityLabel(log.entity_type).toLowerCase()}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{log.user_email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(log.timestamp)}</span>
                          </div>
                        </div>

                        {/* Changes */}
                        {Object.keys(log.changes).length > 0 && (
                          <details className="mt-4">
                            <summary className="cursor-pointer text-sm font-medium" style={{ color: '#d4af37' }}>
                              Ver detalhes da alteração
                            </summary>
                            <div className="mt-2 p-3 rounded-lg font-mono text-xs overflow-auto" style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid rgba(212, 175, 55, 0.2)'
                            }}>
                              <pre className="text-gray-300">{JSON.stringify(log.changes, null, 2)}</pre>
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}