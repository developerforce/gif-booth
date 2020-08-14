import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import '../App.css';

const Timer = ({ isPlaying, setIsPlaying }) => {

  const renderTime = ({ remainingTime }) => (
    <div className="timer">
      <div className="timer-text mb-3">Remaining</div>
      <div className="timer-value">{remainingTime}</div>
      <div className="timer-text mt-3">seconds</div>
    </div>
  );
  
  return (
    <div className="App">
      <div className="timer-wrapper">
        <CountdownCircleTimer
          isPlaying={isPlaying}
          size={100}
          duration={3}
          colors={[["#FFCC33", 0.33], ["#ff6633", 0.33], ["#ff3366"]]}
          onComplete={() => {
            setIsPlaying(false);
            return false;
          }}
        >
          {renderTime}
        </CountdownCircleTimer>
      </div>
    </div>
  );
}

export default Timer;