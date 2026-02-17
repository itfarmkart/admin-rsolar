import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import EmployeeAccess from './pages/EmployeeAccess';
import Login from './pages/Login';
import EditEmployee from './pages/EditEmployee';
import RoleTemplates from './pages/RoleTemplates';
import './App.css';
import CreateRoleTemplate from './pages/CreateRoleTemplate';

const RequireAuth = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RequirePermission = ({ children, permissionId }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const permissions = typeof user.permissions === 'string'
    ? JSON.parse(user.permissions || '{}')
    : user.permissions;

  if (!permissions?.adminPanel?.enabled) {
    return <Navigate to="/" replace />;
  }

  const hasAccess = permissions.adminPanel.configs?.find(c => c.id === permissionId)?.enabled;

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
};



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <RequirePermission permissionId="user-mgmt">
                <MainLayout>
                  <EmployeeAccess />
                </MainLayout>
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/employees"
          element={
            <RequireAuth>
              <RequirePermission permissionId="user-mgmt">
                <MainLayout>
                  <EmployeeAccess />
                </MainLayout>
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/employees/:id/edit"
          element={
            <RequireAuth>
              <RequirePermission permissionId="user-mgmt">
                <MainLayout>
                  <EditEmployee />
                </MainLayout>
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/roles"
          element={
            <RequireAuth>
              <RequirePermission permissionId="role-config">
                <MainLayout>
                  <RoleTemplates />
                </MainLayout>
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/roles/create"
          element={
            <RequireAuth>
              <RequirePermission permissionId="role-config">
                <MainLayout>
                  <CreateRoleTemplate />
                </MainLayout>
              </RequirePermission>
            </RequireAuth>
          }
        />
        <Route
          path="/roles/:id/edit"
          element={
            <RequireAuth>
              <RequirePermission permissionId="role-config">
                <MainLayout>
                  <CreateRoleTemplate />
                </MainLayout>
              </RequirePermission>
            </RequireAuth>
          }
        />
      </Routes>
    </Router >
  );
}

export default App
