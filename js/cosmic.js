const starCounter = document.querySelector("[data-star-count]");

async function loadStarCount() {
  if (!starCounter) return;

  try {
    const response = await fetch("https://api.github.com/repos/Dai-GoGo/Dai-GoGo.github.io", {
      headers: { Accept: "application/vnd.github+json" }
    });
    if (!response.ok) throw new Error("GitHub API request failed");
    const repository = await response.json();
    const count = Number(repository.stargazers_count || 0);
    starCounter.textContent = `${count} stars`;
  } catch {
    starCounter.textContent = "GitHub ↗";
  }
}

loadStarCount();

const signalDial = document.querySelector("[data-signal-dial]");
const signalButton = document.querySelector("[data-signal-button]");
const signalStatus = document.querySelector("[data-signal-status]");

signalDial?.addEventListener("pointermove", (event) => {
  const bounds = signalDial.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
  const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 10;
  signalDial.style.setProperty("--signal-x", `${x}px`);
  signalDial.style.setProperty("--signal-y", `${y}px`);
});

signalButton?.addEventListener("click", () => {
  const active = signalButton.getAttribute("aria-pressed") === "true";
  signalButton.setAttribute("aria-pressed", String(!active));
  signalButton.textContent = active ? "点亮信号" : "信号已点亮";
  if (signalStatus) signalStatus.textContent = active ? "移动指针，寻找轨道中的微光。" : "谢谢。现在把这束光带回 GitHub 吧。";
});
