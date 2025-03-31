import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './components/Index';
import Canales from './components/Canales';
import Categorias from './components/Categorias';
import './App.css';

// Add this import
import Paquetes from './components/Paquetes';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/canales" element={<Canales />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/paquetes" element={<Paquetes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
