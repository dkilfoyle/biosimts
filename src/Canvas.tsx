import { useEffect, useRef, useState } from "react";
import { ISimulationConfig, ISimulationStatus, Peeps, defaultSimulationConfig } from "./Peeps";
import _ from "lodash";
import { Box, Button, Flex, FormControl, FormLabel, Grid, Input, Spacer, VStack } from "@chakra-ui/react";

const peeps = new Peeps(defaultSimulationConfig);

export const Canvas = () => {
  console.log("redraw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef(0);
  const [statusData, setStatusData] = useState<ISimulationStatus>(peeps.getStatus());
  const [configData, setConfigData] = useState<ISimulationConfig>(defaultSimulationConfig);

  const size = { width: 900, height: 900 };

  const drawFrame = () => {
    const ctx = canvasRef.current!.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const deltaX = ctx.canvas.width / peeps.config.gridSize;
      const deltaY = ctx.canvas.height / peeps.config.gridSize;
      const offX = deltaX / 2;
      const offY = deltaY / 2;

      _.range(0, peeps.config.gridSize).forEach((i) => {
        ctx.beginPath();
        ctx.moveTo(i * deltaX, 0);
        ctx.lineTo(i * deltaX, ctx.canvas.height);
        ctx.strokeStyle = "lightGrey";
        ctx.lineWidth = 0.1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * deltaY);
        ctx.lineTo(ctx.canvas.width, i * deltaY);
        ctx.strokeStyle = "lightGrey";
        ctx.lineWidth = 0.1;
        ctx.stroke();
      });

      _.range(0, (peeps.config.gridSize * peeps.time) / peeps.config.lifetime).forEach((i) => {
        ctx.fillStyle = "rgb(100,100,100)";
        ctx.fillRect(i * deltaX + 1, 2, deltaX - 2, deltaY - 2);
      });

      peeps.individuals.forEach((indiv) => {
        const c = indiv.getColor();
        ctx.fillStyle = `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
        ctx.beginPath();
        ctx.arc(indiv.x * deltaX + offX, indiv.y * deltaY + offY, offX * 0.7, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
      });
    }
  };

  const runStep = () => {
    if (!canvasRef.current) return;
    drawFrame();
    peeps.stepTime();
    if (peeps.time == 0) {
      setStatusData(peeps.getStatus());
    }
    if (peeps.individuals.length < 0 && peeps.generations < peeps.config.maxGenerations) {
      requestIdRef.current = requestAnimationFrame(runStep);
    } else {
      console.log("done");
    }
  };

  useEffect(() => {
    requestIdRef.current = requestAnimationFrame(runStep);
    return () => {
      cancelAnimationFrame(requestIdRef.current);
    };
  }, []);

  const handleSettingsForm = (event: React.SyntheticEvent) => {
    event.preventDefault();
    peeps.config = configData;
    peeps.reset();
    setStatusData(peeps.getStatus());
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setConfigData({ ...configData, [name]: value });
  };

  return (
    <Grid templateColumns="200px 1fr" p="10px" bg="gray.100" gap="10px">
      <Box rounded="md" bg="white" p="10px">
        <Flex direction="column" minHeight="100%">
          <VStack spacing={4} align="flex-start">
            <FormControl>
              <FormLabel>Generation</FormLabel>
              <Input value={statusData.generation} readOnly></Input>
            </FormControl>
            <FormControl>
              <FormLabel>Population</FormLabel>
              <Input value={statusData.population} readOnly></Input>
            </FormControl>
          </VStack>
          <Spacer />
          <form onSubmit={handleSettingsForm}>
            <VStack spacing={4} align="flex-start">
              <FormControl>
                <FormLabel>Initial Population</FormLabel>
                <Input name="initialPopulationSize" value={configData.initialPopulationSize} onChange={handleInputChange}></Input>
              </FormControl>
              <FormControl>
                <FormLabel>Lifetime</FormLabel>
                <Input name="lifetime" value={configData.lifetime} onChange={handleInputChange}></Input>
              </FormControl>
              <FormControl>
                <FormLabel>Animate Generation</FormLabel>
                <Input name="animateGeneration" value={configData.animateGeneration} onChange={handleInputChange}></Input>
              </FormControl>
              <FormControl>
                <FormLabel>Generations</FormLabel>
                <Input name="maxGenerations" value={configData.maxGenerations} onChange={handleInputChange}></Input>
              </FormControl>
              <FormControl>
                <FormLabel>Grid Size</FormLabel>
                <Input name="gridSize" value={configData.gridSize} onChange={handleInputChange}></Input>
              </FormControl>
              <Button width="full" type="submit">
                Reset
              </Button>
            </VStack>
          </form>
        </Flex>
      </Box>

      <canvas {...size} ref={canvasRef} />
    </Grid>
  );
};
