import styled, { keyframes } from "styled-components";

const spin = keyframes` to { transform: rotate(360deg); }`;
const Dot = styled.div`
  width:30px; height:30px; border-radius:50%; border:4px solid var(--color-grey-200); border-top-color:var(--color-brand-500); animation: ${spin} 1s linear infinite; margin:auto;
`;
export default function Spinner(){ return <Dot />; }
