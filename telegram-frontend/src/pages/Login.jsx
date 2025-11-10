import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login as loginApi } from "../services/apiAuth";
import { useAuth } from "../hooks/useAuth"; // <--- custom hook

const Wrap = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  height:100vh;
  background:var(--color-grey-50);
`;

const Card = styled.div`
  width:420px;
  background:var(--color-grey-0);
  padding:2rem;
  border-radius:8px;
  box-shadow: var(--shadow-md);
`;

export default function Login() {
  const { loginUser } = useAuth(); // function to save user & token
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // React Query mutation for login
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // 1️⃣ Save user & token to AuthProvider & localStorage
      loginUser(data.data.user, data.token);
      // 2️⃣ Redirect to chat page
      navigate("/chat");
    },
    onError: (err) => {
      setError(err.response?.data?.message || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    loginMutation.mutate({ email, password });
  };

  return (
    <Wrap>
      <Card>
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>Email</label>
          <input name="email" type="email" required style={{width:"100%",padding:"0.8rem",margin:"0.6rem 0"}}/>
          <label>Password</label>
          <input name="password" type="password" required style={{width:"100%",padding:"0.8rem",margin:"0.6rem 0"}}/>
          <button
            type="submit"
            disabled={loginMutation.isLoading}
            style={{background:"var(--color-blue-700)", color:"#fff", padding:"0.8rem 1.2rem", borderRadius:"6px"}}
          >
            {loginMutation.isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </Card>
    </Wrap>
  );
}
