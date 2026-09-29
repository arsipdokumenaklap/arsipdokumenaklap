import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";


function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);
    });
    return unsub;
  }, []);

  if (checking) {
    return <p className="p-6 text-gray-400">Memuat...</p>;
  }

  return user ? children : <Navigate to="/" replace />;
}

export default ProtectedRoute;