class FoodRoulette extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.foods = [
      "김치찌개 🥘", "된장찌개 🍲", "비빔밥 🥗", "불고기 🍖", 
      "치킨 🍗", "떡볶이 🌶️", "삼겹살 🥓", "짜장면 🍜", 
      "짬뽕 🍜", "돈까스 🥩", "초밥 🍣", "쌀국수 🍜", 
      "마라탕 🥘", "햄버거 🍔", "피자 🍕", "샌드위치 🥪"
    ];
    this.colors = [
      "#FF6B6B", "#FF9F43", "#FECA57", "#1DD1A1", 
      "#48DBFB", "#54A0FF", "#5F27CD", "#EE5253"
    ];
    this.currentAngle = 0;
    this.isSpinning = false;
  }

  connectedCallback() {
    this.render();
    this.initCanvas();
  }

  initCanvas() {
    this.canvas = this.shadowRoot.getElementById('wheelCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.drawWheel();
  }

  drawWheel() {
    const { ctx, canvas, foods, colors, currentAngle } = this;
    const numSegments = foods.length;
    const anglePerSegment = (Math.PI * 2) / numSegments;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = canvas.width / 2 - 10;

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
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px 'Pretendard', sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 4;
      ctx.fillText(foods[i], radius - 15, 5);
      ctx.restore();
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 10;
    ctx.stroke();
  }

  spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    
    const resultDisplay = this.shadowRoot.getElementById('result');
    const spinBtn = this.shadowRoot.getElementById('spinBtn');
    
    spinBtn.disabled = true;
    resultDisplay.innerHTML = `<span class="spinning-text">빙글빙글... 무엇이 나올까요?</span>`;

    const spinAngle = (Math.random() * Math.PI * 2) + (Math.PI * 2 * (Math.floor(Math.random() * 5) + 5));
    const spinTime = 4000;
    const startAngle = this.currentAngle;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      if (elapsed < spinTime) {
        const easeOut = (t) => 1 - Math.pow(1 - t, 4);
        const progress = easeOut(elapsed / spinTime);
        this.currentAngle = startAngle + spinAngle * progress;
        this.drawWheel();
        requestAnimationFrame(animate);
      } else {
        this.currentAngle = startAngle + spinAngle;
        this.drawWheel();
        this.finishSpin();
      }
    };

    requestAnimationFrame(animate);
  }

  finishSpin() {
    const numSegments = this.foods.length;
    const anglePerSegment = (Math.PI * 2) / numSegments;
    const normalizedAngle = this.currentAngle % (Math.PI * 2);
    
    // The pointer is at 12 o'clock (1.5 * PI)
    let pointerAngle = (1.5 * Math.PI) - normalizedAngle;
    while (pointerAngle < 0) pointerAngle += Math.PI * 2;
    
    const winningIndex = Math.floor(pointerAngle / anglePerSegment) % numSegments;
    const winner = this.foods[winningIndex];

    const resultDisplay = this.shadowRoot.getElementById('result');
    const spinBtn = this.shadowRoot.getElementById('spinBtn');

    resultDisplay.innerHTML = `오늘의 추천 메뉴는 <br><strong>${winner}</strong> 입니다!`;
    resultDisplay.classList.add('winner-animation');
    
    setTimeout(() => {
        resultDisplay.classList.remove('winner-animation');
    }, 1000);

    this.isSpinning = false;
    spinBtn.disabled = false;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          max-width: 400px;
          margin: 0 auto;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          text-align: center;
        }
        .roulette-wrapper {
          position: relative;
          margin: 1rem auto 2rem;
          width: 320px;
          height: 320px;
        }
        canvas {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1));
        }
        .pointer {
          position: absolute;
          top: -15px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 15px solid transparent;
          border-right: 15px solid transparent;
          border-top: 30px solid #2d3436;
          z-index: 10;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }
        .spin-btn {
          background: linear-gradient(135deg, #FF6B6B, #EE5253);
          color: white;
          border: none;
          padding: 1rem 2.5rem;
          font-size: 1.25rem;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 8px 20px rgba(238, 82, 83, 0.3);
          font-family: 'Pretendard', sans-serif;
        }
        .spin-btn:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 25px rgba(238, 82, 83, 0.4);
        }
        .spin-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .spin-btn:disabled {
          background: #dfe6e9;
          color: #b2bec3;
          box-shadow: none;
          cursor: not-allowed;
        }
        #result {
          margin-top: 2rem;
          font-size: 1.4rem;
          min-height: 4.5rem;
          line-height: 1.5;
          color: #2d3436;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
        }
        #result strong {
          color: #EE5253;
          font-size: 1.8rem;
          display: block;
          margin-top: 0.5rem;
        }
        .spinning-text {
          color: #636e72;
          font-size: 1.1rem;
          animation: pulse 1s infinite alternate;
        }
        @keyframes pulse {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
        .winner-animation {
          animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      </style>
      <div class="container">
        <div class="roulette-wrapper">
          <div class="pointer"></div>
          <canvas id="wheelCanvas" width="320" height="320"></canvas>
        </div>
        <button id="spinBtn" class="spin-btn">메뉴 고르기!</button>
        <div id="result">어떤 음식을 먹을까요?</div>
      </div>
    `;
    this.shadowRoot.getElementById('spinBtn').addEventListener('click', () => this.spin());
  }
}

customElements.define('food-roulette', FoodRoulette);
