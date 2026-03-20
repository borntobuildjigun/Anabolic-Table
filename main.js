const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const resultDisplay = document.getElementById('result');

const foods = [
  "Pizza 🍕", "Burger 🍔", "Sushi 🍣", "Tacos 🌮", 
  "Salad 🥗", "Pasta 🍝", "Chicken 🍗", "Steak 🥩"
];

const colors = [
  "#ff9ff3", "#feca57", "#ff6b6b", "#48dbfb", 
  "#1dd1a1", "#5f27cd", "#c8d6e5", "#ffc048"
];

let currentAngle = 0;
const numSegments = foods.length;
const anglePerSegment = (Math.PI * 2) / numSegments;
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = canvas.width / 2;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let i = 0; i < numSegments; i++) {
    const startAngle = currentAngle + i * anglePerSegment;
    const endAngle = startAngle + anglePerSegment;
    
    // Draw segment
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    
    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + anglePerSegment / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px 'Segoe UI', sans-serif";
    
    // Create a slight drop shadow for text readability
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillText(foods[i], radius - 20, 6);
    ctx.restore();
  }
}

let isSpinning = false;

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.disabled = true;
  resultDisplay.textContent = "Spinning...";
  
  // Random extra angle to ensure randomness + multiple full spins (3 to 6)
  const spinAngle = (Math.random() * Math.PI * 2) + (Math.PI * 2 * (Math.floor(Math.random() * 4) + 3));
  const spinTime = 4000; // 4 seconds animation
  const startAngle = currentAngle;
  const startTime = performance.now();

  function animate(time) {
    const elapsed = time - startTime;
    if (elapsed < spinTime) {
      // Ease out cubic function for smooth deceleration
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      const progress = easeOut(elapsed / spinTime);
      currentAngle = startAngle + spinAngle * progress;
      drawWheel();
      requestAnimationFrame(animate);
    } else {
      // Animation finished
      currentAngle = startAngle + spinAngle;
      drawWheel();
      
      // Determine winner
      // The pointer is at the top (which is -PI/2 relative to standard angle 0)
      // Standard angle 0 is at 3 o'clock. Top is 12 o'clock (-90 degrees or 1.5 PI).
      const normalizedAngle = currentAngle % (Math.PI * 2);
      
      // Calculate the angle of the pointer relative to the wheel
      let pointerAngle = (1.5 * Math.PI) - normalizedAngle;
      if (pointerAngle < 0) pointerAngle += Math.PI * 2;
      
      const winningIndex = Math.floor(pointerAngle / anglePerSegment);
      const winner = foods[winningIndex % numSegments];
      
      resultDisplay.textContent = `You should eat: ${winner}!`;
      isSpinning = false;
      spinBtn.disabled = false;
    }
  }

  requestAnimationFrame(animate);
}

// Initial draw
drawWheel();

spinBtn.addEventListener('click', spinWheel);
