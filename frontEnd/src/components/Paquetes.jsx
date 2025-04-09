import { useState, useEffect } from 'react';
import { paquetesApi, canalesApi } from '../services/api';
import { Container, Row, Col, Form, Button, Card, Modal, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';

function Paquetes() {
  const [showModal, setShowModal] = useState(false);
  const [paquetes, setPaquetes] = useState([]);
  const [canales, setCanales] = useState([]);
  const [currentPaquete, setCurrentPaquete] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    velocidad_internet: '',
    incluye_telefonia: false,
    canales: [],
    imagen_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadPaquetes();
    loadCanales();
  }, []);

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentPaquete({
      nombre: '',
      descripcion: '',
      precio: '',
      velocidad_internet: '',
      incluye_telefonia: false,
      canales: [],
      imagen_url: ''
    });
    setIsEditing(false);
  };

  const handleShowModal = () => setShowModal(true);

  
  const handleEdit = (paquete) => {
    setCurrentPaquete({
      id: paquete.id,
      nombre: paquete.nombre,
      descripcion: paquete.descripcion,
      precio: paquete.precio,
      velocidad_internet: paquete.velocidad_internet,
      incluye_telefonia: paquete.incluye_telefonia,
      canales: paquete.canales.map(canal => canal.id),
      imagen_url: paquete.imagen_url
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const loadCanales = async () => {
    try {
      const response = await canalesApi.getCanales();
      setCanales(response.data);
    } catch (error) {
      console.error('Error loading canales:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los canales'
      });
    }
  };

  const loadPaquetes = async () => {
    try {
      const response = await paquetesApi.getPaquetes();
      setPaquetes(response.data);
    } catch (error) {
      console.error('Error loading paquetes:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los paquetes'
      });
    }
  };

  const handleCanalChange = (canalId) => {
    const updatedCanales = currentPaquete.canales.includes(canalId)
      ? currentPaquete.canales.filter(id => id !== canalId)
      : [...currentPaquete.canales, canalId];
    
    setCurrentPaquete({
      ...currentPaquete,
      canales: updatedCanales
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!currentPaquete.nombre.trim()) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'El nombre es requerido'
        });
        return;
      }

      if (!currentPaquete.velocidad_internet.trim()) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'La velocidad de internet es requerida'
        });
        return;
      }

      if (!currentPaquete.precio || currentPaquete.precio <= 0 || !Number.isInteger(parseFloat(currentPaquete.precio))) {
        await Swal.fire({
          icon: 'error',
          title: 'Error de validación',
          text: 'El precio debe ser un número entero positivo mayor a 0'
        });
        return;
      }

      const formData = {
        nombre: currentPaquete.nombre.trim(),
        descripcion: currentPaquete.descripcion.trim(),
        precio: parseFloat(currentPaquete.precio),
        velocidad_internet: currentPaquete.velocidad_internet.trim(),
        incluye_telefonia: currentPaquete.incluye_telefonia,
        canales_ids: currentPaquete.canales,
        imagen_url: currentPaquete.imagen_url.trim()
      };

      if (isEditing) {
        await paquetesApi.updatePaquete(currentPaquete.id, formData);
      } else {
        await paquetesApi.createPaquete(formData);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: isEditing ? 'Paquete actualizado correctamente' : 'Paquete creado correctamente'
      });

      handleCloseModal();
      await loadPaquetes();
    } catch (error) {
      console.error('Error saving paquete:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.detail || 'Error al guardar el paquete'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Desea eliminar este paquete?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await paquetesApi.deletePaquete(id);
        await loadPaquetes();
        await Swal.fire(
          'Eliminado',
          'El paquete ha sido eliminado correctamente',
          'success'
        );
      } catch (error) {
        console.error('Error deleting paquete:', error);
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al eliminar el paquete'
        });
      }
    }
  };

  return (
    <Container fluid className="p-4 bg-light mt-5">
      <Row className="mb-4">
        <Col xs={12} className="text-center">
          <h2 className="mb-3">Gestión de Paquetes</h2>
          <Button variant="primary" onClick={handleShowModal}>
            <i className="bi bi-plus-circle"></i> Crear Paquete
          </Button>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className='text-center'>
          <Modal.Title className='w-100'>{isEditing ? 'Editar Paquete' : 'Nuevo Paquete'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 d-flex flex-row">
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentPaquete.nombre}
                    onChange={(e) => setCurrentPaquete({...currentPaquete, nombre: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>Velocidad de Internet:</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentPaquete.velocidad_internet}
                    onChange={(e) => setCurrentPaquete({...currentPaquete, velocidad_internet: e.target.value})}
                    placeholder="Ej: 100 Mbps"
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>URL de la imagen:</Form.Label>
                  <Form.Control
                    type="url"
                    value={currentPaquete.imagen_url}
                    onChange={(e) => setCurrentPaquete({...currentPaquete, imagen_url: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </Form.Group>
              </Col>
              <Col xs={12} sm={6}>
                <Form.Group>
                  <Form.Label>Precio:</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={currentPaquete.precio}
                    onChange={(e) => setCurrentPaquete({...currentPaquete, precio: e.target.value})}
                    required
                    style={{ appearance: 'textfield' }} 
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Check
                  type="checkbox"
                  label="Incluye Telefonía"
                  checked={currentPaquete.incluye_telefonia}
                  onChange={(e) => setCurrentPaquete({...currentPaquete, incluye_telefonia: e.target.checked})}
                />
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Canales:</Form.Label>
                  <div className="d-flex flex-wrap gap-3">
                    {canales.map(canal => (
                      <Form.Check
                        key={canal.id}
                        type="checkbox"
                        id={`canal-${canal.id}`}
                        label={canal.nombre}
                        checked={currentPaquete.canales.includes(canal.id)}
                        onChange={() => handleCanalChange(canal.id)}
                      />
                    ))}
                  </div>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Descripción:</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={currentPaquete.descripcion}
                    onChange={(e) => setCurrentPaquete({...currentPaquete, descripcion: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center mt-3">
              <Button 
                type="submit" 
                size='sm'
                variant="primary"
                style={{ width: '150px', marginRight: '10px' }} 
              >
                {isEditing ? 'Actualizar' : 'Crear'}
              </Button>
              {isEditing && (
                <Button 
                  variant="secondary" 
                  size='sm'
                  style={{ width: '100px' }} 
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
          <h4 className="mb-0">Lista de Paquetes</h4>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th className="text-center">Nombre</th>
                <th className="text-center">Velocidad</th>
                <th className="text-center">Telefonía</th>
                <th className="text-center">Precio</th>
                <th className="text-center">Descripción</th>
                <th className="text-center">Imagen</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paquetes.map(paquete => (
                <tr key={paquete.id}>
                  <td className="text-center">{paquete.nombre}</td>
                  <td className="text-center">{paquete.velocidad_internet}</td>
                  <td className="text-center">{paquete.incluye_telefonia ? 'Sí' : 'No'}</td>
                  <td className="text-center">${paquete.precio}</td>
                  <td className="text-center">{paquete.descripcion}</td>
                  <td className="text-center">
                    <img 
                      src={paquete.imagen_url} 
                      alt={paquete.nombre} 
                      style={{ width: '30px', height: 'auto' }} 
                    />
                  </td>
                  <td className="d-flex justify-content-center gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleEdit(paquete)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(paquete.id)}
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

export default Paquetes;