let allCredits = [];   // store full data
let activeTag = null;  // currently selected filter

function CreditIcon(person) {
  const { name, image, link } = person;

  const wrapper = document.createElement("a");
  wrapper.className = "credit-icon";
  wrapper.href = link;
  wrapper.target = "_blank";
  wrapper.rel = "noopener noreferrer";

  // Random rotation
  const angle = (Math.random() * 8) - 4;
  wrapper.style.setProperty("--tilt", `${angle}deg`);

  wrapper.innerHTML = `
    <div class="credit-name">${name}</div>
    <img src="${image}" alt="${name}">
    <div class="overlay">${name}</div>
  `;

  return wrapper;
}
// Render the grid based on filter
function renderGrid() {
  const grid = document.getElementById("credits-grid");
  grid.innerHTML = "";

  const filtered = activeTag
    ? allCredits.filter(person => person.tags.includes(activeTag))
    : allCredits;

  filtered.forEach(person => {
    grid.appendChild(CreditIcon(person));
  });
}

// Create tag buttons dynamically
function createTagButtons(tags) {
  const container = document.getElementById("tag-buttons");

  tags.forEach(tag => {
    const btn = document.createElement("div");
    btn.className = "tag-button";
    btn.textContent = tag;

    btn.addEventListener("click", () => {
      // Toggle behavior
      if (activeTag === tag) {
        activeTag = null;
        btn.classList.remove("active");
      } else {
        activeTag = tag;

        // Clear active state from all buttons
        document.querySelectorAll(".tag-button").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      }

      renderGrid();
    });

    container.appendChild(btn);
  });
}

function CastIcon(cast) {
  const wrapper = document.createElement("div");
  wrapper.className = "cast-icon";

  // Depth ordering
  wrapper.style.zIndex = cast.orderDepth;

  const img = document.createElement("img");
  img.src = cast.castCreditImage;
  img.alt = cast.name;

  const hover = document.createElement("div");
  hover.className = "cast-hover-zone";

  hover.style.left = (cast.hoverArea.x * 100) + "%";
  hover.style.top = (cast.hoverArea.y * 100) + "%";
  hover.style.width = (cast.hoverArea.width * 100) + "%";
  hover.style.height = (cast.hoverArea.height * 100) + "%";

  wrapper.appendChild(img);
  wrapper.appendChild(hover);

  return wrapper;
}

fetch("credits.json")
  .then(res => res.json())
  .then(data => {

    // --- CREW SETUP ---
    allCredits = data.credits;

    const usedTags = new Set();
    allCredits.forEach(person => {
      person.tags.forEach(tag => usedTags.add(tag));
    });

    const orderedTags = data.tagOrder.filter(tag => usedTags.has(tag));

    createTagButtons(orderedTags);
    renderGrid();

    // --- CAST SETUP ---
    const castGrid = document.querySelector(".cast-grid");

    data.cast
      .sort((a, b) => a.orderDepth - b.orderDepth)
      .forEach(castMember => {
        castGrid.appendChild(CastIcon(castMember));
      });

    // --- HOVER + INFO BOX LOGIC ---
    const hoverZones = castGrid.querySelectorAll(".cast-hover-zone");

    hoverZones.forEach(zone => {
      const icon = zone.parentElement;

      zone.addEventListener("mouseenter", () => {
        castGrid.classList.add("dim");
        icon.classList.add("active");

        // Find the cast data for this icon
        const castName = icon.querySelector("img").alt;
        const castData = data.cast.find(c => c.name === castName);

        // Update info box
        document.getElementById("cast-info-name").textContent = castData.name;
        document.getElementById("cast-info-description").textContent = castData.description;

        document.getElementById("cast-info-voicedby").textContent =
        `Voiced by: ${castData.voicedBy}`;
        document.getElementById("cast-info-image").src = castData.castMemberImage;

        // Clicking the cast icon opens the voice actor link
        icon.onclick = () => {
          window.open(castData.voiceLink, "_blank");
        };
      });

      zone.addEventListener("mouseleave", () => {
        castGrid.classList.remove("dim");
        icon.classList.remove("active");
      });
    });
  });