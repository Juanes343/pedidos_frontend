import { useState, useEffect } from 'react'
import '../styles/AdminStats.css'

const AdminStats = () => {
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalProductos: 0,
    totalOrdenes: 0,
    productosActivos: 0,
    ordenesHoy: 0,
    ventasHoy: 0,
    ventasMes: 0,
    productosMasVendidos: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Obtener productos
      const productsResponse = await fetch('https://pedidos-backend-opal.vercel.app/api/products')
      
      if (!productsResponse.ok) {
        throw new Error(`Error al obtener productos: ${productsResponse.status}`)
      }
      
      const productsText = await productsResponse.text()
      if (!productsText) {
        throw new Error('Respuesta vacía del servidor para productos')
      }
      
      const productsData = JSON.parse(productsText)
      
      // Obtener órdenes
      const ordersResponse = await fetch('https://pedidos-backend-opal.vercel.app/api/orders')
      
      if (!ordersResponse.ok) {
        throw new Error(`Error al obtener órdenes: ${ordersResponse.status}`)
      }
      
      const ordersText = await ordersResponse.text()
      if (!ordersText) {
        throw new Error('Respuesta vacía del servidor para órdenes')
      }
      
      const ordersData = JSON.parse(ordersText)
      
      // Calcular estadísticas
      // Verificar la estructura de respuesta del backend
      let productos = []
      if (productsData.success && productsData.data) {
        productos = productsData.data
      } else if (Array.isArray(productsData)) {
        productos = productsData
      } else if (productsData.productos) {
        productos = productsData.productos
      }
      
      let ordenes = []
      if (ordersData.success && ordersData.data) {
        ordenes = ordersData.data
      } else if (Array.isArray(ordersData)) {
        ordenes = ordersData
      } else if (ordersData.ordenes) {
        ordenes = ordersData.ordenes
      }
      
      const productosActivos = productos.filter(p => p.activo).length
      const totalProductos = productos.length
      const totalOrdenes = ordenes.length
      
      // Calcular ventas del mes actual
      const fechaActual = new Date()
      const inicioMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1)
      
      const ordenesDelMes = ordenes.filter(orden => {
        const fechaOrden = new Date(orden.createdAt)
        return fechaOrden >= inicioMes && orden.estado !== 'cancelado'
      })
      
      const ventasMes = ordenesDelMes.reduce((total, orden) => total + (orden.total || 0), 0)
      
      // Calcular ventas de hoy
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      const manana = new Date(hoy)
      manana.setDate(manana.getDate() + 1)
      
      const ordenesHoy = ordenes.filter(orden => {
        const fechaOrden = new Date(orden.createdAt)
        return fechaOrden >= hoy && fechaOrden < manana && orden.estado !== 'cancelado'
      })
      
      const ventasHoy = ordenesHoy.reduce((total, orden) => total + (orden.total || 0), 0)
      
      setStats({
        totalProductos,
        productosActivos,
        totalOrdenes,
        ordenesHoy: ordenesHoy.length,
        ventasHoy,
        ventasMes,
        totalUsuarios: 0 // Por ahora no tenemos endpoint de usuarios
      })
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      setError('Error al cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-stats">
        <div className="loading">Cargando estadísticas...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-stats">
        <div className="error-message">{error}</div>
        <button onClick={fetchStats} className="retry-button">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="admin-stats">
      <div className="stats-grid">
        <div className="stat-card dashboard-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">DASHBOARD</div>
            <div className="stat-description">Panel Principal</div>
          </div>
        </div>

        <div className="stat-card products-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-label">PRODUCTOS</div>
            <div className="stat-value">{stats.totalProductos}</div>
            <div className="stat-description">{stats.productosActivos} activos</div>
          </div>
        </div>

        <div className="stat-card orders-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-label">PEDIDOS</div>
            <div className="stat-value">{stats.totalOrdenes}</div>
            <div className="stat-description">{stats.ordenesHoy} hoy</div>
          </div>
        </div>
      </div>

      <div className="stats-summary">
        <div className="summary-card">
          <h3>Resumen del Sistema</h3>
          <div className="summary-stats">
            <div className="summary-item">
              <span className="summary-label">Total Productos:</span>
              <span className="summary-value">{stats.totalProductos}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Productos Activos:</span>
              <span className="summary-value">{stats.productosActivos}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Órdenes:</span>
              <span className="summary-value">{stats.totalOrdenes}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Órdenes Hoy:</span>
              <span className="summary-value">{stats.ordenesHoy}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Ventas Hoy:</span>
              <span className="summary-value">${stats.ventasHoy.toFixed(2)}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Ventas del Mes:</span>
              <span className="summary-value">${stats.ventasMes.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminStats