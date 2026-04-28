import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// Wraps routes that only admins should see.
// A technician who manually types /users in the URL gets bounced to /.
export default function AdminRoute({ children }) {
  const user = useSelector((s) => s.auth.user);

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
