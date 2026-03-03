import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Lobby } from './components/Lobby';
import { GameScreen } from './components/GameScreen';

const GameContainer = () => {
  const { gameState } = useGame();

  // If no game state or in lobby phase, show Lobby
  if (!gameState || gameState.phase === 'LOBBY') {
    return <Lobby />;
  }

  // Otherwise show Game Screen
  return <GameScreen />;
};

export default function App() {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
}
