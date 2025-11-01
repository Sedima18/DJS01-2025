import { podcasts, genres, seasons } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const podcastGrid = document.getElementById("podcastGrid");
  const genreFilter = document.getElementById("genreFilter");
  const sortBy = document.getElementById("sortBy");
  const searchInput = document.getElementById("searchInput");
  const modal = document.getElementById("podcastModal");
  const modalContent = document.getElementById("modalContent");

  // 🔹 Map genre IDs to readable titles
  const genreMap = {};
  genres.forEach((g) => (genreMap[g.id] = g.title));

  // 🔹 Populate genre filter dropdown
  genres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre.id;
    option.textContent = genre.title;
    genreFilter.appendChild(option);
  });

  // 🔹 Render podcast cards
  function renderPodcasts(list) {
    podcastGrid.innerHTML = "";
    if (list.length === 0) {
      podcastGrid.innerHTML = `<p class="text-center col-span-full text-gray-500">No podcasts found.</p>`;
      return;
    }

    list.forEach((p) => {
      // Map genre IDs to names
      const genreNames = p.genres
        ? p.genres.map((id) => genreMap[id] || "Unknown").join(", ")
        : "Uncategorized";

      const card = document.createElement("div");
      card.className =
        "bg-white rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-1 hover:scale-105 cursor-pointer p-4 flex flex-col";

      card.innerHTML = `
        <img src="${p.image}" alt="${p.title}" class="rounded-lg mb-4 w-full h-48 object-cover">
        <h2 class="font-bold text-lg mb-1">${p.title}</h2>
        <p class="text-sm text-gray-600 mb-1">${p.seasons} Season${p.seasons > 1 ? "s" : ""}</p>
        <p class="text-sm text-indigo-600 mb-2">${genreNames}</p>
        <p class="text-xs text-gray-400">Last updated: ${new Date(
          p.updated
        ).toLocaleDateString()}</p>
      `;

      card.addEventListener("click", () => openModal(p));
      podcastGrid.appendChild(card);
    });
  }

  // 🔹 Modal View
  function openModal(podcast) {
    const genreNames = podcast.genres
      ? podcast.genres.map((id) => genreMap[id] || "Unknown")
      : [];

    // Find season details for this podcast
    const seasonInfo = seasons.find((s) => s.id === podcast.id);

    const seasonList = seasonInfo
      ? seasonInfo.seasonDetails
          .map(
            (s) => `
          <li class="flex justify-between items-center border-b border-gray-200 py-2">
            <span class="font-medium text-gray-800">${s.title}</span>
            <span class="text-gray-500 text-sm">${s.episodes} episodes</span>
          </li>`
          )
          .join("")
      : "<li class='text-gray-500 italic py-2'>No season details available.</li>";

    modalContent.innerHTML = `
      <div class="relative bg-white rounded-2xl shadow-xl p-6 max-w-5xl w-[95%] mx-auto overflow-y-auto max-h-[90vh] transform transition-all duration-300 scale-100">
        <!-- Close Button -->
        <button id="closeModalBtn" class="absolute top-3 right-3 text-gray-600 hover:text-black text-3xl font-bold focus:outline-none" aria-label="Close modal">&times;</button>

        <!-- Layout: Image Left, Info Right -->
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
                ${genreNames
                  .map(
                    (name) =>
                      `<span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">${name}</span>`
                  )
                  .join("")}
              </div>
              <p class="text-sm text-gray-500">Last updated: ${new Date(
                podcast.updated
              ).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <!-- Seasons Section -->
        <div class="mt-8">
          <h3 class="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">Seasons (${podcast.seasons})</h3>
          <ul class="divide-y divide-gray-200 text-sm md:text-base">
            ${seasonList}
          </ul>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add(
      "flex",
      "items-center",
      "justify-center",
      "fixed",
      "inset-0",
      "bg-black/50",
      "z-50",
      "p-4"
    );

    document
      .getElementById("closeModalBtn")
      .addEventListener("click", closeModalHandler);
  }

  // 🔹 Close Modal
  function closeModalHandler() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  // 🔹 Keyboard and click outside close
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModalHandler();
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalHandler();
  });

  // 🔹 Filtering and searching
  function applyFilters() {
    const search = searchInput.value.toLowerCase();
    const genre = genreFilter.value;
    const sort = sortBy.value;

    let filtered = podcasts.filter(
      (p) =>
        p.title.toLowerCase().includes(search) &&
        (genre ? p.genres.includes(parseInt(genre)) : true)
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

  // 🔹 Initial render
  renderPodcasts(podcasts);
});