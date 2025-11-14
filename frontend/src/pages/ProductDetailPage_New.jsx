import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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
import { ArrowLeft, Edit2, Trash2, MapPin, Navigation, Calendar, Radio } from 'lucide-react';
import { toast } from 'sonner';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const canEdit = user?.role === 'admin' || user?.role === 'editor';

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Erro ao carregar equipamento');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/products/${id}`);
      toast.success('Equipamento excluído com sucesso!');
      navigate('/products');
    } catch (error) {
      toast.error('Erro ao excluir equipamento');
    }
  };

  const openGoogleMapsRoute = () => {
    if (product?.latitude && product?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${product.latitude},${product.longitude}`;
      window.open(url, '_blank');
    } else {
      toast.error('Coordenadas não disponíveis');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const InfoField = ({ label, value, icon: Icon }) => (
    <div className="p-3 rounded-lg" style={{ background: 'rgba(45, 95, 70, 0.2)' }}>
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon className="w-4 h-4" style={{ color: '#d4af37' }} />}
        <p className="text-sm text-gray-400">{label}</p>
      </div>
      <p className="text-white font-medium">{value || 'N/A'}</p>
    </div>
  );

  const ComponentInfo = ({ label, component }) => {
    if (!component || !component.has_component) {
      return (
        <div className="p-3 rounded-lg" style={{ background: 'rgba(45, 95, 70, 0.1)', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
          <p className="text-sm text-gray-500">{label}: <span className="italic">Não instalado</span></p>
        </div>
      );
    }

    return (
      <div className="p-3 rounded-lg" style={{ background: 'rgba(45, 95, 70, 0.2)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <p className="text-sm font-semibold mb-2" style={{ color: '#d4af37' }}>{label}</p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-400">Modelo: <span className="text-white">{component.model_type === 'modelo_1' ? 'Modelo 1' : 'Modelo 2'}</span></p>
          <p className="text-gray-400">Série: <span className="text-white font-mono">{component.serial_number || 'N/A'}</span></p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12\">
          <div className="shimmer inline-block w-12 h-12 rounded-full\"></div>
          <p className="text-gray-400 mt-4\">Carregando equipamento...</p>
        </div>
      </Layout>
    );
  }

  const hasCoordinates = product?.latitude && product?.longitude;
  const lat = hasCoordinates ? parseFloat(product.latitude) : -23.550520;
  const lng = hasCoordinates ? parseFloat(product.longitude) : -46.633308;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 fade-in\">
        {/* Header */}
        <div className="flex items-center justify-between\">
          <div className="flex items-center gap-4\">
            <Button
              data-testid="back-to-products-button\"
              onClick={() => navigate('/products')}
              variant="outline\"
              className="rounded-full\"
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
            >
              <ArrowLeft className="w-5 h-5\" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold\" style={{ color: '#f4d03f' }}>
                TAG: {product.tag}
              </h1>
              <p className="text-gray-400\">N° PAVIAN: {product.num_pavian}</p>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-3\">
              <Button
                data-testid="edit-product-button\"
                onClick={() => navigate(`/products/${id}/edit`)}
                className="rounded-full text-black\"
                style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
              >
                <Edit2 className="w-4 h-4 mr-2\" />
                Editar
              </Button>
              <Button
                data-testid="delete-product-button\"
                onClick={() => setShowDeleteDialog(true)}
                variant="outline\"
                className="rounded-full\"
                style={{ borderColor: '#dc2626', color: '#dc2626' }}
              >
                <Trash2 className="w-4 h-4 mr-2\" />
                Excluir
              </Button>
            </div>
          )}
        </div>

        {/* Map */}
        {hasCoordinates && (
          <Card className="glass-card overflow-hidden\" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
            <CardHeader className="flex flex-row items-center justify-between\">
              <CardTitle className="flex items-center gap-2\" style={{ color: '#e0e0e0' }}>
                <MapPin className="w-5 h-5\" style={{ color: '#d4af37' }} />
                Localização no Mapa
              </CardTitle>
              <Button
                data-testid="open-route-button\"
                onClick={openGoogleMapsRoute}
                className="rounded-full text-black font-semibold\"
                style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
              >
                <Navigation className="w-4 h-4 mr-2\" />
                Abrir Rota
              </Button>
            </CardHeader>
            <CardContent className="p-0\">
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer
                  center={[lat, lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png\"
                  />
                  <Marker position={[lat, lng]}>
                    <Popup>
                      <div className="text-sm\">
                        <p className="font-bold\">{product.tag}</p>
                        <p>N° PAVIAN: {product.num_pavian}</p>
                        <p className="text-xs text-gray-600\">Lat: {lat}, Lng: {lng}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Identification */}
        <Card className="glass-card\" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <CardHeader>
            <CardTitle style={{ color: '#e0e0e0' }}>Identificação e Informações Gerais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
              <InfoField label="TAG\" value={product.tag} icon={Radio} />
              <InfoField label="N° PAVIAN\" value={product.num_pavian} icon={Radio} />
              <InfoField label="Modelo PAVIAN\" value={product.modelo_pavian} />
              <InfoField label="Potência PAVIAN Existente\" value={product.potencia_pavian_existente} />
              <InfoField label="Situação / Sit. Proposta\" value={product.situacao_proposta} />
              <InfoField label="Status Implantação\" value={product.status_implantacao} />
            </div>
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="glass-card\" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2\" style={{ color: '#e0e0e0' }}>
              <Calendar className="w-5 h-5\" style={{ color: '#d4af37' }} />
              Datas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4\">
              <InfoField label="Data de Instalação\" value={formatDate(product.data_instalacao)} />
              <InfoField label="Data de Atualização\" value={formatDate(product.data_atualizacao)} />
              <InfoField label="Data Vencimento Garantia\" value={formatDate(product.data_vencimento_garantia)} />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="glass-card\" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2\" style={{ color: '#e0e0e0' }}>
              <MapPin className="w-5 h-5\" style={{ color: '#d4af37' }} />
              Localização e Montagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
              <InfoField label="Região\" value={product.regiao} />
              <InfoField label="Complexo\" value={product.complexo} />
              <InfoField label="Latitude\" value={product.latitude} />
              <InfoField label="Longitude\" value={product.longitude} />
              <InfoField label="Tipo de Montagem\" value={product.config_tipo_montagem} />
              <InfoField label="Azimute (°)\" value={product.azimute} />
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card className="glass-card\" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <CardHeader>
            <CardTitle style={{ color: '#e0e0e0' }}>Configurações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
              <InfoField label="Repetidora A (Principal)\" value={product.repetidora_a_principal} />
              <InfoField label="Repetidora B (Redundante)\" value={product.repetidora_b_redundante} />
              <InfoField label="Firmware do Rádio\" value={product.firmware_radio} />
              <InfoField label="Tipo de Melodia\" value={product.tipo_melodia} />
              <InfoField label="Prioridade de Alarmes\" value={product.prioridade_alarmes} />
              <InfoField label="ID Canal Primário\" value={product.id_canal_primario} />
              <InfoField label="ID Canal Secundário\" value={product.id_canal_secundario} />
            </div>
          </CardContent>
        </Card>

        {/* Radios */}
        <Card className="glass-card\" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <CardHeader>
            <CardTitle style={{ color: '#e0e0e0' }}>Rádios e Conversores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6\">
            <div>
              <h3 className="text-lg font-semibold mb-3\" style={{ color: '#d4af37' }}>Rádio Primário</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4\">
                <InfoField label="Nº de Série\" value={product.serial_radio_primario} />
                <InfoField label="Modelo\" value={product.modelo_radio_primario} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3\" style={{ color: '#d4af37' }}>Rádio Secundário</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4\">
                <InfoField label="Nº de Série\" value={product.serial_radio_secundario} />
                <InfoField label="Modelo\" value={product.modelo_radio_secundario} />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3\" style={{ color: '#d4af37' }}>Conversores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4\">
                <InfoField label="Conv. Primário - Nº de Série\" value={product.serial_conv_primario} />
                <InfoField label="Conv. Secundário - Nº de Série\" value={product.serial_conv_secundario} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Components */}
        <Card className="glass-card\" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
          <CardHeader>
            <CardTitle style={{ color: '#e0e0e0' }}>Componentes Internos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6\">
            <InfoField label="Firmware Placa-Mãe\" value={product.firmware_placa_mae} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4\">
              <ComponentInfo label="Placa-Mãe\" component={product.placa_mae} />
              <ComponentInfo label="Fonte\" component={product.fonte} />
              <ComponentInfo label="Placa de Comunicação Primária\" component={product.placa_comunicacao_primaria} />
              <ComponentInfo label="Placa de Comunicação Secundária\" component={product.placa_comunicacao_secundaria} />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3\" style={{ color: '#d4af37' }}>Amplificadores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
                {product.amplificadores && product.amplificadores.length > 0 ? (
                  product.amplificadores.map((amp, index) => (
                    <ComponentInfo key={index} label={`Amplificador ${index + 1}`} component={amp} />
                  ))
                ) : (
                  <p className="text-gray-500 italic col-span-3\">Nenhum amplificador cadastrado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Observations */}
        {product.observacoes && (
          <Card className="glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
            <CardHeader>
              <CardTitle style={{ color: '#e0e0e0' }}>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white whitespace-pre-wrap">{product.observacoes}</p>
            </CardContent>
          </Card>
        )}

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
            <AlertDialogHeader>
              <AlertDialogTitle style={{ color: '#f4d03f' }}>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription style={{ color: '#9ca3af' }}>
                Tem certeza que deseja excluir o equipamento \"{product.tag}\"? Esta ação não pode ser desfeita.
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
