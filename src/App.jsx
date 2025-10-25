import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import Dashboard from './components/Dashboard'

function App() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'register', 'dashboard'
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario logueado en localStorage
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setCurrentView('dashboard')
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    setCurrentView('login')
  }

  const switchToRegister = () => {
    setCurrentView('register')
  }

  const switchToLogin = () => {
    setCurrentView('login')
  }

  if (loading) {
    return (
      <div className="auth-container">
        <div className="container">
          <div className="form-container">
            <h2>Cargando...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {currentView === 'login' && (
        <div className="auth-container">
          <div className="container">
            <LoginForm 
              onLogin={handleLogin} 
              onSwitchToRegister={switchToRegister}
            />
          </div>
        </div>
      )}
      
      {currentView === 'register' && (
        <div className="auth-container">
          <div className="container">
            <RegisterForm 
              onSwitchToLogin={switchToLogin}
            />
          </div>
        </div>
      )}
      
      {currentView === 'dashboard' && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
        />
      )}
    </>
  )
}

export default App