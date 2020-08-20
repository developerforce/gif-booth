import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

const Countdown = ({ isPlaying, setIsCountdownPlaying, setIsTimerPlaying }) => {

  const renderTime = ({ remainingTime }) => (
    <div className="timer">
      <div className="timer-text mb-3">Start capture in</div>
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
          colors={[["#efefef", 0.33], ["#3366FF", 0.33], ["#33FF66"]]}
          onComplete={() => {
            setIsCountdownPlaying(false);
            setIsTimerPlaying(true);
            return false;
          }}
        >
          {renderTime}
        </CountdownCircleTimer>
      </div>
    </div>
  );
}

export default Countdown;