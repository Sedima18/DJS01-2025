import { podcasts } from "./data.js";

document.addEventListener("DOMContentLoaded", () => {
  const podcastGrid = document.getElementById("podcastGrid");
  const genreFilter = document.getElementById("genreFilter");
  const sortBy = document.getElementById("sortBy");
  const searchInput = document.getElementById("searchInput");
  const modal = document.getElementById("podcastModal");
  const modalContent = document.getElementById("modalContent");
  const closeModal = document.getElementById("closeModal");

  // --- Populate genre dropdown ---
  const allGenres = [...new Set(podcasts.flatMap((p) => p.genres))];
  allGenres.forEach((genre) => {
    const option = document.createElement("option");
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });

  // --- Render podcast cards ---
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
        <img src="${p.image}" alt="${p.title}" class="rounded-lg mb-4 w-full h-40 object-cover">
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

  // --- Modal View: show details ---
  function openModal(podcast) {
    const seasonList = podcast.seasons
      ? podcast.seasons
          .map(
            (s, i) => `
        <li class="flex justify-between items-center border-b border-gray-200 py-2">
          <span class="font-medium text-gray-700">${s.title || `Season ${i + 1}`}</span>
          <span class="text-gray-500 text-sm">${s.episodes} episodes</span>
        </li>`
          )
          .join("")
      : "<li class='text-gray-500'>No seasons available.</li>";

    modalContent.innerHTML = `
      <div class="relative bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto w-full">
        <button id="closeModalBtn" class="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl font-bold focus:outline-none" aria-label="Close modal">&times;</button>

        <img src="${podcast.image}" alt="${podcast.title}" class="w-full rounded-xl mb-4 max-h-72 object-cover">
        
        <h2 class="text-2xl font-bold mb-2">${podcast.title}</h2>
        <p class="text-gray-700 mb-4 leading-relaxed">${podcast.description}</p>

        <div class="flex flex-wrap gap-2 mb-4">
          ${podcast.genres
            .map(
              (genre) =>
                `<span class="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">${genre}</span>`
            )
            .join("")}
        </div>

        <p class="text-sm text-gray-500 mb-6">Last updated: ${new Date(
          podcast.updated
        ).toLocaleDateString()}</p>

        <h3 class="font-semibold text-lg mb-2">Seasons</h3>
        <ul class="divide-y divide-gray-100 mb-4">
          ${seasonList}
        </ul>
      </div>
    `;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    // attach close handler to the button
    document.getElementById("closeModalBtn").addEventListener("click", closeModalHandler);
  }

  function closeModalHandler() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }

  closeModal.addEventListener("click", closeModalHandler);
  window.addEventListener("keydown", (e) => e.key === "Escape" && closeModalHandler());

  // --- Filters ---
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

  // --- Initial render ---
  renderPodcasts(podcasts);
});
