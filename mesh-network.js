(function() {
  const canvas = document.getElementById('particles-js');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  const REFERENCE_WIDTH = 1920;
  const REFERENCE_HEIGHT = 1080;
  const REFERENCE_NODES = 120;

  const settings = {
    linkDist: 220,
    nodeSpeed: 0.3,
    nodeRadius: 2.5,
    lineOpacity: 0.25,
    glowFade: 0.992,
    autoPulseMs: 4000,
    hopFrames: 25,
    hopStrength: 0.78,
    colors: ['#00d4aa', '#00b894', '#00cec9']
  };

  let width = 0;
  let height = 0;
  let nodes = [];
  let links = [];
  let brightness = [];
  let wave = [];
  let hitInCurrentWave = new Set();
  let lastAutoPulse = 0;

  function getNodeCount() {
    const area = width * height;
    const refArea = REFERENCE_WIDTH * REFERENCE_HEIGHT;
    const count = Math.round(REFERENCE_NODES * (area / refArea));
    return Math.max(15, Math.min(REFERENCE_NODES, count));
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  function makeNodes() {
    const nodeCount = getNodeCount();
    nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const speedX = (Math.random() - 0.5) * settings.nodeSpeed * 2;
      const speedY = (Math.random() - 0.5) * settings.nodeSpeed * 2;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: speedX,
        vy: speedY,
        color: settings.colors[i % settings.colors.length]
      });
    }
    brightness = new Array(nodeCount).fill(0);
  }

  function rebuildLinks() {
    links = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x;
        const dy = nodes[j].y - nodes[i].y;
        const dist = Math.hypot(dx, dy);
        if (dist <= settings.linkDist) {
          links.push([i, j]);
        }
      }
    }
  }

  function getNeighbors(nodeIndex) {
    const out = [];
    for (let i = 0; i < links.length; i++) {
      const a = links[i][0];
      const b = links[i][1];
      if (a === nodeIndex) out.push(b);
      else if (b === nodeIndex) out.push(a);
    }
    return out;
  }

  function startWave(fromIndex) {
    wave = [{ node: fromIndex, power: 1, wait: 0 }];
    hitInCurrentWave = new Set([fromIndex]);
  }

  function stepWave() {
    if (!wave.length) return;

    const nextWave = [];
    for (let i = 0; i < wave.length; i++) {
      const step = wave[i];

      if (step.wait > 0) {
        nextWave.push({ node: step.node, power: step.power, wait: step.wait - 1 });
        continue;
      }

      brightness[step.node] = Math.max(brightness[step.node], step.power);
      const neighbors = getNeighbors(step.node);

      for (let n = 0; n < neighbors.length; n++) {
        const neighborIndex = neighbors[n];
        if (hitInCurrentWave.has(neighborIndex)) continue;
        hitInCurrentWave.add(neighborIndex);
        nextWave.push({
          node: neighborIndex,
          power: step.power * settings.hopStrength,
          wait: settings.hopFrames
        });
      }
    }

    wave = nextWave;
  }

  function moveNodes() {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      node.x += node.vx;
      node.y += node.vy;

      if (node.x <= 0 || node.x >= width) node.vx *= -1;
      if (node.y <= 0 || node.y >= height) node.vy *= -1;

      node.x = Math.max(0, Math.min(width, node.x));
      node.y = Math.max(0, Math.min(height, node.y));

      brightness[i] *= settings.glowFade;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < links.length; i++) {
      const a = links[i][0];
      const b = links[i][1];
      const glow = Math.max(brightness[a], brightness[b]);

      ctx.strokeStyle = `rgba(0, 212, 170, ${settings.lineOpacity + glow * 0.5})`;
      ctx.lineWidth = 1 + glow * 1.5;
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    }

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const glow = brightness[i];

      if (glow > 0.05) {
        const radius = settings.nodeRadius * (3 + glow * 4);
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius);
        grad.addColorStop(0, `rgba(0, 212, 170, ${0.9 * glow})`);
        grad.addColorStop(0.4, `rgba(0, 212, 170, ${0.4 * glow})`);
        grad.addColorStop(1, 'rgba(0, 212, 170, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = glow > 0.1 ? `rgba(255, 255, 255, ${0.9 + glow * 0.1})` : node.color;
      ctx.globalAlpha = 0.6 + glow * 0.4;
      ctx.beginPath();
      ctx.arc(node.x, node.y, settings.nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function findClosestNode(x, y, maxDist) {
    let pick = -1;
    let best = maxDist;

    for (let i = 0; i < nodes.length; i++) {
      const dist = Math.hypot(nodes[i].x - x, nodes[i].y - y);
      if (dist < best) {
        best = dist;
        pick = i;
      }
    }

    return pick;
  }

  function tick(now) {
    if (now - lastAutoPulse >= settings.autoPulseMs) {
      startWave(Math.floor(Math.random() * nodes.length));
      lastAutoPulse = now;
    }

    moveNodes();
    rebuildLinks();
    stepWave();
    draw();

    requestAnimationFrame(tick);
  }

  canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const nodeIndex = findClosestNode(x, y, 50);
    if (nodeIndex >= 0) startWave(nodeIndex);
  });

  window.addEventListener('resize', function() {
    resizeCanvas();
    makeNodes();
    rebuildLinks();
  });

  resizeCanvas();
  makeNodes();
  rebuildLinks();
  lastAutoPulse = performance.now();
  requestAnimationFrame(tick);
})();
