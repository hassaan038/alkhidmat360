import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

export default function RoleBasedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuthStore();

  // If not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If user's role is not allowed, redirect to their appropriate dashboard
  if (!allowedRoles.includes(user.userType)) {
    if (user.userType === 'ADMIN') {
      return <Navigate to="/dashboard/admin" replace />;
    } else {
      return <Navigate to="/dashboard/user" replace />;
    }
  }

  // Render protected content
  return children;
}
