import { Navigate } from "react-router";

function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');

    if (!token) {
        // Redirect to login if no token
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
