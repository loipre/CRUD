import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Lock, Mail, User, Key } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeValid, setCodeValid] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    invite_code: ''
  });

  const validateCode = async (code) => {
    if (!code || code.length < 8) {
      setCodeValid(null);
      return;
    }

    setValidatingCode(true);
    try {
      const response = await axios.get(`${API}/invite-codes/validate/${code}`);
      setCodeValid(response.data);
    } catch (error) {
      setCodeValid({ valid: false, message: 'Erro ao validar código' });
    } finally {
      setValidatingCode(false);
    }
  };

  const handleCodeChange = (code) => {
    setFormData({ ...formData, invite_code: code });
    if (code.length >= 8) {
      validateCode(code);
    } else {
      setCodeValid(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/auth/register`, formData);
      
      toast.success('Cadastro realizado! Aguarde aprovação do administrador.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a3d2e 100%)'
    }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{
            background: 'linear-gradient(135deg, #2d5f46 0%, #3a7558 100%)'
          }}>
            <UserPlus className="w-10 h-10" style={{ color: '#f4d03f' }} />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#f4d03f' }}>
            Criar Conta
          </h1>
          <p className="text-gray-400">Registre-se com um código de convite</p>
        </div>

        {/* Register Form */}
        <div className="glass-card p-8 fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-gray-300 mb-2 block">
                Nome Completo
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="name"
                  type="text"
                  data-testid="register-name-input"
                  placeholder="Seu nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="pl-11 bg-black/30 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-gray-300 mb-2 block">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  data-testid="register-email-input"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="pl-11 bg-black/30 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300 mb-2 block">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  data-testid="register-password-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="pl-11 bg-black/30 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="invite_code" className="text-gray-300 mb-2 block">
                Código de Convite
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="invite_code"
                  type="text"
                  data-testid="register-code-input"
                  placeholder="Código fornecido pelo administrador"
                  value={formData.invite_code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  required
                  className="pl-11 bg-black/30 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              {validatingCode && (
                <p className="text-sm text-gray-400 mt-2">Validando código...</p>
              )}
              {codeValid && (
                <div className={`text-sm mt-2 px-3 py-2 rounded-lg ${
                  codeValid.valid
                    ? 'bg-green-900/20 text-green-400 border border-green-800'
                    : 'bg-red-900/20 text-red-400 border border-red-800'
                }`}>
                  {codeValid.valid
                    ? `✓ Código válido - Cargo: ${codeValid.role}`
                    : `✗ ${codeValid.message}`
                  }
                </div>
              )}
            </div>

            <Button
              type="submit"
              data-testid="register-submit-button"
              disabled={loading || !codeValid?.valid}
              className="w-full h-12 text-lg font-semibold rounded-full text-black"
              style={{
                background: codeValid?.valid
                  ? 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
                  : 'linear-gradient(135deg, #666 0%, #888 100%)'
              }}
            >
              {loading ? 'Registrando...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                data-testid="login-link"
                className="font-semibold hover:underline"
                style={{ color: '#d4af37' }}
              >
                Fazer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}