const navButtons = document.querySelectorAll(".nav-btn");
const pages = document.querySelectorAll(".page");
const sideButtons = document.querySelectorAll(".side-btn");
const homePanels = document.querySelectorAll(".home-panel");
const uploadsGrid = document.getElementById("uploads-grid");
const signupButton = document.getElementById("signup-button");
const signupModal = document.getElementById("signup-modal");
const exclusiveHome = document.getElementById("exclusive-home");
const termsModal = document.getElementById("terms-modal");
const termsScroll = document.getElementById("terms-scroll");
const termsActions = document.getElementById("terms-actions");
const agreeButton = document.getElementById("agree-button");
const ageButton = document.getElementById("age-button");
const adminCodeInput = document.getElementById("admin-code");
const unlockUploads = document.getElementById("unlock-uploads");
const adminStatus = document.getElementById("admin-status");
const uploadBoxes = document.querySelectorAll(".upload-box");
const contactForm = document.getElementById("contact-form");
const descriptionInput = document.getElementById("description");
const wordCount = document.getElementById("word-count");

let hasAgreed = false;
let hasConfirmedAge = false;
let contactLocked = false;

const uploads = [];

const showPage = (id) => {
  if (contactLocked && id !== "home") {
    alert("Please send the contact form before leaving this section.");
    return;
  }

  pages.forEach((page) => {
    page.classList.toggle("active", page.id === id);
  });

  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.target === id);
  });
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => showPage(button.dataset.target));
});

exclusiveHome.addEventListener("click", () => showPage("landing"));

signupButton.addEventListener("click", () => {
  signupModal.classList.add("active");
  signupModal.setAttribute("aria-hidden", "false");
});

signupModal.addEventListener("click", () => {
  signupModal.classList.remove("active");
  signupModal.setAttribute("aria-hidden", "true");
});

sideButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (contactLocked && button.dataset.home !== "contact") {
      alert("Please send the contact form before leaving this section.");
      return;
    }

    const target = button.dataset.home;
    sideButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
    homePanels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === `home-${target}`);
    });

    contactLocked = target === "contact";
  });
});

const renderUploads = () => {
  if (!uploads.length) {
    uploadsGrid.innerHTML = "<p>No uploads yet.</p>";
    return;
  }

  uploadsGrid.innerHTML = "";
  uploads.forEach((item) => {
    if (item.type === "image") {
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = "Uploaded image";
      uploadsGrid.appendChild(img);
      return;
    }

    const video = document.createElement("video");
    video.src = item.src;
    video.controls = true;
    uploadsGrid.appendChild(video);
  });
};

const addUpload = (file, type) => {
  const src = URL.createObjectURL(file);
  uploads.push({ type, src });
  renderUploads();
};

const enableUploads = () => {
  uploadBoxes.forEach((box) => {
    box.classList.add("enabled");
    const input = box.querySelector("input");
    if (input) {
      input.disabled = false;
    }
  });
  adminStatus.textContent = "Uploads unlocked. You can drag & drop files.";
  adminStatus.style.color = "#9cffc9";
};

unlockUploads.addEventListener("click", () => {
  if (adminCodeInput.value === "0000") {
    enableUploads();
  } else {
    adminStatus.textContent = "Incorrect code.";
    adminStatus.style.color = "#ffd1e8";
  }
});

const isValidFile = (file, type) => {
  if (type === "image") {
    return file.type.startsWith("image/");
  }
  if (type === "video") {
    return file.type.startsWith("video/");
  }
  return false;
};

document.addEventListener("dragover", (event) => {
  event.preventDefault();
});

document.addEventListener("drop", (event) => {
  event.preventDefault();
});

uploadBoxes.forEach((box) => {
  const input = box.querySelector("input");

  box.addEventListener("click", () => {
    if (!box.classList.contains("enabled")) return;
    input.click();
  });

  box.addEventListener("dragover", (event) => {
    if (!box.classList.contains("enabled")) return;
    event.preventDefault();
    box.style.background = "rgba(255, 255, 255, 0.15)";
  });

  box.addEventListener("dragleave", () => {
    box.style.background = "transparent";
  });

  box.addEventListener("drop", (event) => {
    if (!box.classList.contains("enabled")) return;
    event.preventDefault();
    box.style.background = "transparent";
    const files = Array.from(event.dataTransfer.files).filter((file) =>
      isValidFile(file, box.dataset.type)
    );
    files.forEach((file) => addUpload(file, box.dataset.type));
  });

  input.addEventListener("change", () => {
    if (!box.classList.contains("enabled")) return;
    Array.from(input.files)
      .filter((file) => isValidFile(file, box.dataset.type))
      .forEach((file) => addUpload(file, box.dataset.type));
    input.value = "";
  });
});

termsScroll.addEventListener("scroll", () => {
  const reachedBottom =
    termsScroll.scrollTop + termsScroll.clientHeight >= termsScroll.scrollHeight - 5;
  if (reachedBottom) {
    termsActions.classList.remove("hidden");
  }
});

const closeTermsIfReady = () => {
  if (hasAgreed && hasConfirmedAge) {
    localStorage.setItem("termsAccepted", "true");
    termsModal.classList.remove("active");
    termsModal.setAttribute("aria-hidden", "true");
    showPage("landing");
  }
};

agreeButton.addEventListener("click", () => {
  hasAgreed = true;
  agreeButton.disabled = true;
  closeTermsIfReady();
});

ageButton.addEventListener("click", () => {
  hasConfirmedAge = true;
  ageButton.disabled = true;
  closeTermsIfReady();
});

const showTermsIfNeeded = () => {
  const accepted = localStorage.getItem("termsAccepted");
  if (!accepted) {
    termsModal.classList.add("active");
    termsModal.setAttribute("aria-hidden", "false");
  }
};

const updateWordCount = () => {
  const words = descriptionInput.value
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length > 200) {
    descriptionInput.value = words.slice(0, 200).join(" ");
  }
  const count = descriptionInput.value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  wordCount.textContent = `${count} / 200 words`;
};

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value.trim();
  const issue = document.getElementById("issue").value;
  const description = descriptionInput.value.trim();

  const subject = encodeURIComponent(`Support Request: ${issue}`);
  const body = encodeURIComponent(
    `From: ${email}\nIssue: ${issue}\nDescription: ${description}`
  );
  window.location.href = `mailto:insanitbjones@gmail.com?subject=${subject}&body=${body}`;

  contactLocked = false;
  contactForm.reset();
  updateWordCount();
  alert("Email draft created. You can now navigate away.");
});

updateWordCount();
renderUploads();
showPage("landing");
showTermsIfNeeded();
