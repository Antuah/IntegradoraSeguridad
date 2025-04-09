import { useState, useEffect } from 'react';
import { canalesApi } from '../services/api';
import { Container, Row, Col, Form, Button, Card, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';

function Canales() {
  const [showModal, setShowModal] = useState(false);
  const [canales, setCanales] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [currentCanal, setCurrentCanal] = useState({
    nombre: '',
    categoria: '',
    imagen_url: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCanal({
      nombre: '',
      categoria: '',
      imagen_url: ''
    });
    setIsEditing(false);
  };

  useEffect(() => {
    loadCanales();
    loadCategorias();
  }, []);

  const loadCanales = async () => {
    try {
      const response = await canalesApi.getCanales();
      console.log('Canales response:', response.data); 
      setCanales(response.data);
    } catch (error) {
      console.error('Error loading canales:', error);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await canalesApi.getCategorias();
      console.log('Categorias response:', response.data); 
      setCategorias(response.data);
    } catch (error) {
      console.error('Error loading categorias:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        nombre: currentCanal.nombre,
        categoria: currentCanal.categoria,
        imagen_url: currentCanal.imagen_url
      };

      if (isEditing) {
        await canalesApi.updateCanal(currentCanal.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Canal actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        await canalesApi.createCanal(formData);
        Swal.fire({
          icon: 'success',
          title: 'Canal creado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      }
      handleCloseModal();
      await loadCanales();
    } catch (error) {
      console.error('Error saving canal:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al guardar el canal',
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: '¿Está seguro?',
        text: "Esta acción no se puede revertir",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await canalesApi.deleteCanal(id);
        await loadCanales();
        Swal.fire(
          'Eliminado',
          'El canal ha sido eliminado correctamente',
          'success'
        );
      }
    } catch (error) {
      console.error('Error deleting canal:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un error al eliminar el canal',
      });
    }
  };

  const handleEdit = (canal) => {
    setCurrentCanal({
      id: canal.id,
      nombre: canal.nombre,
      categoria: canal.categoria,
      imagen_url: canal.imagen_url || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const handleShowModal = () => {
    setCurrentCanal({
      nombre: '',
      categoria: '',
      imagen_url: ''
    });
    setIsEditing(false);
    setShowModal(true);
  };

  return (
    <Container fluid className="p-4 bg-light mt-5">
      <Row className="mb-4">
        <Col xs={12} className="text-center">
          <h2 className="mb-3">Gestión de Canales</h2>
          <Button variant="primary" onClick={handleShowModal}>
            <i className="bi bi-plus-circle"></i> Crear Canal
          </Button>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton className="text-center">
          <Modal.Title className="w-100">
            {isEditing ? 'Editar Canal' : 'Nuevo Canal'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentCanal.nombre}
                    onChange={(e) => setCurrentCanal({...currentCanal, nombre: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>Categoría:</Form.Label>
                  <Form.Select
                    value={currentCanal.categoria}
                    onChange={(e) => setCurrentCanal({...currentCanal, categoria: e.target.value})}
                    required
                  >
                    <option value="">Seleccione una categoría</option>
                    {categorias.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12} className="mb-3">
                <Form.Group>
                  <Form.Label>URL de la imagen:</Form.Label>
                  <Form.Control
                    type="url"
                    value={currentCanal.imagen_url}
                    onChange={(e) => setCurrentCanal({...currentCanal, imagen_url: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center mt-4 mx-auto">
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
          <h4 className="mb-0">Lista de Canales</h4>
        </Card.Header>
        <Card.Body className="py-4">
          <Row xs={1} md={2} lg={4} className="g-4">
            {canales.map(canal => (
              <Col key={canal.id}>
                <Card className="h-100 shadow-sm hover-card" style={{ borderRadius: '10px', overflow: 'hidden' }}>
                  <div className="position-relative">
                    <Card.Img 
                      variant="top" 
                      src={canal.imagen_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
                      alt={canal.nombre}
                      style={{ 
                        height: '180px', 
                        objectFit: 'cover',
                        borderBottom: '1px solid rgba(0,0,0,0.1)'
                      }}
                    />
                    <div className="channel-overlay" style={{ position: 'absolute', bottom: '0', width: '100%', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '10px', textAlign: 'center' }}>
                      <h5 className="channel-name mb-0">{canal.nombre}</h5>
                    </div>
                  </div>
                  <Card.Body className="d-flex flex-column" style={{ backgroundColor: '#f8f9fa' }}>
                    <Card.Text className="text-muted mb-3">
                      <i className="bi bi-tag-fill me-2"></i>
                      {categorias.find(cat => cat.id === canal.categoria)?.nombre || 'Sin categoría'}
                    </Card.Text>
                    <div className="mt-auto d-flex justify-content-end gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="rounded-circle"
                        onClick={() => handleEdit(canal)}
                        style={{ 
                          width: '35px', 
                          height: '35px', 
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        className="rounded-circle"
                        onClick={() => handleDelete(canal.id)}
                        style={{ 
                          width: '35px', 
                          height: '35px', 
                          padding: '0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Canales;