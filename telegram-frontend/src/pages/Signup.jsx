import { useState } from "react";
import styled from "styled-components";
import { useMutation } from "@tanstack/react-query";
import { signup } from "../services/apiAuth";
import { useNavigate } from "react-router-dom";
import Spinner from "../ui/Spinner";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--color-grey-50);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  background: #fff;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: var(--shadow-md);
  width: 360px;
`;

const Input = styled.input`
  padding: 1rem 1.2rem;
  border: 1px solid var(--color-grey-300);
  border-radius: 6px;
  font-size: 1.4rem;
  &:focus {
    outline: none;
    border-color: var(--color-blue-500);
  }
`;

const Button = styled.button`
  padding: 1rem;
  border: none;
  background: var(--color-blue-600);
  color: white;
  border-radius: 6px;
  font-size: 1.4rem;
  cursor: pointer;
  &:hover {
    background: var(--color-blue-700);
  }
`;

const Error = styled.p`
  color: var(--color-red-600);
  font-size: 1.2rem;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 1rem;
  color: var(--color-grey-800);
`;

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    profilePic: "",
  });

  const { mutate, isLoading, isError, error } = useMutation({
  mutationFn: signup,
  onSuccess: () => navigate("/login"),
});

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    mutate(form);
  }

  return (
    <Wrapper>
      <Form onSubmit={handleSubmit}>
        <Title>Create Account</Title>

        <Input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Input
          type="text"
          name="profilePic"
          placeholder="Profile picture URL (optional)"
          value={form.profilePic}
          onChange={handleChange}
        />

        <Button type="submit" disabled={ isLoading}>
          { isLoading ? <Spinner /> : "Sign Up"}
        </Button>

        {isError && <Error>{error.message || "Something went wrong"}</Error>}

        <p style={{ fontSize: "1.2rem", textAlign: "center" }}>
          Already have an account?{" "}
          <a href="/login" style={{ color: "var(--color-blue-600)" }}>
            Log in
          </a>
        </p>
      </Form>
    </Wrapper>
  );
}
