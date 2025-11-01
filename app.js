import { podcasts } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const podcastGrid = document.getElementById("podcastGrid");
  const genreFilter = document.getElementById("genreFilter");
  const sortBy = document.getElementById("sortBy");
  const searchInput = document.getElementById("searchInput");
  const modal = document.getElementById("podcastModal");
  const modalContent = document.getElementById("modalContent");

  // --- Populate Genre Dropdown ---
  const allGenres = [...new Set(podcasts.flatMap((p) => p.genres))];
  allGenres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });

  // --- Render Podcast Cards ---
  function renderPodcasts(list) {
    podcastGrid.innerHTML = "";
    if (list.length === 0) {
      podcastGrid.innerHTML =
        '<p class="text-center col-span-full text-gray-500">No podcasts found.</p>';
      return;
    }

    list.forEach((p) => {
      const card = document.createElement("div");
      card.className =
        "bg-white rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-1 hover:scale-105 cursor-pointer p-4 flex flex-col";

      card.innerHTML = `
        <img src="${p.image}" alt="${p.title}" class="rounded-lg mb-4 w-full h-48 object-cover">
        <h2 class="font-bold text-lg mb-1">${p.title}</h2>
        <p class="text-sm text-gray-500 mb-2">${p.genres.join(", ")}</p>
        <p class="text-xs text-gray-400">Last updated: ${new Date(
          p.updated
        ).toLocaleDateString()}</p>
      `;

      card.addEventListener("click", () => openModal(p));
      podcastGrid.appendChild(card);
    });
  }

  // --- Modal (Responsive Two-Column Layout) ---
  function openModal(podcast) {
    const seasonList = podcast.seasons?.length
      ? podcast.seasons
          .map(
            (s, i) => `
          <li class="flex justify-between items-center border-b border-gray-200 py-2">
            <span class="font-medium text-gray-800">${s.title || `Season ${
              i + 1
            }`}</span>
            <span class="text-gray-500 text-sm">${s.episodes} episodes</span>
          </li>`
          )
          .join("")
      : "<li class='text-gray-500 italic py-2'>No seasons available.</li>";

    modalContent.innerHTML = `
      <div class="relative bg-white rounded-2xl shadow-xl p-6 max-w-5xl w-[95%] mx-auto overflow-y-auto max-h-[90vh] transform transition-all duration-300 scale-100">
        <!-- Close Button -->
        <button id="closeModalBtn" class="absolute top-3 right-3 text-gray-600 hover:text-black text-3xl font-bold focus:outline-none" aria-label="Close modal">&times;</button>
        
        <!-- Grid Layout (Responsive) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <!-- Left: Cover Image -->
          <div class="flex justify-center">
            <img src="${podcast.image}" alt="${podcast.title}" class="w-full max-w-sm h-64 md:h-80 object-cover rounded-xl shadow-md">
          </div>

          <!-- Right: Podcast Info -->
          <div class="flex flex-col justify-between">
            <div>
              <h2 class="text-2xl md:text-3xl font-bold text-indigo-700 mb-2">${podcast.title}</h2>
              <p class="text-gray-700 leading-relaxed mb-4 text-sm md:text-base">${podcast.description}</p>
            </div>

            <div class="mt-2">
              <h3 class="font-semibold text-gray-800 mb-1 text-base md:text-lg">Genres</h3>
              <div class="flex flex-wrap gap-2 mb-3">
                ${podcast.genres
                  .map(
                    (genre) =>
                      `<span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">${genre}</span>`
                  )
                  .join("")}
              </div>
              <p class="text-sm text-gray-500">Last updated: ${new Date(
                podcast.updated
              ).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <!-- Seasons List -->
        <div class="mt-8">
          <h3 class="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">Seasons</h3>
          <ul class="divide-y divide-gray-200 text-sm md:text-base">
            ${seasonList}
          </ul>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex", "items-center", "justify-center", "fixed", "inset-0", "bg-black/50", "z-50", "p-4");

    document
      .getElementById("closeModalBtn")
      .addEventListener("click", closeModalHandler);
  }

  // --- Close Modal ---
  function closeModalHandler() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  // --- Keyboard & Click Outside Close ---
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModalHandler();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalHandler();
  });

  // --- Filters & Search ---
  function applyFilters() {
    const search = searchInput.value.toLowerCase();
    const genre = genreFilter.value;
    const sort = sortBy.value;

    let filtered = podcasts.filter(
      (p) =>
        p.title.toLowerCase().includes(search) &&
        (genre ? p.genres.includes(genre) : true)
    );

    if (sort === "title") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      filtered.sort((a, b) => new Date(b.updated) - new Date(a.updated));
    }

    renderPodcasts(filtered);
  }

  [searchInput, genreFilter, sortBy].forEach((el) =>
    el.addEventListener("input", applyFilters)
  );

  // --- Initial Render ---
  renderPodcasts(podcasts);
});