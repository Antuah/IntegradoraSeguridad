import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contratosApi, clientesApi, paquetesApi } from '../services/api';
import Swal from 'sweetalert2';
import { Container, Row, Col, Form, Button, Card, Badge } from 'react-bootstrap';
// import '../styles/Contratos.css';

function Contratos() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [paquetes, setPaquetes] = useState([]);
  const [currentContrato, setCurrentContrato] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    activo: true,
    paquete: '',
    cliente: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadContratos();
    loadClientes();
    loadPaquetes();
  }, []);

  const loadContratos = async () => {
    try {
      const response = await contratosApi.getContratos();
      setContratos(response.data);
    } catch (error) {
      console.error('Error loading contratos:', error);
      navigate('/500');
    }
  };

  const loadClientes = async () => {
    try {
      const response = await clientesApi.getClientes();
      setClientes(response.data);
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const loadPaquetes = async () => {
    try {
      const response = await paquetesApi.getPaquetes();
      setPaquetes(response.data);
    } catch (error) {
      console.error('Error loading paquetes:', error);
    }
  };

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Función para calcular la fecha de fin (1 año después de la fecha de inicio)
  const calculateEndDate = (startDate) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  // Actualizar el handleSubmit con validaciones
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar fecha de inicio
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(currentContrato.fecha_inicio);
      
      if (startDate < today) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'La fecha de inicio debe ser igual o posterior a hoy'
        });
        return;
      }

      const contratoData = {
        fecha_inicio: currentContrato.fecha_inicio,
        fecha_fin: currentContrato.fecha_fin,
        activo: currentContrato.activo,
        paquete: currentContrato.paquete,
        cliente: currentContrato.cliente
      };

      // Validar que se haya seleccionado un cliente y paquete
      if (!contratoData.cliente || !contratoData.paquete) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Debe seleccionar un cliente y un paquete'
        });
        return;
      }

      if (isEditing) {
        await contratosApi.updateContrato(currentContrato.id, contratoData);
      } else {
        await contratosApi.createContrato(contratoData);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: isEditing ? 'Contrato actualizado correctamente' : 'Contrato creado correctamente'
      });

      setCurrentContrato({
        fecha_inicio: '',
        fecha_fin: '',
        activo: true,
        paquete: '',
        cliente: ''
      });
      setIsEditing(false);
      await loadContratos();
    } catch (error) {
      console.error('Error saving contrato:', error);
      if (error.response) {
        const errorMessage = error.response.data?.detail || 
                           'Error al guardar el contrato. Por favor, verifique los datos.';
        alert(errorMessage);
      } else {
        navigate('/500');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este contrato?')) {
      try {
        await contratosApi.deleteContrato(id);
        await loadContratos();
      } catch (error) {
        console.error('Error deleting contrato:', error);
        navigate('/500');
      }
    }
  };

  const handleEdit = (contrato) => {
    setCurrentContrato({
      id: contrato.id,
      fecha_inicio: contrato.fecha_inicio,
      fecha_fin: contrato.fecha_fin,
      activo: contrato.activo,
      paquete: contrato.paquete.id,
      cliente: contrato.cliente.id
    });
    setIsEditing(true);
  };

  // Modificar el formulario para incluir las validaciones
  return (
    <Container fluid className="p-4 bg-light mt-5">
      <Row className="mb-4">
        <Col xs={6}>
          <h2 className="m-0">{isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}</h2>
        </Col>
        <Col xs={6} className="text-end">
          <Button variant="primary" onClick={() => navigate('/')} size="sm">
            <i className="bi bi-arrow-left"></i> Volver al Inicio
          </Button>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-white">
              <h4 className="mb-0">Información del Contrato</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit} className="p-2">
                <Row className='d-flex flex-row'>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Inicio:</Form.Label>
                      <Form.Control
                        type="date"
                        value={currentContrato.fecha_inicio}
                        onChange={(e) => {
                          const startDate = e.target.value;
                          setCurrentContrato({
                            ...currentContrato,
                            fecha_inicio: startDate,
                            fecha_fin: calculateEndDate(startDate)
                          });
                        }}
                        min={getCurrentDate()}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fecha de Fin:</Form.Label>
                      <Form.Control
                        type="date"
                        value={currentContrato.fecha_fin}
                        disabled
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className='d-flex flex-row'>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cliente:</Form.Label>
                      <Form.Select
                        value={currentContrato.cliente}
                        onChange={(e) => setCurrentContrato({...currentContrato, cliente: e.target.value})}
                        required
                      >
                        <option value="">Seleccione un cliente</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id}>
                            {cliente.nombre} - RFC: {cliente.rfc}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Paquete:</Form.Label>
                      <Form.Select
                        value={currentContrato.paquete}
                        onChange={(e) => setCurrentContrato({...currentContrato, paquete: e.target.value})}
                        required
                      >
                        <option value="">Seleccione un paquete</option>
                        {paquetes.map(paquete => (
                          <option key={paquete.id} value={paquete.id}>
                            {paquete.nombre} - ${paquete.precio}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Contrato Activo"
                    checked={currentContrato.activo}
                    onChange={(e) => setCurrentContrato({...currentContrato, activo: e.target.checked})}
                  />
                </Form.Group>

                <div className="d-flex gap-2 justify-content-center mx-auto w-50">
                  <Button type="submit" variant="primary" size="sm">
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </Button>
                  {isEditing && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCurrentContrato({
                          fecha_inicio: '',
                          fecha_fin: '',
                          activo: true,
                          paquete: '',
                          cliente: ''
                        });
                        setIsEditing(false);
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Lista de Contratos</h4>
        </Card.Header>
        <Card.Body>
          <Row xs={1} md={2} lg={3} className="g-4">
            {contratos.map(contrato => (
              <Col key={contrato.id}>
                <Card className="h-100 shadow-sm">
                  <Card.Header>
                    <h5 className="mb-0">Contrato #{contrato.id.slice(0, 8)}</h5>
                  </Card.Header>
                  <Card.Body>
                    <Card.Text><strong>Cliente:</strong> {contrato.cliente.nombre}</Card.Text>
                    <Card.Text><strong>Paquete:</strong> {contrato.paquete.nombre}</Card.Text>
                    <Card.Text><strong>Fecha Inicio:</strong> {contrato.fecha_inicio}</Card.Text>
                    <Card.Text><strong>Fecha Fin:</strong> {contrato.fecha_fin}</Card.Text>
                    <Card.Text>
                      <strong>Estado:</strong>{' '}
                      <Badge bg={contrato.activo ? 'success' : 'secondary'}>
                        {contrato.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="d-flex gap-2 justify-content-end">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEdit(contrato)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(contrato.id)}
                    >
                      Eliminar
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Contratos;