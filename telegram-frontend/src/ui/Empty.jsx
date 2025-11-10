import styled from "styled-components";
const Box = styled.div`padding:2rem; text-align:center; color:var(--color-grey-600);`;
export default function Empty({ message = "Nothing here" }) { return <Box>{message}</Box>; }
