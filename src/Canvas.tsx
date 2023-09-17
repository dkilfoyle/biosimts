import { useEffect, useRef, useState } from "react";
import { ISimulationConfig, ISimulationStatus, Peeps, defaultSimulationConfig } from "./Peeps";
import _ from "lodash";
import { Box, Button, Checkbox, Flex, FormControl, FormLabel, Grid, Input, Spacer, VStack } from "@chakra-ui/react";

const peeps = new Peeps(defaultSimulationConfig);

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestIdRef = useRef(0);
  const [statusData, setStatusData] = useState<ISimulationStatus>(peeps.getStatus());
  const [configData, setConfigData] = useState<ISimulationConfig>(defaultSimulationConfig);
  const [selectedIndiv, setSelectedIndiv] = useState(-1);
  const [pause, setPause] = useState(false);

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

      const drawIndiv = (x: number, y: number, c: number[], alpha: number) => {
        ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x * deltaX + offX, y * deltaY + offY, offX * 0.7, 0, 2 * Math.PI);
        ctx.fill();
      };

      peeps.individuals.forEach((indiv) => {
        const c = indiv.getColor();
        drawIndiv(indiv.x, indiv.y, c, 1);
        if (peeps.config.showTails) indiv.tail.forEach((t, i) => drawIndiv(t[0], t[1], c, (1 * i) / 5));
      });

      if (peeps.selectedIndiv !== -1) {
        const si = peeps.individuals[peeps.selectedIndiv];
        ctx.strokeStyle = "red";
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(si.x * deltaX + offX, si.y * deltaY + offY, offX * 1.2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  };

  const runStep = () => {
    if (!canvasRef.current) return;
    drawFrame();
    if (!peeps.pause) peeps.stepTime();
    if (peeps.time == 0) {
      setStatusData(peeps.getStatus());
    }
    if (peeps.individuals.length > 0 && peeps.generations < peeps.config.maxGenerations) {
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
    console.log(configData);
  };
  const handleCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    console.log(name, checked);
    setConfigData({ ...configData, [name]: checked });
    console.log(configData.showTails);
  };
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (canvasRef.current) {
      const ctx = canvasRef.current;
      const mx = Math.max(0, e.clientX - ctx.offsetLeft);
      const my = Math.max(0, e.clientY - ctx.offsetTop);
      const gx = Math.floor((mx / ctx.width) * peeps.config.gridSize);
      const gy = Math.floor((my / ctx.height) * peeps.config.gridSize);
      const g = peeps.grid.get(gx, gy);
      if (g < 0xffff) {
        const indiv = peeps.individuals[g];
        console.log(`Indiv ${g} at ${gx},${gy} = ${indiv.x},${indiv.y}`, indiv);
        setSelectedIndiv(g);
        peeps.selectedIndiv = g;
      }
    }
  };
  const handlePause = () => {
    peeps.pause = !pause;
    setPause(() => !pause);
  };

  return (
    <Grid templateColumns="200px 1fr 200px" p="10px" bg="gray.100" gap="10px">
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
            <Button width="full" onClick={handlePause}>
              {pause ? "Play" : "Pause"}
            </Button>
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
              <Checkbox name="showTails" isChecked={configData.showTails} onChange={handleCheckChange}>
                Show tails
              </Checkbox>
              <Checkbox name="pauseAfterAnimation" isChecked={configData.pauseAfterAnimation} onChange={handleCheckChange}>
                Pause after animation
              </Checkbox>

              <Button width="full" type="submit">
                Reset
              </Button>
            </VStack>
          </form>
        </Flex>
      </Box>

      <canvas {...size} ref={canvasRef} onMouseMove={handleMouseMove} />

      <Box rounded="md" bg="white" p="10px">
        <h2>{selectedIndiv}</h2>
        <h2>{selectedIndiv !== -1 && peeps.individuals[selectedIndiv].x}</h2>
        <h2>{selectedIndiv !== -1 && peeps.individuals[selectedIndiv].y}</h2>
        <h2>{selectedIndiv !== -1 && peeps.individuals[selectedIndiv].getColor()}</h2>
      </Box>
    </Grid>
  );
};
