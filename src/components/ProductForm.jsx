import { useState, useEffect } from 'react'
import '../styles/ProductForm.css'

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagen: '',
    categoria: 'Hamburguesas',
    activo: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const categorias = [
    'Hamburguesas',
    'Bebidas',
    'Acompañamientos',
    'Pollo',
    'Postres',
    'Ensaladas',
    'Electronica',
    'Otros'
  ]

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio || '',
        stock: product.stock || '',
        imagen: product.imagen || '',
        categoria: product.categoria || 'Hamburguesas',
        activo: product.activo !== undefined ? product.activo : true
      })
    }
  }, [product])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validaciones
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido')
      setLoading(false)
      return
    }

    if (!formData.precio || formData.precio <= 0) {
      setError('El precio debe ser mayor a 0')
      setLoading(false)
      return
    }

    if (!formData.stock || formData.stock < 0) {
      setError('El stock no puede ser negativo')
      setLoading(false)
      return
    }

    try {
      const url = product 
        ? `https://pedidos-backend-opal.vercel.app/api/products/${product._id}` 
        : 'https://pedidos-backend-opal.vercel.app/api/products'
      
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock)
        })
      })

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`)
      }

      const responseText = await response.text()
      if (!responseText) {
        throw new Error('Respuesta vacía del servidor')
      }

      const data = JSON.parse(responseText)

      if (response.ok) {
        onSubmit()
      } else {
        setError(data.message || 'Error al guardar el producto')
      }
    } catch (error) {
      console.error('Error al guardar producto:', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-form-overlay">
      <div className="product-form-modal">
        <div className="form-header">
          <h3>{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="info-message" style={{
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#4a5568',
            fontSize: '14px'
          }}>
            Los campos marcados con * son obligatorios. La imagen es opcional.
          </div>

          <div className="form-group">
            <label htmlFor="nombre">Nombre del Producto *</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ingresa el nombre del producto"
            />
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">Descripción *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows="3"
              required
              placeholder="Describe el producto"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="precio">Precio *</label>
              <input
                type="number"
                id="precio"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="categoria">Categoría *</label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              {categorias.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="imagen">URL de la Imagen</label>
            <input
              type="url"
              id="imagen"
              name="imagen"
              value={formData.imagen}
              onChange={handleChange}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {formData.imagen && (
              <div className="image-preview">
                <img 
                  src={formData.imagen} 
                  alt="Vista previa" 
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
              <span className="checkmark"></span>
              Producto activo
            </label>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={loading}
            >
              {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProductForm