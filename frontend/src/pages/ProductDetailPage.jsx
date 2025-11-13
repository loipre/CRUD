import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ArrowLeft, Edit2, Trash2, Save, X, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [specifications, setSpecifications] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
      setFormData(response.data);
      
      const specs = Object.entries(response.data.specifications || {}).map(([key, value]) => ({ key, value }));
      setSpecifications(specs.length > 0 ? specs : [{ key: '', value: '' }]);
    } catch (error) {
      toast.error('Erro ao carregar produto');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const specsObject = specifications.reduce((acc, spec) => {
        if (spec.key && spec.value) {
          acc[spec.key] = spec.value;
        }
        return acc;
      }, {});

      const updateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        specifications: specsObject
      };

      await axios.put(`${API}/products/${id}`, updateData);
      
      toast.success('Produto atualizado com sucesso!');
      setEditing(false);
      loadProduct();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/products/${id}`);
      toast.success('Produto excluído com sucesso!');
      navigate('/products');
    } catch (error) {
      toast.error('Erro ao excluir produto');
    }
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const updateSpecification = (index, field, value) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="shimmer inline-block w-12 h-12 rounded-full"></div>
          <p className="text-gray-400 mt-4">Carregando produto...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              data-testid="back-to-products-button"
              onClick={() => navigate('/products')}
              variant="outline"
              className="rounded-full"
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#f4d03f' }}>
                {editing ? 'Editar Produto' : product.name}
              </h1>
              <p className="text-gray-400">{product.category}</p>
            </div>
          </div>

          {canEdit && !editing && (
            <div className="flex gap-3">
              <Button
                data-testid="edit-product-button"
                onClick={() => setEditing(true)}
                className="rounded-full text-black"
                style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Editar
              </Button>
              <Button
                data-testid="delete-product-button"
                onClick={() => setShowDeleteDialog(true)}
                variant="outline"
                className="rounded-full"
                style={{ borderColor: '#dc2626', color: '#dc2626' }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </div>
          )}
        </div>

        {/* Content */}
        <Card className="glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <CardHeader>
            <CardTitle style={{ color: '#e0e0e0' }}>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editing ? (
              <>
                <div>
                  <Label className="text-gray-300">Nome</Label>
                  <Input
                    data-testid="edit-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-black/30 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300">Descrição</Label>
                  <Textarea
                    data-testid="edit-description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="bg-black/30 border-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300">Categoria</Label>
                    <Input
                      data-testid="edit-category-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Preço</Label>
                    <Input
                      data-testid="edit-price-input"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Estoque</Label>
                    <Input
                      data-testid="edit-stock-input"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="text-gray-400">Descrição</Label>
                  <p className="text-white mt-1" data-testid="product-description">{product.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-400">Preço</Label>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#f4d03f' }} data-testid="product-price">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Estoque</Label>
                    <p className="text-2xl font-bold mt-1" style={{ color: '#f4d03f' }} data-testid="product-stock">
                      {product.stock}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-400">Categoria</Label>
                    <p className="text-white mt-1" data-testid="product-category">{product.category}</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card className="glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle style={{ color: '#e0e0e0' }}>Especificações Técnicas</CardTitle>
              {editing && (
                <Button
                  type="button"
                  onClick={addSpecification}
                  size="sm"
                  className="rounded-full text-black"
                  style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex gap-3">
                    <Input
                      placeholder="Especificação"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="bg-black/30 border-gray-700 text-white"
                    />
                    <Input
                      placeholder="Valor"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="bg-black/30 border-gray-700 text-white"
                    />
                    {specifications.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        size="icon"
                        variant="outline"
                        style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="specifications-list">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg" style={{ background: 'rgba(45, 95, 70, 0.2)' }}>
                    <p className="text-sm text-gray-400">{key}</p>
                    <p className="text-white font-medium">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Actions */}
        {editing && (
          <div className="flex gap-4 justify-end">
            <Button
              data-testid="cancel-edit-button"
              onClick={() => {
                setEditing(false);
                setFormData(product);
                const specs = Object.entries(product.specifications || {}).map(([key, value]) => ({ key, value }));
                setSpecifications(specs.length > 0 ? specs : [{ key: '', value: '' }]);
              }}
              variant="outline"
              className="rounded-full px-8"
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              data-testid="save-changes-button"
              onClick={handleUpdate}
              disabled={saving}
              className="rounded-full px-8 text-black font-semibold"
              style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: '#f4d03f' }}>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription style={{ color: '#9ca3af' }}>
                Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-testid="cancel-delete-button"
                style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                data-testid="confirm-delete-button"
                onClick={handleDelete}
                style={{ background: '#dc2626', color: 'white' }}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}