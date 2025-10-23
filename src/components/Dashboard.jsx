import { useState } from 'react'
import AdminProductManager from './AdminProductManager'
import SalesTable from './SalesTable'
import AdminStats from './AdminStats'
import '../styles/Dashboard.css'

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>Bienvenido, {user.nombre || user.email}</h1>
          <button onClick={onLogout} className="logout-btn">
            CERRAR SESIÓN
          </button>
        </div>
      </header>

      <nav className="admin-nav">
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          DASHBOARD
        </button>
        <button 
          className={`nav-btn ${activeTab === 'productos' ? 'active' : ''}`}
          onClick={() => setActiveTab('productos')}
        >
          PRODUCTOS
        </button>
        <button 
          className={`nav-btn ${activeTab === 'ventas' ? 'active' : ''}`}
          onClick={() => setActiveTab('ventas')}
        >
          PEDIDOS
        </button>
      </nav>

      <main className="admin-content">
        {activeTab === 'dashboard' && <AdminStats />}
        {activeTab === 'productos' && <AdminProductManager />}
        {activeTab === 'ventas' && <SalesTable />}
      </main>
    </div>
  )
}

export default Dashboard