// news.js

// All news from VTC Texim (https://truckersmp.com/vtc/74050)
// Add/adjust entries here as new events/news are posted.
const newsItems = [
  {
    date: "2025-04-02",
    title: "Simulation 1 – Convoy Event",
    description:
      "ETS2 Convoy event organized by VTC Texim. No DLCs required. Join us for Simulation 1.",
    link: "https://truckersmp.com/vtc/74050"
  }
  // Add more news objects here in the same format as you get more events/news.
];

// Render news into the page
function renderNews() {
  const container = document.getElementById("news-container");
  if (!container) return;

  container.innerHTML = ""; // clear any existing content

  if (!newsItems || newsItems.length === 0) {
    container.innerHTML = "<p>No news available at the moment.</p>";
    return;
  }

  // Sort by date descending (newest first)
  const sorted = [...newsItems].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const list = document.createElement("ul");
  list.style.listStyle = "none";
  list.style.padding = "0";

  sorted.forEach(item => {
    const li = document.createElement("li");
    li.style.marginBottom = "1.25rem";

    const dateEl = document.createElement("div");
    dateEl.textContent = new Date(item.date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    dateEl.style.fontSize = "0.85rem";
    dateEl.style.color = "#666";

    const titleEl = document.createElement("a");
    titleEl.href = item.link || "#";
    titleEl.target = "_blank";
    titleEl.rel = "noopener noreferrer";
    titleEl.textContent = item.title;
    titleEl.style.display = "block";
    titleEl.style.fontSize = "1.1rem";
    titleEl.style.fontWeight = "600";
    titleEl.style.textDecoration = "none";
    titleEl.style.color = "#000";

    const descEl = document.createElement("p");
    descEl.textContent = item.description;
    descEl.style.margin = "0.25rem 0 0 0";
    descEl.style.fontSize = "0.95rem";

    li.appendChild(dateEl);
    li.appendChild(titleEl);
    li.appendChild(descEl);
    list.appendChild(li);
  });

  container.appendChild(list);
}

// Run after DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderNews);
} else {
  renderNews();
}
