import { useState, useEffect } from 'react'
import '../styles/SalesTable.css'

const SalesTable = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    estado: '',
    fechaDesde: '',
    fechaHasta: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const estados = [
    'pendiente',
    'confirmado',
    'enviado',
    'entregado',
    'cancelado'
  ]

  useEffect(() => {
    fetchOrders()
  }, [filters, pagination.page])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      
      queryParams.append('page', pagination.page)
      queryParams.append('limit', pagination.limit)
      
      if (filters.estado) queryParams.append('estado', filters.estado)
      if (filters.fechaDesde) queryParams.append('fechaDesde', filters.fechaDesde)
      if (filters.fechaHasta) queryParams.append('fechaHasta', filters.fechaHasta)
      if (filters.search) queryParams.append('search', filters.search)
      
      const url = `https://pedidos-backend-opal.vercel.app/api/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Error al obtener órdenes: ${response.status}`)
      }
      
      const responseText = await response.text()
      if (!responseText) {
        throw new Error('Respuesta vacía del servidor')
      }
      
      const data = JSON.parse(responseText)
      
      console.log('Respuesta del servidor (orders):', data) // Para debug
      
      // Verificar la estructura de respuesta del backend
      let ordenes = []
      if (data.success && data.data) {
        ordenes = data.data
      } else if (Array.isArray(data)) {
        ordenes = data
      } else if (data.ordenes) {
        ordenes = data.ordenes
      }
      
      console.log('Órdenes procesadas:', ordenes) // Para debug
      
      setOrders(ordenes)
      
      // Manejar paginación
      if (data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: data.pagination.totalItems || 0,
          totalPages: data.pagination.totalPages || 0
        }))
      } else {
        setPagination(prev => ({
          ...prev,
          total: data.total || ordenes.length,
          totalPages: data.totalPages || Math.ceil(ordenes.length / pagination.limit)
        }))
      }
    } catch (error) {
      console.error('Error al obtener pedidos:', error)
      setError('Error al cargar los pedidos')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`https://pedidos-backend-opal.vercel.app/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: newStatus })
      })

      if (response.ok) {
        fetchOrders()
      } else {
        const data = await response.json()
        alert(data.message || 'Error al actualizar estado')
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
      alert('Error de conexión')
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      pendiente: '#ffa500',
      confirmado: '#2196f3',
      enviado: '#9c27b0',
      entregado: '#4caf50',
      cancelado: '#f44336'
    }
    return colors[status] || '#666'
  }

  if (loading) {
    return <div className="loading">Cargando pedidos...</div>
  }

  return (
    <div className="sales-table">
      <div className="table-header">
        <h2>Ventas y Pedidos</h2>
        <div className="table-stats">
          <span>Total: {pagination.total} pedidos</span>
        </div>
      </div>

      <div className="filters-section">
        <div className="filters">
          <input
            type="text"
            placeholder="Buscar por usuario o ID..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
          
          <select
            value={filters.estado}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            {estados.map(estado => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
          
          <input
            type="date"
            value={filters.fechaDesde}
            onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
            className="date-input"
            placeholder="Desde"
          />
          
          <input
            type="date"
            value={filters.fechaHasta}
            onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
            className="date-input"
            placeholder="Hasta"
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Método Pago</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>
                  <span className="order-id">#{order._id.slice(-8)}</span>
                </td>
                <td>
                  <div className="user-info">
                    <strong>{order.usuario?.nombre || 'Usuario'}</strong>
                    <small>{order.usuario?.email}</small>
                  </div>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <div className="products-summary">
                    <span className="products-count">{order.items.length} productos</span>
                    <div className="products-detail">
                      {order.items.map((item, index) => (
                        <div key={index} className="product-item">
                          {item.nombre} x{item.cantidad}
                        </div>
                      ))}
                    </div>
                  </div>
                </td>
                <td>
                  <span className="order-total">${order.total.toLocaleString()}</span>
                </td>
                <td>
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.estado) }}
                  >
                    {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                  </span>
                </td>
                <td>{order.metodoPago || 'No especificado'}</td>
                <td>
                  <div className="actions">
                    <select
                      value={order.estado}
                      onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                      className="status-select"
                    >
                      {estados.map(estado => (
                        <option key={estado} value={estado}>
                          {estado.charAt(0).toUpperCase() + estado.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && !loading && (
          <div className="no-orders">
            No se encontraron pedidos con los filtros aplicados.
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            ← Anterior
          </button>
          
          <span className="pagination-info">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="pagination-btn"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}

export default SalesTable