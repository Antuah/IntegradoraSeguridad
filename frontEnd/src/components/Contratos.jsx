import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contratosApi, clientesApi, paquetesApi } from '../services/api';
import Swal from 'sweetalert2';
import { Container, Row, Col, Form, Button, Card, Badge, Modal, Table } from 'react-bootstrap';

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
  const [showModal, setShowModal] = useState(false);

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

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const calculateEndDate = (startDate) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0]; 
      const startDateStr = currentContrato.fecha_inicio; 

      if (startDateStr < todayStr) {
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
      setShowModal(false); // Close modal after submit
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
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Desea eliminar este contrato?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await contratosApi.deleteContrato(id);
        await loadContratos();
        await Swal.fire(
          'Eliminado',
          'El contrato ha sido eliminado correctamente',
          'success'
        );
      } catch (error) {
        console.error('Error deleting contrato:', error);
        navigate('/500');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentContrato({
      fecha_inicio: '',
      fecha_fin: '',
      activo: true,
      paquete: '',
      cliente: ''
    });
    setIsEditing(false);
  };

  const handleShowModal = () => setShowModal(true);

  // Modify handleEdit
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
    setShowModal(true);
  };

  const handleCancelEdit = () => {
    setShowModal(false); 
    setCurrentContrato({
      fecha_inicio: '',
      fecha_fin: '',
      activo: true,
      paquete: '',
      cliente: ''
    });
    setIsEditing(false);
  };

  return (
    <Container fluid className="p-4 bg-light mt-5">
      <Row className="mb-4">
        <Col xs={12} className="text-center">
          <h2 className="mb-3">Gestión de Contratos</h2>
          <Button variant="primary" onClick={handleShowModal}>
            <i className="bi bi-plus-circle"></i> Crear Contrato
          </Button>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className='text-center'>
          <Modal.Title className='w-100'>{isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit} className="p-2">
            <Row className='d-flex flex-row'>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha de Inicio:</Form.Label>
                  <div className="position-relative">
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
                      id="fecha_inicio"
                    />
                    <i 
                      className="bi bi-calendar position-absolute top-50 end-0 translate-middle-y me-2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => document.getElementById('fecha_inicio').showPicker()}
                    ></i>
                  </div>
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

            <div className="d-flex gap-2 justify-content-center mx-auto">
              <Button type="submit" variant="primary" size="sm" style={{width:'150px'}}>
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
              {isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelEdit} 
                >
                  Cancelar
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Lista de Contratos</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className="text-center">Cliente</th>
                <th className="text-center">Paquete</th>
                <th className="text-center">Fecha Inicio</th>
                <th className="text-center">Fecha Fin</th>
                <th className="text-center">Estado</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map(contrato => (
                <tr key={contrato.id}>
                  <td className="text-center">{contrato.cliente.nombre}</td>
                  <td className="text-center">{contrato.paquete.nombre}</td>
                  <td className="text-center">{contrato.fecha_inicio}</td>
                  <td className="text-center">{contrato.fecha_fin}</td>
                  <td className="text-center">
                    <Badge bg={contrato.activo ? 'success' : 'secondary'}>
                      {contrato.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="d-flex justify-content-center gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEdit(contrato)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(contrato.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Contratos;