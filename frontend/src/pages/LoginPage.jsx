import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '@/App';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a3d2e 100%)'
    }}>
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8 fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
          }}>
            <ShieldCheck className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#f4d03f' }}>
            Sistema CRUD
          </h1>
          <p className="text-gray-400">Gestão de Produtos de Alta Complexidade</p>
        </div>

        {/* Login Form */}
        <div className="glass-card p-8 fade-in" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: '#e0e0e0' }}>
            Entrar no Sistema
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-300 mb-2 block">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  data-testid="login-email-input"
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
                  data-testid="login-password-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pl-11 bg-black/30 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              data-testid="login-submit-button"
              disabled={loading}
              className="w-full h-12 text-lg font-semibold rounded-full text-black"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)'
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                data-testid="register-link"
                className="font-semibold hover:underline"
                style={{ color: '#d4af37' }}
              >
                Registrar-se
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <p className="text-xs text-gray-400 text-center">
              Admin padrão: admin@system.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}