import { useState } from 'react'

const LoginForm = ({ onLogin, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('') // Limpiar error al escribir
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setError('Todos los campos son obligatorios')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://backend-login-web.vercel.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        onLogin(data.usuario)
      } else {
        setError(data.mensaje || 'Error en el login')
      }
    } catch (error) {
      setError('Error de conexión. Verifica que el servidor esté funcionando.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </button>
      </form>

      <div className="switch-form">
        ¿No tienes cuenta?{' '}
        <button type="button" onClick={onSwitchToRegister}>
          Regístrate aquí
        </button>
      </div>
    </div>
  )
}

export default LoginForm