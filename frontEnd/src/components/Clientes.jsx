import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../services/api';
import Swal from 'sweetalert2';
import { Container, Row, Col, Form, Button, Card, Modal, Table } from 'react-bootstrap';

function Clientes() {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [currentCliente, setCurrentCliente] = useState({
    nombre: '',
    direccion: '',
    rfc: '',
    telefono: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      const response = await clientesApi.getClientes();
      setClientes(response.data);
    } catch (error) {
      console.error('Error loading clientes:', error);
      navigate('/500');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,255}$/;
      if (!nombreRegex.test(currentCliente.nombre.trim())) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'El nombre solo debe contener letras y espacios (mínimo 2 caracteres)'
        });
        return;
      }

      if (currentCliente.direccion.trim().length < 5) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'La dirección debe tener al menos 5 caracteres'
        });
        return;
      }

      const clienteData = {
        nombre: currentCliente.nombre.trim(),
        direccion: currentCliente.direccion.trim(),
        rfc: currentCliente.rfc.trim().toUpperCase(),
        telefono: String(currentCliente.telefono).replace(/\D/g, '') 
      };

      const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(clienteData.rfc)) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'Por favor, ingrese un RFC válido'
        });
        return;
      }

      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(clienteData.telefono)) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'El teléfono debe contener exactamente 10 dígitos'
        });
        return;
      }

      if (isEditing) {
        await clientesApi.updateCliente(currentCliente.id, clienteData);
      } else {
        await clientesApi.createCliente(clienteData);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: isEditing ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente'
      });

      handleCloseModal(); 
      await loadClientes();
    } catch (error) {
      console.error('Error saving cliente:', error);
      if (error.response) {
        const errorMessage = error.response.data?.detail || 
                           'Error al guardar el cliente. Por favor, verifique los datos.';
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage
        });
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error de conexión. Por favor, inténtelo de nuevo más tarde.'
        });
        navigate('/500');
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Desea eliminar este cliente?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await clientesApi.deleteCliente(id);
        await loadClientes();
        await Swal.fire(
          'Eliminado',
          'El cliente ha sido eliminado correctamente',
          'success'
        );
      } catch (error) {
        console.error('Error deleting cliente:', error);
        navigate('/500');
      }
    }
  };

  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCliente({
      nombre: '',
      direccion: '',
      rfc: '',
      telefono: ''
    });
    setIsEditing(false);
  };

  const handleShowModal = () => setShowModal(true);

  const handleEdit = (cliente) => {
    setCurrentCliente(cliente);
    setIsEditing(true);
    setShowModal(true);
  };

  return (
    <Container fluid className="p-4 bg-light mt-5">
      <Row className="mb-4">
        <Col xs={12} className="text-center">
          <h2 className="mb-3">Gestión de Clientes</h2>
          <Button variant="primary" onClick={handleShowModal}>
            <i className="bi bi-plus-circle"></i> Crear Cliente
          </Button>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className='text-center'>
          <Modal.Title className='w-100'>{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 d-flex flex-row">
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentCliente.nombre}
                    onChange={(e) => setCurrentCliente({...currentCliente, nombre: e.target.value})}
                    required
                    maxLength={255}
                    pattern="^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,255}$"
                    title="El nombre solo debe contener letras y espacios (mínimo 2 caracteres)"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>RFC:</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentCliente.rfc}
                    onChange={(e) => setCurrentCliente({...currentCliente, rfc: e.target.value.toUpperCase()})}
                    required
                    maxLength={13}
                    pattern="^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$"
                    title="Formato RFC válido: AAAA123456ABC o AAA123456ABC"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>Teléfono:</Form.Label>
                  <Form.Control
                    type="tel"
                    value={currentCliente.telefono}
                    onChange={(e) => setCurrentCliente({...currentCliente, telefono: e.target.value.replace(/\D/g, '')})}
                    required
                    pattern="[0-9]{10}"
                    title="El teléfono debe contener exactamente 10 dígitos"
                    maxLength={10}
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>Dirección:</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={currentCliente.direccion}
                    onChange={(e) => setCurrentCliente({...currentCliente, direccion: e.target.value})}
                    required
                    minLength={5}
                    maxLength={500}
                    rows={2}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-center mt-3 mx-auto">
              <Button 
                type="submit" 
                variant="primary" 
                size='sm'
                style={{ width: '150px' }}
              >
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
              {isEditing && (
                <Button 
                  variant="secondary" 
                  size='sm'
                  style={{ width: '100px', marginLeft: '10px' }}
                  onClick={handleCloseModal} 
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
          <h4 className="mb-0">Lista de Clientes</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className="text-center">Nombre</th>
                <th className="text-center">RFC</th>
                <th className="text-center">Teléfono</th>
                <th className="text-center">Dirección</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td className="text-center">{cliente.nombre}</td>
                  <td className="text-center">{cliente.rfc}</td>
                  <td className="text-center">{cliente.telefono}</td>
                  <td className="text-center">{cliente.direccion}</td>
                  <td className="d-flex justify-content-center gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEdit(cliente)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(cliente.id)}
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

export default Clientes;