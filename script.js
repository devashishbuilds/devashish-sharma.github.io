const conveyor = document.getElementById("conveyor");
const statusText = document.getElementById("statusText");
const safetyLight = document.getElementById("safetyLight");

let currentSection = null;
let isMoving = false; 

// Conveyor steps (box 130 + gap 80 = 210px steps)
const positions = {
  education: 0,
  projects: -210,
  experience: -420,
  skills: -630,
  contact: -840
};

// Robot Arm Kinematic Angles for Wall Mount
const armPos = {
  idle:  { shoulder: 45, elbow: 80, wrist: -30 },   // Folded resting state
  reach: { shoulder: 65, elbow: 10, wrist: 15 },    // Reaching DOWN to conveyor
  lift:  { shoulder: 35, elbow: 40, wrist: 15 }     // Reaching ACROSS to platform
};

// Initialize
gsap.set('#jointShoulder', { rotation: armPos.idle.shoulder });
gsap.set('#jointElbow', { rotation: armPos.idle.elbow });
gsap.set('#jointWrist', { rotation: armPos.idle.wrist });

async function selectSection(section) {
  if (isMoving || currentSection === section) return;
  isMoving = true;
  
  safetyLight.classList.add("moving"); // Turn on yellow warning light

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
  safetyLight.classList.remove("moving"); // Turn back to green
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

    // Arm and Box lift to the platform (Y = -135 exactly bridges track to platform)
    tl.to('#jointShoulder', { rotation: armPos.lift.shoulder, duration: 1, ease: "power1.inOut" }, "lift")
      .to('#jointElbow', { rotation: armPos.lift.elbow, duration: 1, ease: "power1.inOut" }, "lift")
      .to('#jointWrist', { rotation: armPos.lift.wrist, duration: 1, ease: "power1.inOut" }, "lift")
      .to(box, { y: -135, duration: 1, ease: "power1.inOut" }, "lift");

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

    // Arm reaches to platform
    tl.to('#jointShoulder', { rotation: armPos.lift.shoulder, duration: 0.6, ease: "power1.inOut" }, "reach")
      .to('#jointElbow', { rotation: armPos.lift.elbow, duration: 0.6, ease: "power1.inOut" }, "reach")
      .to('#jointWrist', { rotation: armPos.lift.wrist, duration: 0.6, ease: "power1.inOut" }, "reach");

    // Arm and Box lower back to conveyor (Y = 0)
    tl.to('#jointShoulder', { rotation: armPos.reach.shoulder, duration: 1, ease: "power1.inOut" }, "lower")
      .to('#jointElbow', { rotation: armPos.reach.elbow, duration: 1, ease: "power1.inOut" }, "lower")
      .to('#jointWrist', { rotation: armPos.reach.wrist, duration: 1, ease: "power1.inOut" }, "lower")
      .to(box, { y: 0, duration: 1, ease: "power1.inOut" }, "lower");

    // Arm idles
    tl.to('#jointShoulder', { rotation: armPos.idle.shoulder, duration: 0.8, ease: "power1.inOut" }, "idle")
      .to('#jointElbow', { rotation: armPos.idle.elbow, duration: 0.8, ease: "power1.inOut" }, "idle")
      .to('#jointWrist', { rotation: armPos.idle.wrist, duration: 0.8, ease: "power1.inOut" }, "idle");
  });
}
