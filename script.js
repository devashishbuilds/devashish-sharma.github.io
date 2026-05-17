// script.js

const conveyor = document.getElementById("conveyor");
const robotArm = document.getElementById("robotArm");
const statusText = document.getElementById("statusText");

let currentSection = null;

const positions = {
  education: 0,
  projects: -200,
  experience: -400,
  skills: -600,
  contact: -800
};

async function selectSection(section) {

  updateStatus(`SELECTED ${section.toUpperCase()}`);

  // Return previous box
  if (currentSection && currentSection !== section) {

    updateStatus(`RETURNING ${currentSection.toUpperCase()}`);

    await returnPreviousBox(currentSection);

  }

  // Move conveyor
  updateStatus(`MOVING CONVEYOR`);

  await moveConveyor(section);

  // Pick box
  updateStatus(`PICKING ${section.toUpperCase()}`);

  await pickAndPlace(section);

  // Scroll
  updateStatus(`OPENING ${section.toUpperCase()}`);

  document
    .getElementById(section)
    .scrollIntoView({
      behavior: "smooth"
    });

  currentSection = section;

  updateStatus(`READY`);
}

/* ================= STATUS ================= */

function updateStatus(text) {
  statusText.innerHTML = text;
}

/* ================= CONVEYOR ================= */

function moveConveyor(section) {

  return new Promise((resolve) => {

    gsap.to(conveyor, {
      x: positions[section],
      duration: 2,
      ease: "power2.inOut",
      onComplete: resolve
    });

  });

}

/* ================= PICK AND PLACE ================= */

function pickAndPlace(section) {

  return new Promise((resolve) => {

    const box = document.getElementById(`${section}-box`);

    const tl = gsap.timeline({
      onComplete: resolve
    });

    tl.to(robotArm, {
      rotation: -15,
      duration: 0.8
    })

    .to(box, {
      y: -130,
      duration: 0.8
    })

    .to(box, {
      x: 400,
      y: -260,
      duration: 1.2
    })

    .to(robotArm, {
      rotation: 0,
      duration: 0.8
    });

  });

}

/* ================= RETURN BOX ================= */

function returnPreviousBox(section) {

  return new Promise((resolve) => {

    const box = document.getElementById(`${section}-box`);

    gsap.to(box, {
      x: 0,
      y: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: resolve
    });

  });

}