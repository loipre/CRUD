import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search, Radio, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, products]);

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      toast.error('Erro ao carregar equipamentos');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.num_pavian?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.regiao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.complexo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.modelo_pavian?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const getStatusColor = (status) => {
    if (!status) return '#666';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('ativo') || statusLower.includes('operacional')) return '#22c55e';
    if (statusLower.includes('manuten') || statusLower.includes('pendente')) return '#f59e0b';
    if (statusLower.includes('inativo') || statusLower.includes('desativado')) return '#ef4444';
    return '#3b82f6';
  };

  return (
    <Layout>
      <div className="space-y-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#f4d03f' }}>Equipamentos PAVIAN</h1>
            <p className="text-gray-400">Gerencie os equipamentos do sistema</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'editor') && (
            <Button
              data-testid="create-product-button"
              onClick={() => navigate('/products/new')}
              className="rounded-full px-6 text-black font-semibold"
              style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Equipamento
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="glass-card p-4" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              data-testid="search-products-input"
              type="text"
              placeholder="Buscar por TAG, N° PAVIAN, Região, Complexo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 bg-black/30 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="shimmer inline-block w-12 h-12 rounded-full"></div>
            <p className="text-gray-400 mt-4">Carregando equipamentos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
            <Radio className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">
              {searchTerm ? 'Nenhum equipamento encontrado' : 'Nenhum equipamento cadastrado'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                data-testid={`product-card-${product.id}`}
                className="glass-card cursor-pointer group"
                onClick={() => navigate(`/products/${product.id}`)}
                style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{
                      background: 'linear-gradient(135deg, #2d5f46 0%, #3a7558 100%)'
                    }}>
                      <Radio className="w-6 h-6" style={{ color: '#f4d03f' }} />
                    </div>
                    <div
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: `${getStatusColor(product.status_implantacao)}20`,
                        color: getStatusColor(product.status_implantacao)
                      }}
                    >
                      {product.status_implantacao || 'N/A'}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-2 group-hover:text-yellow-400 transition-colors" style={{ color: '#e0e0e0' }}>
                    TAG: {product.tag}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">N° PAVIAN:</span>
                      <span className="font-semibold" style={{ color: '#d4af37' }}>{product.num_pavian}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Modelo:</span>
                      <span className="text-gray-300">{product.modelo_pavian}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'rgba(212, 175, 55, 0.15)' }}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" style={{ color: '#d4af37' }} />
                      <div>
                        <p className="text-xs text-gray-500">Região</p>
                        <p className="text-sm font-medium text-gray-300">{product.regiao}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Complexo</p>
                        <p className="text-sm font-medium text-gray-300">{product.complexo}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}