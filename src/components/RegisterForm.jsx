import { useState } from 'react'

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const validateForm = () => {
    if (!formData.nombre || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Todos los campos son obligatorios')
      return false
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://backend-login-web.vercel.app/api/registro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Mostrar alerta de confirmación
        alert(`¡Usuario registrado exitosamente! 
Bienvenido ${data.usuario.nombre}. 
Ahora puedes iniciar sesión con tu email: ${data.usuario.email}`)
        
        // Limpiar el formulario
        setFormData({
          nombre: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        
        // Redirigir al login después de un breve delay
        setTimeout(() => {
          onSwitchToLogin()
        }, 1000)
      } else {
        setError(data.mensaje || 'Error en el registro')
      }
    } catch (error) {
      setError('Error de conexión. Verifica que el servidor esté funcionando.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">Nombre:</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>

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

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <div className="switch-form">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onSwitchToLogin}>
          Inicia sesión aquí
        </button>
      </div>
    </div>
  )
}

export default RegisterForm