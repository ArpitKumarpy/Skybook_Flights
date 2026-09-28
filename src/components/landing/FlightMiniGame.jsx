import { useEffect, useRef } from "react";

export function FlightMiniGame() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let plane = {
      x: 50,
      y: 80,
      width: 34,
      height: 20,
      velocity: 0,
      gravity: 0.4,
      thrust: -7,
    };

    let obstacles = [];
    let score = 0;
    let gameOver = false;
    let gameStarted = false;
    let spawnTimer = 0;
    let gameSpeed = 10;

    function handleInput(e) {
      if (gameOver) {
        plane.y = 80;
        plane.velocity = 0;
        obstacles = [];
        score = 0;
        gameOver = false;
        gameStarted = true;
        gameSpeed = 3;
        return;
      }

      if (!gameStarted) {
        gameStarted = true;
        return;
      }

      plane.velocity = plane.thrust;
    }

    const keyHandler = (e) => {
      if (e.code === "Space") handleInput();
    };

    window.addEventListener("keydown", keyHandler);

    const clickHandler = () => handleInput();
    canvas.addEventListener("click", clickHandler);

    function drawPlane() {
      ctx.fillStyle = "#1e3a8a";
      ctx.fillRect(plane.x + 6, plane.y + 4, 24, 10);
      ctx.fillRect(plane.x + 12, plane.y, 14, 5);

      ctx.fillStyle = "#ef4444";
      ctx.fillRect(plane.x, plane.y, 6, 10);

      ctx.fillStyle = "#9ca3af";
      ctx.fillRect(plane.x + 14, plane.y + 10, 6, 10);
    }

    function drawObstacles() {
      ctx.fillStyle = "#4b5563";

      obstacles.forEach((obs) => {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        ctx.fillRect(obs.x + 5, obs.y - 6, obs.width - 10, 6);
      });
    }

    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!gameStarted) {
        drawPlane();
        ctx.fillStyle = "#1e3a8a";
        ctx.font = "bold 18px Arial";
        ctx.fillText("PRESS SPACE OR CLICK TO START", 135, 110);
        requestAnimationFrame(update);
        return;
      }

      if (!gameOver) {
        plane.velocity += plane.gravity;
        plane.y += plane.velocity;

        if (plane.y < 0) plane.y = 0;

        if (plane.y + plane.height > canvas.height) {
          plane.y = canvas.height - plane.height;
        }

        spawnTimer++;

        if (spawnTimer > 90) {
          const h = Math.floor(Math.random() * 60) + 20;

          obstacles.push({
            x: canvas.width,
            y: Math.random() > 0.5 ? 0 : canvas.height - h,
            width: 30,
            height: h,
          });

          spawnTimer = 0;
          score++;

          if (score % 5 === 0) gameSpeed += 0.5;
        }

        obstacles.forEach((obs) => {
          obs.x -= gameSpeed;

          if (
            plane.x < obs.x + obs.width &&
            plane.x + plane.width > obs.x &&
            plane.y < obs.y + obs.height &&
            plane.y + plane.height > obs.y
          ) {
            gameOver = true;
          }
        });

        obstacles = obstacles.filter((o) => o.x > -50);
      }

      drawObstacles();
      drawPlane();

      ctx.fillStyle = "#1e3a8a";
      ctx.font = "bold 16px Arial";
      ctx.fillText(`Score: ${score}`, 20, 30);

      if (gameOver) {
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 24px Arial";
        ctx.fillText("CRASH LANDING!", 190, 100);

        ctx.font = "14px Arial";
        ctx.fillText("Press Space to Retry", 220, 130);
      }

      requestAnimationFrame(update);
    }

    update();

    return () => {
      window.removeEventListener("keydown", keyHandler);
      canvas.removeEventListener("click", clickHandler);
    };
  }, []);

  return (
    <section className="landing-section">
      <h2 className="game-title">
        Flight Delay Challenge ✈️
      </h2>

      <p className="game-subtitle">
        Waiting for your flight? Test your piloting skills while you browse SkyBook.
      </p>

      <canvas
        ref={canvasRef}
        width={1000}
        height={250}
        className="flight-game"
      />

      <p className="game-subtitle">
        Press <strong>SPACE</strong> or click the game area to fly.
      </p>
    </section>
  );
}
