import React, { useState, useEffect } from 'react';
import '../styles/AdminProductManager.css';
import ProductForm from './ProductForm';

const AdminProductManager = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [filters, setFilters] = useState({
    categoria: '',
    activo: '',
    search: ''
  })
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Construir parámetros de consulta con filtros
      const queryParams = new URLSearchParams()
      if (filters.categoria) queryParams.append('categoria', filters.categoria)
      if (filters.activo !== '') queryParams.append('activo', filters.activo)
      if (filters.search) queryParams.append('buscar', filters.search)
      
      const url = `https://pedidos-backend-opal.vercel.app/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Error al obtener productos: ${response.status}`)
      }
      
      const responseText = await response.text()
      if (!responseText) {
        throw new Error('Respuesta vacía del servidor')
      }
      
      const data = JSON.parse(responseText)
      
      console.log('Respuesta del servidor:', data) // Para debug
      
      // Verificar la estructura de respuesta del backend
      let productos = []
      if (data.success && data.data) {
        productos = data.data
      } else if (Array.isArray(data)) {
        productos = data
      } else if (data.productos) {
        productos = data.productos
      }
      
      console.log('Productos procesados:', productos) // Para debug
      setProducts(productos)
    } catch (error) {
      console.error('Error al obtener productos:', error)
      setError('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://pedidos-backend-opal.vercel.app/api/products/categories')
      
      if (!response.ok) {
        throw new Error(`Error al obtener categorías: ${response.status}`)
      }
      
      const responseText = await response.text()
      if (!responseText) {
        throw new Error('Respuesta vacía del servidor para categorías')
      }
      
      const data = JSON.parse(responseText)
      
      // Verificar la estructura de respuesta del backend
      let categorias = []
      if (data.success && data.data) {
        categorias = data.data
      } else if (Array.isArray(data)) {
        categorias = data
      } else if (data.categorias) {
        categorias = data.categorias
      }
      
      setCategories(categorias)
    } catch (error) {
      console.error('Error al obtener categorías:', error)
    }
  }

  const handleCreateProduct = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return
    }

    try {
      const response = await fetch(`https://pedidos-backend-opal.vercel.app/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      if (responseText) {
        try {
          const data = JSON.parse(responseText)
          if (!data.success) {
            throw new Error(data.message || 'Error al eliminar producto')
          }
        } catch (parseError) {
          // Si no es JSON válido pero la respuesta fue exitosa, continuar
          console.log('Respuesta no es JSON válido, pero eliminación exitosa')
        }
      }

      fetchProducts()
    } catch (error) {
      console.error('Error al eliminar producto:', error)
      alert('Error al eliminar producto: ' + error.message)
    }
  }

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const response = await fetch(`https://pedidos-backend-opal.vercel.app/api/products/${productId}/toggle-activo`, {
        method: 'PATCH'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const responseText = await response.text()
      if (!responseText) {
        throw new Error('Respuesta vacía del servidor')
      }

      const data = JSON.parse(responseText)
      fetchProducts()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      alert('Error al cambiar estado del producto: ' + error.message)
    }
  }

  const handleUpdateStock = async (productId, newStock) => {
    try {
      const response = await fetch(`https://pedidos-backend-opal.vercel.app/api/products/${productId}/stock`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: newStock })
      })

      if (response.ok) {
        fetchProducts()
      } else {
        const data = await response.json()
        alert(data.message || 'Error al actualizar stock')
      }
    } catch (error) {
      console.error('Error al actualizar stock:', error)
      alert('Error de conexión')
    }
  }

  const handleFormSubmit = () => {
    setShowForm(false)
    setEditingProduct(null)
    fetchProducts()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return <div className="loading">Cargando productos...</div>
  }

  return (
    <div className="admin-product-manager">
      <div className="manager-header">
        <h2>Gestión de Productos</h2>
        <button className="btn-primary" onClick={handleCreateProduct}>
          ➕ Nuevo Producto
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id} className={!product.activo ? 'inactive' : ''}>
                <td>
                  <img 
                    src={product.imagen || 'https://via.placeholder.com/50x50/667eea/ffffff?text=IMG'} 
                    alt={product.nombre}
                    className="product-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/50x50/667eea/ffffff?text=IMG'
                    }}
                  />
                </td>
                <td>
                  <div className="product-name">
                    {product.nombre}
                    {product.descripcion && (
                      <small>{product.descripcion.substring(0, 50)}...</small>
                    )}
                  </div>
                </td>
                <td>{product.categoria}</td>
                <td>${product.precio.toLocaleString()}</td>
                <td>
                  <div className="stock-control">
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => handleUpdateStock(product._id, parseInt(e.target.value))}
                      className="stock-input"
                      min="0"
                    />
                  </div>
                </td>
                <td>
                  <span className={`status ${product.activo ? 'active' : 'inactive'}`}>
                    {product.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEditProduct(product)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className={`btn-toggle ${product.activo ? 'deactivate' : 'activate'}`}
                      onClick={() => handleToggleActive(product._id, product.activo)}
                      title={product.activo ? 'Desactivar' : 'Activar'}
                    >
                      {product.activo ? '🔒' : '🔓'}
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteProduct(product._id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="no-products">
            No se encontraron productos con los filtros aplicados.
          </div>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  )
}

export default AdminProductManager