import { useState, useEffect } from 'react';
import { canalesApi } from '../services/api';
import { Container, Row, Col, Form, Button, Card, Modal } from 'react-bootstrap';
import Swal from 'sweetalert2';

function Categorias() {
  const [showModal, setShowModal] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [currentCategoria, setCurrentCategoria] = useState({
    nombre: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentCategoria({ nombre: '' });
    setIsEditing(false);
  };

  const handleShowModal = () => {
    setCurrentCategoria({ nombre: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEdit = (categoria) => {
    setCurrentCategoria(categoria);
    setIsEditing(true);
    setShowModal(true);
  };

  useEffect(() => {
    loadCategorias();
  }, []);

  const loadCategorias = async () => {
    try {
      const response = await canalesApi.getCategorias();
      setCategorias(response.data);
    } catch (error) {
      console.error('Error loading categorias:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar las categorías'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentCategoria.nombre.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre de la categoría es requerido'
      });
      return;
    }

    try {
      const formData = {
        nombre: currentCategoria.nombre.trim()
      };

      if (isEditing) {
        await canalesApi.updateCategoria(currentCategoria.id, formData);
        Swal.fire({
          icon: 'success',
          title: 'Categoría actualizada correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      } else {
        await canalesApi.createCategoria(currentCategoria);
        Swal.fire({
          icon: 'success',
          title: 'Categoría creada correctamente',
          showConfirmButton: false,
          timer: 1500
        });
      }
      handleCloseModal();
      await loadCategorias();
    } catch (error) {
      console.error('Error saving categoria:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar la categoría'
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
        await canalesApi.deleteCategoria(id);
        await loadCategorias();
        Swal.fire(
          'Eliminado',
          'La categoría ha sido eliminada correctamente',
          'success'
        );
      }
    } catch (error) {
      console.error('Error deleting categoria:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar la categoría'
      });
    }
  };

  return (
    <Container fluid className="p-4 bg-light mt-5">
      <Row className="mb-4">
        <Col xs={12} className="text-center">
          <h2 className="mb-3">Gestión de Categorías</h2>
          <Button variant="primary" onClick={handleShowModal}>
            <i className="bi bi-plus-circle"></i> Crear Categoría
          </Button>
        </Col>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton  className="text-center">
          <Modal.Title className='w-100'>
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre de la Categoría:</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentCategoria.nombre}
                    onChange={(e) => setCurrentCategoria({ ...currentCategoria, nombre: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-center">
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
          <h4 className="mb-0">Lista de Categorías</h4>
        </Card.Header>
        <Card.Body className="py-4">
          <Row xs={1} md={2} lg={4} className="g-4">
            {categorias.map(categoria => (
              <Col key={categoria.id}>
                <Card className="h-100 shadow-sm border-0" style={{ backgroundColor: '#f8f9fa' }}>
                  <Card.Body className="d-flex flex-column align-items-center">
                    <i className="bi bi-tags-fill" style={{ fontSize: '2rem', color: '#007bff' }}></i> 
                    <Card.Title className="h5 mt-3 mb-3 text-center">{categoria.nombre}</Card.Title>
                    <div className="mt-auto d-flex justify-content-center gap-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        className="rounded-circle"
                        onClick={() => handleEdit(categoria)}
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
                        onClick={() => handleDelete(categoria.id)}
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

export default Categorias;
