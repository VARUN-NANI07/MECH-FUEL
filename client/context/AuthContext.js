// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    console.log("AuthProvider init - storedToken:", storedToken ? "exists" : "none", "storedUser:", storedUser); // Debug log

    if (storedToken) setToken(storedToken);
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Parsed user from localStorage:", parsedUser); // Debug log
        setUser(parsedUser);
      } catch {
        // ignore parse error
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    console.log("Login called with userData:", userData, "token:", jwtToken ? "exists" : "none"); // Debug log
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    console.log("User saved to localStorage:", userData); // Debug log
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
