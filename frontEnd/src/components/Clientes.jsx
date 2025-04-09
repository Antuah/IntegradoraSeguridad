import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientesApi } from '../services/api';
import Swal from 'sweetalert2';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';

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
        telefono: currentCliente.telefono.replace(/\D/g, '')
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

      setCurrentCliente({
        nombre: '',
        direccion: '',
        rfc: '',
        telefono: ''
      });
      setIsEditing(false);
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

  const handleEdit = (cliente) => {
    setCurrentCliente(cliente);
    setIsEditing(true);
  };

  return (
    <Container fluid className="p-4 bg-light mt-5">
      <Row className="mb-4">
        <Col xs={6}>
          <h2 className="m-0">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
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
              <h4 className="mb-0">Información del Cliente</h4>
            </Card.Header>
            <Card.Body>
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

                <div className="d-flex gap-2 justify-content-center mt-3 mx-auto w-50">
                  <Button type="submit" variant="primary" size="sm">
                    {isEditing ? 'Actualizar' : 'Crear'}
                  </Button>
                  {isEditing && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setCurrentCliente({
                          nombre: '',
                          direccion: '',
                          rfc: '',
                          telefono: ''
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

      <h4 className="mb-4">Lista de Clientes</h4>
      <Row xs={1} md={2} lg={3} className="g-4">
        {clientes.map(cliente => (
          <Col key={cliente.id}>
            <Card className="h-100 shadow-sm">
              <Card.Header>
                <h5 className="mb-0">{cliente.nombre}</h5>
              </Card.Header>
              <Card.Body>
                <Card.Text><strong>RFC:</strong> {cliente.rfc}</Card.Text>
                <Card.Text><strong>Teléfono:</strong> {cliente.telefono}</Card.Text>
                <Card.Text><strong>Dirección:</strong> {cliente.direccion}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex gap-2 justify-content-end">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => handleEdit(cliente)}
                >
                  Editar
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => handleDelete(cliente.id)}
                >
                  Eliminar
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default Clientes;