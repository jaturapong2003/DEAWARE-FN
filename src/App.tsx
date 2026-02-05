import './App.css'
import { useAuth } from './hooks/useAuth'

function App() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DEAWARE-FN</h1>
        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-info">
              <span className="welcome-text">
                สวัสดี, {user?.firstName || user?.username || 'ผู้ใช้'}
              </span>
              <button onClick={logout} className="btn btn-logout">
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <button onClick={login} className="btn btn-login">
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        {isAuthenticated ? (
          <div className="dashboard">
            <h2>ยินดีต้อนรับ!</h2>
            <div className="user-profile-card">
              <h3>ข้อมูลผู้ใช้</h3>
              <div className="profile-details">
                <p><strong>ชื่อผู้ใช้:</strong> {user?.username || '-'}</p>
                <p><strong>อีเมล:</strong> {user?.email || '-'}</p>
                <p><strong>ชื่อ:</strong> {user?.firstName || '-'}</p>
                <p><strong>นามสกุล:</strong> {user?.lastName || '-'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="landing">
            <h2>ยินดีต้อนรับสู่ DEAWARE-FN</h2>
            <p>กรุณาเข้าสู่ระบบเพื่อเข้าถึงเนื้อหา</p>
            <button onClick={login} className="btn btn-primary btn-large">
              เข้าสู่ระบบด้วย Keycloak
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
