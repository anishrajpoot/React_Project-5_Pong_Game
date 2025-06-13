import { useEffect, useRef, useState } from "react";
import "./App.css";

const App = () => {
 
  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 90;
  const BALL_RADIUS = 30;
  const PADDLE_VELOCITY = 10;
  const BALL_SPEED = 5;
  const WINNING_SCORE = 3;
  const RED_PLAYER_NAME = "Anish";
  const BLUE_PLAYER_NAME = "Ashish";

  
  const canvasRef = useRef(null);
  const [leftScore, setLeftScore] = useState(0);
  const [rightScore, setRightScore] = useState(0);
  const [winner, setWinner] = useState("");
  const [showScoreText, setShowScoreText] = useState(false);
  const [scoreText, setScoreText] = useState("");
  const keys = useRef({});


  const ball = useRef({
    x: width / 2,
    y: height / 2,
    vx: BALL_SPEED,
    vy: BALL_SPEED,
  });
  const leftPaddle = useRef({
    x: 10,
    y: height / 2 - PADDLE_HEIGHT / 2,
  });
  const rightPaddle = useRef({
    x: width - PADDLE_WIDTH - 10,
    y: height / 2 - PADDLE_HEIGHT / 2,
  });


  const bgImage = useRef(null);
  const leftPaddleImage = useRef(null);
  const rightPaddleImage = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
      resetPositions();
    };

    window.addEventListener("resize", handleResize);

   
    bgImage.current = new Image();
    bgImage.current.src = "/court21.jpg";
    
    leftPaddleImage.current = new Image();
    leftPaddleImage.current.src = "/boxingGlove.png";
    
    rightPaddleImage.current = new Image();
    rightPaddleImage.current.src = "/boxingGlove1.png";

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const resetPositions = () => {
    ball.current = {
      x: width / 2,
      y: height / 2,
      vx: BALL_SPEED,
      vy: BALL_SPEED,
    };
    leftPaddle.current = {
      x: 10,
      y: height / 2 - PADDLE_HEIGHT / 2,
    };
    rightPaddle.current = {
      x: width - PADDLE_WIDTH - 10,
      y: height / 2 - PADDLE_HEIGHT / 2,
    };
  };

 
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let scoreCooldown = 0;

    const draw = () => {
     
      ctx.clearRect(0, 0, width, height);

      if (bgImage.current.complete) {
        ctx.drawImage(bgImage.current, 0, 0, width, height);
      }

      ctx.fillStyle = "white";
      ctx.fillRect(width / 2 - 2.5, 0, 5, height);

    
      ctx.font = "32px Comic Sans MS";
      ctx.fillStyle = "tomato";
      ctx.fillText(`${RED_PLAYER_NAME}: ${leftScore}`, width / 4 - 100, 50);
      ctx.fillStyle = "deepskyblue";
      ctx.fillText(`${BLUE_PLAYER_NAME}: ${rightScore}`, width * 3 / 4 - 100, 50);

     
      if (leftPaddleImage.current.complete) {
        ctx.drawImage(
          leftPaddleImage.current,
          leftPaddle.current.x,
          leftPaddle.current.y,
          PADDLE_WIDTH,
          PADDLE_HEIGHT
        );
      }
      if (rightPaddleImage.current.complete) {
        ctx.drawImage(
          rightPaddleImage.current,
          rightPaddle.current.x,
          rightPaddle.current.y,
          PADDLE_WIDTH,
          PADDLE_HEIGHT
        );
      }

    
      ctx.beginPath();
      ctx.fillStyle = "lime";
      ctx.ellipse(
        ball.current.x,
        ball.current.y,
        BALL_RADIUS,
        BALL_RADIUS,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      if (showScoreText) {
        ctx.font = "40px Comic Sans MS";
        ctx.fillStyle = "white";
        ctx.fillText(
          scoreText,
          width / 2 - ctx.measureText(scoreText).width / 2,
          height / 2
        );
      }
    };

    const resetBall = () => {
      ball.current = {
        x: width / 2,
        y: height / 2,
        vx: -ball.current.vx,
        vy: ball.current.vy,
      };
    };

    const checkCollision = (paddle) => {
      return (
        ball.current.x + BALL_RADIUS > paddle.x &&
        ball.current.x - BALL_RADIUS < paddle.x + PADDLE_WIDTH &&
        ball.current.y + BALL_RADIUS > paddle.y &&
        ball.current.y - BALL_RADIUS < paddle.y + PADDLE_HEIGHT
      );
    };

    const update = () => {
      if (scoreCooldown > 0) {
        scoreCooldown--;
        return;
      }

   
      if (keys.current["e"] && leftPaddle.current.y > 0) {
        leftPaddle.current.y -= PADDLE_VELOCITY;
      }
      if (keys.current["d"] && leftPaddle.current.y + PADDLE_HEIGHT < height) {
        leftPaddle.current.y += PADDLE_VELOCITY;
      }
      if (keys.current["ArrowUp"] && rightPaddle.current.y > 0) {
        rightPaddle.current.y -= PADDLE_VELOCITY;
      }
      if (keys.current["ArrowDown"] && rightPaddle.current.y + PADDLE_HEIGHT < height) {
        rightPaddle.current.y += PADDLE_VELOCITY;
      }

      ball.current.x += ball.current.vx;
      ball.current.y += ball.current.vy;

      if (ball.current.y - BALL_RADIUS <= 0 || ball.current.y + BALL_RADIUS >= height) {
        ball.current.vy *= -1;
      }

      if (
        checkCollision(leftPaddle.current) ||
        checkCollision(rightPaddle.current)
      ) {
        ball.current.vx *= -1;
      }

     
      if (ball.current.x - BALL_RADIUS <= 0) {
       
        scoreCooldown = 30;
        setScoreText("+1 For The Blue Team");
        setShowScoreText(true);
        setTimeout(() => setShowScoreText(false), 500);
        setRightScore((prev) => {
          const newScore = prev + 1;
          if (newScore >= WINNING_SCORE) {
            setWinner("Blue Player Wins!");
          }
          return newScore;
        });
        resetBall();
      } else if (ball.current.x + BALL_RADIUS >= width) {
        
        scoreCooldown = 30;
        setScoreText("+1 For The Red Team");
        setShowScoreText(true);
        setTimeout(() => setShowScoreText(false), 500);
        setLeftScore((prev) => {
          const newScore = prev + 1;
          if (newScore >= WINNING_SCORE) {
            setWinner("Red Player Wins!");
          }
          return newScore;
        });
        resetBall();
      }
    };

    const gameLoop = () => {
      if (!winner) {
        update();
        draw();
        animationFrameId = requestAnimationFrame(gameLoop);
      } else {
       
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, width, height);
        ctx.font = "60px Comic Sans MS";
        ctx.fillStyle = "white";
        ctx.fillText(
          winner,
          width / 2 - ctx.measureText(winner).width / 2,
          height / 2
        );
        
        ctx.font = "30px Comic Sans MS";
        ctx.fillText(
          "Press R to restart",
          width / 2 - ctx.measureText("Press R to restart").width / 2,
          height / 2 + 60
        );
      }
    };

    const handleKeyDown = (e) => {
      keys.current[e.key] = true;
      
     
      if (winner && e.key === "r") {
        setLeftScore(0);
        setRightScore(0);
        setWinner("");
        resetPositions();
      }
    };

    const handleKeyUp = (e) => {
      keys.current[e.key] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, leftScore, rightScore, winner, showScoreText, scoreText]);

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
      />
    </div>
  );
};

export default App;