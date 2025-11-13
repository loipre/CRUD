import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Key, Copy, Check, Calendar, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCodesPage() {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [formData, setFormData] = useState({
    role_assigned: 'user',
    max_uses: 1,
    expires_hours: 168
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const response = await axios.get(`${API}/invite-codes`);
      setCodes(response.data);
    } catch (error) {
      toast.error('Erro ao carregar códigos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      await axios.post(`${API}/invite-codes/generate`, {
        ...formData,
        max_uses: parseInt(formData.max_uses),
        expires_hours: parseInt(formData.expires_hours)
      });
      
      toast.success('Código criado com sucesso!');
      setShowDialog(false);
      setFormData({ role_assigned: 'user', max_uses: 1, expires_hours: 168 });
      loadCodes();
    } catch (error) {
      toast.error('Erro ao criar código');
    } finally {
      setCreating(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Código copiado!');
    setTimeout(() => setCopiedCode(null), 2000);
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

  const isExpired = (dateString) => {
    return new Date(dateString) < new Date();
  };

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'admin': return 'badge-admin';
      case 'editor': return 'badge-editor';
      default: return 'badge-user';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#f4d03f' }}>Códigos de Convite</h1>
            <p className="text-gray-400">Gere códigos para novos usuários</p>
          </div>
          
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button
                data-testid="create-code-button"
                className="rounded-full px-6 text-black font-semibold"
                style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Gerar Código
              </Button>
            </DialogTrigger>
            <DialogContent style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <DialogHeader>
                <DialogTitle style={{ color: '#f4d03f' }}>Gerar Novo Código</DialogTitle>
                <DialogDescription style={{ color: '#9ca3af' }}>
                  Configure o código de convite para novos usuários
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="role" className="text-gray-300">Cargo do Usuário</Label>
                  <Select
                    value={formData.role_assigned}
                    onValueChange={(value) => setFormData({ ...formData, role_assigned: value })}
                  >
                    <SelectTrigger
                      id="role"
                      data-testid="role-select"
                      className="bg-black/30 border-gray-700 text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                      <SelectItem value="user" style={{ color: '#e0e0e0' }}>Usuário</SelectItem>
                      <SelectItem value="editor" style={{ color: '#e0e0e0' }}>Editor</SelectItem>
                      <SelectItem value="admin" style={{ color: '#e0e0e0' }}>Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="max_uses" className="text-gray-300">Usos Máximos</Label>
                  <Input
                    id="max_uses"
                    data-testid="max-uses-input"
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    className="bg-black/30 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="expires_hours" className="text-gray-300">Expira em (horas)</Label>
                  <Input
                    id="expires_hours"
                    data-testid="expires-hours-input"
                    type="number"
                    min="1"
                    value={formData.expires_hours}
                    onChange={(e) => setFormData({ ...formData, expires_hours: e.target.value })}
                    className="bg-black/30 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Padrão: 168 horas (7 dias)
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  data-testid="generate-code-button"
                  onClick={handleCreate}
                  disabled={creating}
                  className="rounded-full text-black font-semibold"
                  style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
                >
                  {creating ? 'Gerando...' : 'Gerar Código'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Codes List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="shimmer inline-block w-12 h-12 rounded-full"></div>
            <p className="text-gray-400 mt-4">Carregando códigos...</p>
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-12 glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
            <Key className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">Nenhum código criado ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {codes.map((code) => {
              const expired = isExpired(code.expires_at);
              const fullyUsed = code.used_count >= code.max_uses;
              
              return (
                <Card
                  key={code.code}
                  data-testid={`code-card-${code.code}`}
                  className="glass-card"
                  style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
                          background: 'linear-gradient(135deg, #2d5f46 0%, #3a7558 100%)'
                        }}>
                          <Key className="w-5 h-5" style={{ color: '#f4d03f' }} />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-bold" style={{ color: '#f4d03f' }}>
                            {code.code}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getRoleBadgeClass(code.role_assigned)}`}>
                            {code.role_assigned.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <Button
                        data-testid={`copy-code-${code.code}`}
                        onClick={() => copyCode(code.code)}
                        size="icon"
                        variant="outline"
                        className="shrink-0"
                        style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
                      >
                        {copiedCode === code.code ? (
                          <Check className="w-4 h-4" style={{ color: '#22c55e' }} />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">
                          Usado {code.used_count} de {code.max_uses} vezes
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-400">
                          Expira em: {formatDate(code.expires_at)}
                        </span>
                      </div>

                      {(expired || fullyUsed) && (
                        <div className="px-3 py-2 rounded-lg" style={{
                          background: 'rgba(220, 38, 38, 0.1)',
                          border: '1px solid rgba(220, 38, 38, 0.3)'
                        }}>
                          <p className="text-sm text-red-400">
                            {expired ? '❌ Expirado' : '❌ Limite de usos atingido'}
                          </p>
                        </div>
                      )}
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