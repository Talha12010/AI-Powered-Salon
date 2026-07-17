const { spawn } = require('child_process');
const path = require('path');

const SERVICE_URL = 'http://127.0.0.1:5001';
const MODEL_DIR = path.join(__dirname, '..', '..', 'model');
const SERVICE_SCRIPT = path.join(MODEL_DIR, 'face_shape_service.py');

let startPromise = null;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function healthCheck() {
  try {
    const response = await fetch(`${SERVICE_URL}/health`);
    return response.ok;
  } catch (_) {
    return false;
  }
}

function spawnService(command) {
  const child = spawn(command, [SERVICE_SCRIPT], {
    cwd: MODEL_DIR,
    detached: true,
    stdio: 'ignore'
  });
  child.unref();
  return child;
}

async function waitForService(timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await healthCheck()) return true;
    await sleep(500);
  }
  return false;
}

async function ensureFaceShapeService() {
  if (await healthCheck()) return true;
  if (startPromise) return startPromise;

  startPromise = (async () => {
    const commands = ['python', 'py'];

    for (const command of commands) {
      try {
        spawnService(command);
        if (await waitForService()) return true;
      } catch (_) {}
    }

    throw new Error('Face shape service is unavailable. Make sure Python and the model dependencies are installed.');
  })().finally(() => {
    startPromise = null;
  });

  return startPromise;
}

async function predictFaceShape(image) {
  await ensureFaceShapeService();

  const response = await fetch(`${SERVICE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Face shape prediction failed.');
  }

  return data;
}

module.exports = {
  ensureFaceShapeService,
  predictFaceShape
};
