import NavBar from "./NavBar";
import Sidebar from "./Sidebar";

function Prueba() {
  return (
    <div className="vh-100 d-flex flex-column">
      <NavBar />

      <div className="d-flex flex-grow-1 overflow-hidden">
        <Sidebar />
        
        <div className="flex-grow-1 p-3 overflow-auto">
          <h1>Contenido Principal</h1>
          <p>Este es el contenido de la página.</p>
        </div>
      </div>
    </div>
  );
}
export default Prueba;