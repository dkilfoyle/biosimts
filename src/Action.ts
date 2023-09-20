export enum Action {
  MOVE_X, // W +- X component of movement
  MOVE_Y, // W +- Y component of movement
  MOVE_FORWARD, // W continue last direction
  MOVE_RL, // W +- component of movement
  MOVE_RANDOM, // W
  SET_OSCILLATOR_PERIOD, // I
  SET_LONGPROBE_DIST, // I
  SET_RESPONSIVENESS, // I
  EMIT_SIGNAL0, // W
  MOVE_EAST, // W
  MOVE_WEST, // W
  MOVE_NORTH, // W
  MOVE_SOUTH, // W
  MOVE_LEFT, // W
  MOVE_RIGHT, // W
  MOVE_REVERSE, // W
  NUM_ACTIONS, // <<----------------- END OF ACTIVE ACTIONS MARKER
  KILL_FORWARD, // W
}
