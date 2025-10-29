import { podcasts, genres, seasons } from "./data.js";

const genreFilter = document.getElementById("genreFilter");
const podcastList = document.getElementById("podcastList");
const recentList = document.getElementById("recentList");
const searchInput = document.getElementById("searchInput");

// Modal elements
const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const seasonList = document.getElementById("seasonList");
const closeModal = document.getElementById("closeModal");

// ===== Populate Genres =====
genres.forEach((genre) => {
  const option = document.createElement("option");
  option.value = genre.id;
  option.textContent = genre.title;
  genreFilter.appendChild(option);
});

// ===== Render Podcast Cards =====
function renderPodcasts(list, container) {
  container.innerHTML = "";

  list.forEach((podcast) => {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300";

    card.innerHTML = `
      <img src="${podcast.image}" alt="${podcast.title}" class="w-full h-48 object-cover" />
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-1">${podcast.title}</h2>
        <p class="text-sm text-gray-600 mb-3">${podcast.description}</p>
        <div class="flex justify-between items-center">
          <span class="text-indigo-600 text-sm font-medium">${podcast.seasons} Seasons</span>
          <button class="viewBtn text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  data-id="${podcast.id}">
            View
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (list.length === 0) {
    container.innerHTML = `
      <p class="col-span-full text-center text-gray-500 text-lg mt-10">
        No podcasts found 🎧
      </p>`;
  }

  // Attach modal events
  document.querySelectorAll(".viewBtn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      openModal(e.target.dataset.id);
    });
  });
}

// ===== Modal Functions =====
function openModal(podcastId) {
  const podcast = podcasts.find((p) => p.id === podcastId);
  const seasonData = seasons.find((s) => s.id === podcastId);

  modalTitle.textContent = podcast.title;
  modalDesc.textContent = podcast.description;

  if (seasonData?.seasonDetails?.length) {
    seasonList.innerHTML = seasonData.seasonDetails
      .map(
        (s) => `
        <div class="flex justify-between items-center py-2 border-b border-gray-200">
          <span class="font-medium text-gray-700">Season ${s.season}</span>
          <span class="text-sm text-indigo-600">${s.episodes} episodes</span>
        </div>`
      )
      .join("");
  } else {
    seasonList.innerHTML = `<p class="text-gray-500 text-sm">No season data available.</p>`;
  }

  modalBackdrop.classList.remove("hidden");
  modalBackdrop.classList.add("flex");
}

function closeModalFn() {
  modalBackdrop.classList.add("hidden");
  modalBackdrop.classList.remove("flex");
}

closeModal.addEventListener("click", closeModalFn);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModalFn();
});

// ===== Initial Render =====
renderPodcasts(podcasts, podcastList);

// Show recently uploaded (last 2)
const recent = podcasts.slice(-2);
renderPodcasts(recent, recentList);

// ===== Filter and Search =====
genreFilter.addEventListener("change", applyFilters);
searchInput.addEventListener("input", applyFilters);

function applyFilters() {
  const selectedGenre = genreFilter.value;
  const searchTerm = searchInput.value.toLowerCase();

  let filtered = podcasts.filter((p) =>
    p.title.toLowerCase().includes(searchTerm)
  );

  if (selectedGenre !== "all") {
    filtered = filtered.filter((p) => p.genres.includes(selectedGenre));
  }

  renderPodcasts(filtered, podcastList);
}