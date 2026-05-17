const conveyor = document.getElementById("conveyor");
const statusText = document.getElementById("statusText");

// Stack Lights
const lightRed = document.getElementById("lightRed");
const lightYellow = document.getElementById("lightYellow");
const lightGreen = document.getElementById("lightGreen");

let currentSection = null;
let isMoving = false; 
let isEmergencyStopped = false;

// Conveyor steps (box 130 + gap 80 = 210px steps)
const positions = {
  education: 0,
  projects: -210,
  experience: -420,
  skills: -630,
  contact: -840
};

// Adjusted Arm Angles (Folds down to stay inside box)
const armPos = {
  idle:  { shoulder: 70, elbow: 110, wrist: 20 },    // Folded downward safely
  reach: { shoulder: 45, elbow: 30, wrist: 15 },     // Reaching down to conveyor
  lift:  { shoulder: 15, elbow: 75, wrist: -5 }      // Reaching across to platform
};

// Initialize
gsap.set('#jointShoulder', { rotation: armPos.idle.shoulder });
gsap.set('#jointElbow', { rotation: armPos.idle.elbow });
gsap.set('#jointWrist', { rotation: armPos.idle.wrist });

function setLights(state) {
  lightRed.className = "light red";
  lightYellow.className = "light yellow";
  lightGreen.className = "light green";

  if (state === 'idle') lightGreen.classList.add("active");
  if (state === 'moving') lightYellow.classList.add("flash");
  if (state === 'error') lightRed.classList.add("flash");
}

async function selectSection(section) {
  if (isMoving || isEmergencyStopped || currentSection === section) return;
  isMoving = true;
  
  setLights('moving');

  updateStatus(`SELECTED: ${section.toUpperCase()}`);

  if (currentSection) {
    updateStatus(`RETURNING: ${currentSection.toUpperCase()}`);
    await returnPreviousBox(currentSection);
  }

  updateStatus(`MOVING CONVEYOR...`);
  await moveConveyor(section);

  updateStatus(`PICKING: ${section.toUpperCase()}`);
  await pickAndPlace(section);

  updateStatus(`READY`);
  setLights('idle');
  document.getElementById(section).scrollIntoView({ behavior: "smooth" });

  currentSection = section;
  isMoving = false;
}

function updateStatus(text) {
  statusText.innerHTML = text;
}

function moveConveyor(section) {
  return new Promise((resolve) => {
    gsap.to(conveyor, {
      x: positions[section],
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: resolve
    });
  });
}

function pickAndPlace(section) {
  return new Promise((resolve) => {
    const box = document.getElementById(`${section}-box`);
    const tl = gsap.timeline({ onComplete: resolve });

    // Arm reaches down to box
    tl.to('#jointShoulder', { rotation: armPos.reach.shoulder, duration: 0.8, ease: "power1.inOut" }, "reach")
      .to('#jointElbow', { rotation: armPos.reach.elbow, duration: 0.8, ease: "power1.inOut" }, "reach")
      .to('#jointWrist', { rotation: armPos.reach.wrist, duration: 0.8, ease: "power1.inOut" }, "reach");

    // Lifts box perfectly onto platform (Platform is 115px exactly above Conveyor track)
    tl.to('#jointShoulder', { rotation: armPos.lift.shoulder, duration: 1, ease: "power1.inOut" }, "lift")
      .to('#jointElbow', { rotation: armPos.lift.elbow, duration: 1, ease: "power1.inOut" }, "lift")
      .to('#jointWrist', { rotation: armPos.lift.wrist, duration: 1, ease: "power1.inOut" }, "lift")
      .to(box, { y: -115, duration: 1, ease: "power1.inOut" }, "lift");

    // Arm retracts to idle
    tl.to('#jointShoulder', { rotation: armPos.idle.shoulder, duration: 0.6, ease: "power1.inOut" }, "idle")
      .to('#jointElbow', { rotation: armPos.idle.elbow, duration: 0.6, ease: "power1.inOut" }, "idle")
      .to('#jointWrist', { rotation: armPos.idle.wrist, duration: 0.6, ease: "power1.inOut" }, "idle");
  });
}

function returnPreviousBox(section) {
  return new Promise((resolve) => {
    const box = document.getElementById(`${section}-box`);
    const tl = gsap.timeline({ onComplete: resolve });

    tl.to('#jointShoulder', { rotation: armPos.lift.shoulder, duration: 0.6, ease: "power1.inOut" }, "reach")
      .to('#jointElbow', { rotation: armPos.lift.elbow, duration: 0.6, ease: "power1.inOut" }, "reach")
      .to('#jointWrist', { rotation: armPos.lift.wrist, duration: 0.6, ease: "power1.inOut" }, "reach");

    tl.to('#jointShoulder', { rotation: armPos.reach.shoulder, duration: 1, ease: "power1.inOut" }, "lower")
      .to('#jointElbow', { rotation: armPos.reach.elbow, duration: 1, ease: "power1.inOut" }, "lower")
      .to('#jointWrist', { rotation: armPos.reach.wrist, duration: 1, ease: "power1.inOut" }, "lower")
      .to(box, { y: 0, duration: 1, ease: "power1.inOut" }, "lower");

    tl.to('#jointShoulder', { rotation: armPos.idle.shoulder, duration: 0.8, ease: "power1.inOut" }, "idle")
      .to('#jointElbow', { rotation: armPos.idle.elbow, duration: 0.8, ease: "power1.inOut" }, "idle")
      .to('#jointWrist', { rotation: armPos.idle.wrist, duration: 0.8, ease: "power1.inOut" }, "idle");
  });
}

function triggerEmergencyStop() {
  // Kills all active GSAP animations immediately
  gsap.killTweensOf("*"); 
  isEmergencyStopped = true;
  isMoving = false;
  
  setLights('error');
  updateStatus(`<span style="color:red">E-STOP ENGAGED<br>REFRESH TO RESET</span>`);
}
