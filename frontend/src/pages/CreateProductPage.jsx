import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API } from '@/App';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tag: '',
    num_pavian: '',
    data_instalacao: '',
    data_atualizacao: '',
    data_vencimento_garantia: '',
    modelo_pavian: '',
    potencia_pavian_existente: '',
    situacao_proposta: '',
    status_implantacao: '',
    regiao: '',
    complexo: '',
    latitude: '',
    longitude: '',
    config_tipo_montagem: '',
    azimute: '',
    repetidora_a_principal: '',
    repetidora_b_redundante: '',
    firmware_radio: '',
    tipo_melodia: '',
    prioridade_alarmes: '',
    id_canal_primario: '',
    id_canal_secundario: '',
    serial_radio_primario: '',
    modelo_radio_primario: '',
    serial_radio_secundario: '',
    modelo_radio_secundario: '',
    serial_conv_primario: '',
    serial_conv_secundario: '',
    firmware_placa_mae: '',
    observacoes: ''
  });

  const [placaMae, setPlacaMae] = useState({ has_component: false, model_type: null, serial_number: '' });
  const [fonte, setFonte] = useState({ has_component: false, model_type: null, serial_number: '' });
  const [placaComPrimaria, setPlacaComPrimaria] = useState({ has_component: false, model_type: null, serial_number: '' });
  const [placaComSecundaria, setPlacaComSecundaria] = useState({ has_component: false, model_type: null, serial_number: '' });
  const [amplificadores, setAmplificadores] = useState(
    Array(10).fill().map(() => ({ has_component: false, model_type: null, serial_number: '' }))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        ...formData,
        placa_mae: placaMae,
        fonte: fonte,
        placa_comunicacao_primaria: placaComPrimaria,
        placa_comunicacao_secundaria: placaComSecundaria,
        amplificadores: amplificadores
      };

      await axios.post(`${API}/products`, productData);
      
      toast.success('Equipamento PAVIAN cadastrado com sucesso!');
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao cadastrar equipamento');
    } finally {
      setLoading(false);
    }
  };

  const ComponentSerialInput = ({ label, index, value, onChange }) => (
    <div className="space-y-3 p-4 rounded-lg" style={{ background: 'rgba(45, 95, 70, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
      <div className="flex items-center gap-2">
        <Checkbox
          checked={value.has_component}
          onCheckedChange={(checked) => onChange({ ...value, has_component: checked })}
          className="border-gray-600"
        />
        <Label className="text-gray-300">{label}</Label>
      </div>
      
      {value.has_component && (
        <>
          <Select
            value={value.model_type || ''}
            onValueChange={(val) => onChange({ ...value, model_type: val })}
          >
            <SelectTrigger className="bg-black/30 border-gray-700 text-white">
              <SelectValue placeholder="Selecione o modelo" />
            </SelectTrigger>
            <SelectContent style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
              <SelectItem value="modelo_1" style={{ color: '#e0e0e0' }}>Modelo 1</SelectItem>
              <SelectItem value="modelo_2" style={{ color: '#e0e0e0' }}>Modelo 2</SelectItem>
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Número de Série"
            value={value.serial_number}
            onChange={(e) => onChange({ ...value, serial_number: e.target.value })}
            className="bg-black/30 border-gray-700 text-white"
          />
        </>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 fade-in">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            data-testid="back-button"
            onClick={() => navigate('/products')}
            variant="outline"
            className="rounded-full"
            style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold" style={{ color: '#f4d03f' }}>Novo Equipamento PAVIAN</h1>
            <p className="text-gray-400">Cadastre um novo equipamento no sistema</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="identificacao" className="w-full">
            <TabsList className="grid w-full grid-cols-5" style={{ background: 'rgba(26, 61, 46, 0.2)' }}>
              <TabsTrigger value="identificacao" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#f4d03f] data-[state=active]:text-black">
                Identificação
              </TabsTrigger>
              <TabsTrigger value="localizacao" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#f4d03f] data-[state=active]:text-black">
                Localização
              </TabsTrigger>
              <TabsTrigger value="configuracao" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#f4d03f] data-[state=active]:text-black">
                Configuração
              </TabsTrigger>
              <TabsTrigger value="radios" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#f4d03f] data-[state=active]:text-black">
                Rádios/Conversores
              </TabsTrigger>
              <TabsTrigger value="componentes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#d4af37] data-[state=active]:to-[#f4d03f] data-[state=active]:text-black">
                Componentes
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Identificação */}
            <TabsContent value="identificacao" className="space-y-6 mt-6">
              <Card className="glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#e0e0e0' }}>Identificação e Datas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">TAG *</Label>
                      <Input
                        required
                        value={formData.tag}
                        onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">N° PAVIAN *</Label>
                      <Input
                        required
                        value={formData.num_pavian}
                        onChange={(e) => setFormData({ ...formData, num_pavian: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300">Data de Instalação</Label>
                      <Input
                        type="date"
                        value={formData.data_instalacao}
                        onChange={(e) => setFormData({ ...formData, data_instalacao: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Data de Atualização</Label>
                      <Input
                        type="date"
                        value={formData.data_atualizacao}
                        onChange={(e) => setFormData({ ...formData, data_atualizacao: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Data Vencimento Garantia</Label>
                      <Input
                        type="date"
                        value={formData.data_vencimento_garantia}
                        onChange={(e) => setFormData({ ...formData, data_vencimento_garantia: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Modelo PAVIAN *</Label>
                      <Input
                        required
                        value={formData.modelo_pavian}
                        onChange={(e) => setFormData({ ...formData, modelo_pavian: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Potência PAVIAN Existente *</Label>
                      <Input
                        required
                        value={formData.potencia_pavian_existente}
                        onChange={(e) => setFormData({ ...formData, potencia_pavian_existente: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Situação / Sit. Proposta *</Label>
                      <Input
                        required
                        value={formData.situacao_proposta}
                        onChange={(e) => setFormData({ ...formData, situacao_proposta: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Status Implantação *</Label>
                      <Input
                        required
                        value={formData.status_implantacao}
                        onChange={(e) => setFormData({ ...formData, status_implantacao: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Localização */}
            <TabsContent value="localizacao" className="space-y-6 mt-6">
              <Card className="glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#e0e0e0' }}>Localização e Montagem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Região *</Label>
                      <Input
                        required
                        value={formData.regiao}
                        onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Complexo *</Label>
                      <Input
                        required
                        value={formData.complexo}
                        onChange={(e) => setFormData({ ...formData, complexo: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Latitude VT WGS84</Label>
                      <Input
                        placeholder="-23.550520"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Longitude VT WGS84</Label>
                      <Input
                        placeholder="-46.633308"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Configuração - Tipo de Montagem *</Label>
                      <Input
                        required
                        value={formData.config_tipo_montagem}
                        onChange={(e) => setFormData({ ...formData, config_tipo_montagem: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Azimute (°)</Label>
                      <Input
                        type="number"
                        placeholder="0-360"
                        value={formData.azimute}
                        onChange={(e) => setFormData({ ...formData, azimute: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 3: Configuração */}
            <TabsContent value="configuracao" className="space-y-6 mt-6">
              <Card className="glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#e0e0e0' }}>Configurações do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">Repetidora A (Principal) *</Label>
                      <Input
                        required
                        value={formData.repetidora_a_principal}
                        onChange={(e) => setFormData({ ...formData, repetidora_a_principal: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Repetidora B (Redundante) *</Label>
                      <Input
                        required
                        value={formData.repetidora_b_redundante}
                        onChange={(e) => setFormData({ ...formData, repetidora_b_redundante: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-gray-300">Firmware do Rádio *</Label>
                      <Input
                        required
                        value={formData.firmware_radio}
                        onChange={(e) => setFormData({ ...formData, firmware_radio: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Tipo de Melodia *</Label>
                      <Input
                        required
                        value={formData.tipo_melodia}
                        onChange={(e) => setFormData({ ...formData, tipo_melodia: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Prioridade de Alarmes *</Label>
                      <Input
                        required
                        value={formData.prioridade_alarmes}
                        onChange={(e) => setFormData({ ...formData, prioridade_alarmes: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-300">ID Canal Primário *</Label>
                      <Input
                        required
                        value={formData.id_canal_primario}
                        onChange={(e) => setFormData({ ...formData, id_canal_primario: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">ID Canal Secundário *</Label>
                      <Input
                        required
                        value={formData.id_canal_secundario}
                        onChange={(e) => setFormData({ ...formData, id_canal_secundario: e.target.value })}
                        className="bg-black/30 border-gray-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Rádios/Conversores */}
            <TabsContent value="radios" className="space-y-6 mt-6">
              <Card className="glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#e0e0e0' }}>Rádios e Conversores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold" style={{ color: '#d4af37' }}>Rádio Primário</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Nº de Série *</Label>
                        <Input
                          required
                          value={formData.serial_radio_primario}
                          onChange={(e) => setFormData({ ...formData, serial_radio_primario: e.target.value })}
                          className="bg-black/30 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Modelo *</Label>
                        <Input
                          required
                          value={formData.modelo_radio_primario}
                          onChange={(e) => setFormData({ ...formData, modelo_radio_primario: e.target.value })}
                          className="bg-black/30 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold" style={{ color: '#d4af37' }}>Rádio Secundário</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Nº de Série *</Label>
                        <Input
                          required
                          value={formData.serial_radio_secundario}
                          onChange={(e) => setFormData({ ...formData, serial_radio_secundario: e.target.value })}
                          className="bg-black/30 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Modelo *</Label>
                        <Input
                          required
                          value={formData.modelo_radio_secundario}
                          onChange={(e) => setFormData({ ...formData, modelo_radio_secundario: e.target.value })}
                          className="bg-black/30 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold" style={{ color: '#d4af37' }}>Conversores</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Conv. Primário - Nº de Série *</Label>
                        <Input
                          required
                          value={formData.serial_conv_primario}
                          onChange={(e) => setFormData({ ...formData, serial_conv_primario: e.target.value })}
                          className="bg-black/30 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Conv. Secundário - Nº de Série *</Label>
                        <Input
                          required
                          value={formData.serial_conv_secundario}
                          onChange={(e) => setFormData({ ...formData, serial_conv_secundario: e.target.value })}
                          className="bg-black/30 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Componentes */}
            <TabsContent value="componentes" className="space-y-6 mt-6">
              <Card className="glass-card" style={{ background: 'rgba(26, 61, 46, 0.1)', borderColor: 'rgba(212, 175, 55, 0.15)' }}>
                <CardHeader>
                  <CardTitle style={{ color: '#e0e0e0' }}>Componentes Internos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-gray-300 mb-3 block">Firmware Placa-Mãe *</Label>
                    <Input
                      required
                      value={formData.firmware_placa_mae}
                      onChange={(e) => setFormData({ ...formData, firmware_placa_mae: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                    />
                  </div>

                  <ComponentSerialInput
                    label="Placa-Mãe"
                    value={placaMae}
                    onChange={setPlacaMae}
                  />

                  <ComponentSerialInput
                    label="Fonte"
                    value={fonte}
                    onChange={setFonte}
                  />

                  <ComponentSerialInput
                    label="Placa de Comunicação Primária"
                    value={placaComPrimaria}
                    onChange={setPlacaComPrimaria}
                  />

                  <ComponentSerialInput
                    label="Placa de Comunicação Secundária"
                    value={placaComSecundaria}
                    onChange={setPlacaComSecundaria}
                  />

                  <div>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#d4af37' }}>Amplificadores (até 10)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {amplificadores.map((amp, index) => (
                        <ComponentSerialInput
                          key={index}
                          label={`Amplificador ${index + 1}`}
                          value={amp}
                          onChange={(newValue) => {
                            const newAmps = [...amplificadores];
                            newAmps[index] = newValue;
                            setAmplificadores(newAmps);
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Observações</Label>
                    <Textarea
                      rows={4}
                      value={formData.observacoes}
                      onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                      className="bg-black/30 border-gray-700 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Submit Button */}
          <div className="flex gap-4 justify-end mt-6">
            <Button
              type="button"
              data-testid="cancel-button"
              onClick={() => navigate('/products')}
              variant="outline"
              className="rounded-full px-8"
              style={{ borderColor: 'rgba(212, 175, 55, 0.3)', color: '#e0e0e0' }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              data-testid="submit-product-button"
              disabled={loading}
              className="rounded-full px-8 text-black font-semibold"
              style={{ background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)' }}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : 'Cadastrar Equipamento'}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
