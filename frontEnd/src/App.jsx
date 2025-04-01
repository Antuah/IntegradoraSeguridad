import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './components/Index';
import Canales from './components/Canales';
import Categorias from './components/Categorias';
import Paquetes from './components/Paquetes';
import Clientes from './components/Clientes';
import Contratos from './components/Contratos';
import NotFound from './components/NotFound';
import ServerError from './components/ServerError';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/canales" element={<Canales />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/paquetes" element={<Paquetes />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/contratos" element={<Contratos />} />
          <Route path="/500" element={<ServerError />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
