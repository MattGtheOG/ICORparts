const scenarios = {
  counter: {
    kicker: "Customer at the counter",
    title: "Answer common requests without reopening the same catalogs.",
    body: "Search a known oil filter, belt, battery, windshield, or maintenance part. Confirm the fitment details, copy the number, and continue the transaction in the dealership's existing system.",
    benefits: ["Fewer repeat catalog detours", "Less manual part-number typing", "Favorites stay personal to each employee"],
  },
  sales: {
    kicker: "Salesperson needs a quote",
    title: "Build accessory quotes with a consistent shared reference.",
    body: "Move through familiar roofs, windshields, doors, protection, and audio accessories by model. Copy each confirmed number in the format your CRM or cashier screen expects.",
    benefits: ["Faster handoff between Sales and Parts", "Shared naming across the counter", "Recently copied numbers stay easy to revisit"],
  },
  service: {
    kicker: "Repair order in progress",
    title: "Keep common service parts close while the customer is waiting.",
    body: "Filter by unit fitment and search common maintenance items without leaving the repair-order workflow for every repeat lookup. Official catalogs remain available for final fitment confirmation.",
    benefits: ["Quicker access to common maintenance numbers", "Fitment notes live beside the reference", "Copy formats reduce retyping into repair orders"],
  },
  manager: {
    kicker: "Numbers and brands change",
    title: "Update the dealership's shared board without a software rebuild.",
    body: "Edit individual parts or use Excel for bulk maintenance. Archive brands without losing their records, control employee permissions, review data-quality reports, and keep recoverable backups.",
    benefits: ["One maintained source for the team", "Archived data can be restored", "Imports, reports, and backups support safer upkeep"],
  },
};

const menuButton = document.querySelector(".menu-button");
const siteNav = document.querySelector(".site-nav");

menuButton.addEventListener("click", () => {
  const open = !siteNav.classList.contains("is-open");
  siteNav.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));
});

siteNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    siteNav.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".scenario-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const selected = scenarios[tab.dataset.scenario];
    if (!selected) {
      return;
    }
    document.querySelectorAll(".scenario-tab").forEach((button) => {
      const active = button === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    document.getElementById("scenario-kicker").textContent = selected.kicker;
    document.getElementById("scenario-title").textContent = selected.title;
    document.getElementById("scenario-body").textContent = selected.body;
    document.getElementById("scenario-benefits").replaceChildren(
      ...selected.benefits.map((benefit) => {
        const item = document.createElement("li");
        item.textContent = benefit;
        return item;
      }),
    );
  });
});
