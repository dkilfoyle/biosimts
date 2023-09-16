import { ChakraProvider } from "@chakra-ui/react";
import { Canvas } from "./Canvas";

function App() {
  return (
    <ChakraProvider>
      <Canvas></Canvas>
    </ChakraProvider>
  );
}

export default App;
