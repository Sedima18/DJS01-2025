import { podcasts, genres, seasons } from "./data.js";

/**
 * @class PodcastApp
 * @classdesc Main controller class that initializes the app, handles filtering, sorting, and modal interactions.
 */
class PodcastApp {
  constructor() {
    this.podcastGrid = document.getElementById("podcastGrid");
    this.genreFilter = document.getElementById("genreFilter");
    this.sortBy = document.getElementById("sortBy");
    this.searchInput = document.getElementById("searchInput");
    this.modal = new ModalView(document.getElementById("podcastModal"), document.getElementById("modalContent"));

    // Precompute genre map for quick lookups
    this.genreMap = this.createGenreMap(genres);

    // Initialize filters and render UI
    this.populateGenreDropdown();
    this.addEventListeners();
    this.renderPodcasts(podcasts);
  }

  /**
   * Create a lookup object for genre titles.
   * @param {Array} genres - List of genre objects.
   * @returns {Object} Map of genre ID to title.
   */
  createGenreMap(genres) {
    return genres.reduce((map, g) => {
      map[g.id] = g.title;
      return map;
    }, {});
  }

  /**
   * Populate genre filter dropdown.
   */
  populateGenreDropdown() {
    genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre.id;
      option.textContent = genre.title;
      this.genreFilter.appendChild(option);
    });
  }

  /**
   * Attach event listeners for filters and search.
   */
  addEventListeners() {
    [this.searchInput, this.genreFilter, this.sortBy].forEach((el) =>
      el.addEventListener("input", () => this.applyFilters())
    );
  }

  /**
   * Apply search, genre, and sort filters.
   */
  applyFilters() {
    const search = this.searchInput.value.toLowerCase();
    const genre = this.genreFilter.value;
    const sort = this.sortBy.value;

    let filtered = podcasts.filter(
      (p) =>
        p.title.toLowerCase().includes(search) &&
        (genre ? p.genres.includes(parseInt(genre)) : true)
    );

    filtered = this.sortPodcasts(filtered, sort);
    this.renderPodcasts(filtered);
  }

  /**
   * Sort podcasts by title or last updated date.
   * @param {Array} list - Filtered podcast list.
   * @param {string} sort - Sort criteria.
   * @returns {Array} Sorted podcast list.
   */
  sortPodcasts(list, sort) {
    if (sort === "title") {
      return list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list.sort((a, b) => new Date(b.updated) - new Date(a.updated));
  }

  /**
   * Render all podcast cards on the landing page.
   * @param {Array} list - List of podcasts to render.
   */
  renderPodcasts(list) {
    this.podcastGrid.innerHTML = "";

    if (list.length === 0) {
      this.podcastGrid.innerHTML = `<p class="text-center col-span-full text-gray-500">No podcasts found.</p>`;
      return;
    }

    list.forEach((p) => {
      const genreNames = p.genres
        ? p.genres.map((id) => this.genreMap[id] || "Unknown").join(", ")
        : "Uncategorized";

      const card = this.createPodcastCard(p, genreNames);
      this.podcastGrid.appendChild(card);
    });
  }

  /**
   * Create a single podcast card element.
   * @param {Object} podcast - Podcast object.
   * @param {string} genreNames - Comma-separated list of genres.
   * @returns {HTMLElement} Podcast card element.
   */
  createPodcastCard(podcast, genreNames) {
    const card = document.createElement("div");
    card.className =
      "bg-white rounded-xl shadow hover:shadow-lg transition-transform transform hover:-translate-y-1 hover:scale-105 cursor-pointer p-4 flex flex-col";

    card.innerHTML = `
      <img src="${podcast.image}" alt="${podcast.title}" class="rounded-lg mb-4 w-full h-48 object-cover">
      <h2 class="font-bold text-lg mb-1">${podcast.title}</h2>
      <p class="text-sm text-gray-600 mb-1">${podcast.seasons} Season${podcast.seasons > 1 ? "s" : ""}</p>
      <p class="text-sm text-indigo-600 mb-2">${genreNames}</p>
      <p class="text-xs text-gray-400">Last updated: ${new Date(
        podcast.updated
      ).toLocaleDateString()}</p>
    `;

    card.addEventListener("click", () => this.modal.openModal(podcast, this.genreMap));
    return card;
  }
}

/**
 * @class ModalView
 * @classdesc Handles modal creation, rendering, and closing.
 */
class ModalView {
  constructor(modalElement, modalContent) {
    this.modalElement = modalElement;
    this.modalContent = modalContent;
    this.addCloseListeners();
  }

  /**
   * Render and open modal with podcast details.
   * @param {Object} podcast - Podcast data.
   * @param {Object} genreMap - Map of genre IDs to names.
   */
  openModal(podcast, genreMap) {
    const genreNames = podcast.genres
      ? podcast.genres.map((id) => genreMap[id] || "Unknown")
      : [];

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

    this.modalContent.innerHTML = `
      <div class="relative bg-white rounded-2xl shadow-xl p-6 max-w-5xl w-[95%] mx-auto overflow-y-auto max-h-[90vh] transform transition-all duration-300 scale-100">
        <!-- Close Button -->
        <button id="closeModalBtn" class="absolute top-3 right-3 text-gray-600 hover:text-black text-3xl font-bold focus:outline-none" aria-label="Close modal">&times;</button>

        <!-- Layout: Image Left, Info Right -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div class="flex justify-center">
            <img src="${podcast.image}" alt="${podcast.title}" class="w-full max-w-sm h-64 md:h-80 object-cover rounded-xl shadow-md">
          </div>

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

        <div class="mt-8">
          <h3 class="font-semibold text-lg mb-3 text-gray-800 border-b pb-2">Seasons (${podcast.seasons})</h3>
          <ul class="divide-y divide-gray-200 text-sm md:text-base">${seasonList}</ul>
        </div>
      </div>
    `;

    this.show();
  }

  /**
   * Show modal with background overlay.
   */
  show() {
    this.modalElement.classList.remove("hidden");
    this.modalElement.classList.add(
      "flex",
      "items-center",
      "justify-center",
      "fixed",
      "inset-0",
      "bg-black/50",
      "z-50",
      "p-4"
    );
    document.body.style.overflow = "hidden"; // prevent background scroll
  }

  /**
   * Hide and reset modal.
   */
  hide() {
    this.modalElement.classList.add("hidden");
    this.modalElement.classList.remove("flex");
    document.body.style.overflow = "auto";
  }

  /**
   * Add global event listeners for closing modal.
   */
  addCloseListeners() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hide();
    });
    this.modalElement.addEventListener("click", (e) => {
      if (e.target === this.modalElement) this.hide();
    });
    this.modalElement.addEventListener("click", (e) => {
      if (e.target.id === "closeModalBtn") this.hide();
    });
  }
}

//  Initialize the Podcast App
document.addEventListener("DOMContentLoaded", () => {
  new PodcastApp();
});
