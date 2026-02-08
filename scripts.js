// ========================================
// Data Source Configuration
// ========================================
const DATA_SOURCES = {
    reporting: "data/portfolio-reporting.csv",
    editing: "data/portfolio-editing.csv",
    projects: "data/portfolio-projects.csv",
    art: "data/art-portfolio.csv",
    graphics: "https://sstirling.github.io/graphics/data/graphics.json"
};

// ========================================
// PapaParse Loader
// ========================================
function loadPapaParse(callback) {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js";
    script.onload = callback;
    document.head.appendChild(script);
}

function ensurePapaParse(callback) {
    if (typeof Papa === "undefined") {
        loadPapaParse(callback);
    } else {
        callback();
    }
}

// ========================================
// Default visible items per section
// ========================================
const INITIAL_VISIBLE = 4;
const INITIAL_VISIBLE_MUSIC = 4;

// ========================================
// Shared Render Utility
// ========================================
function renderCardGrid(data, container, renderFn, initialCount) {
    container.innerHTML = "";
    const limit = initialCount || INITIAL_VISIBLE;

    // Remove any existing view-more button for this section
    const section = container.closest(".portfolio-section");
    const existingBtn = section ? section.querySelector(".view-more-btn") : null;
    if (existingBtn) existingBtn.remove();

    data.forEach((item, i) => {
        const card = renderFn(item);
        if (card) {
            card.style.transitionDelay = `${Math.min(i, limit - 1) * 40}ms`;
            if (i >= limit) {
                card.classList.add("hidden-item");
            }
            container.appendChild(card);
        }
    });

    // Add "View more" button if there are hidden items
    if (data.length > limit && section) {
        const btn = document.createElement("button");
        btn.classList.add("view-more-btn");
        const remaining = data.length - limit;
        btn.textContent = `View more (${remaining})`;
        btn.addEventListener("click", () => {
            container.querySelectorAll(".hidden-item").forEach((el, i) => {
                el.style.transitionDelay = `${i * 40}ms`;
                el.classList.remove("hidden-item");
            });
            observeElements(container.querySelectorAll(".card:not(.visible), .masonry-item:not(.visible), .music-item:not(.visible)"));
            btn.remove();
        });
        // Insert after the container
        container.after(btn);
    }

    observeElements(container.querySelectorAll(".card:not(.hidden-item), .masonry-item:not(.hidden-item), .music-item:not(.hidden-item)"));
}

// ========================================
// Intersection Observer — Fade In
// ========================================
function observeElements(elements) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    elements.forEach(el => observer.observe(el));
}

// ========================================
// Reporting Section
// ========================================
async function loadReportingSection() {
    const response = await fetch(DATA_SOURCES.reporting);
    if (!response.ok) return;

    const csvData = await response.text();
    Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const container = document.querySelector("#reporting .card-grid");
            const filterControls = document.querySelector("#reporting .filter-controls");
            const data = results.data;

            // Build filter pills
            const categories = ["All", ...new Set(data.map(item => item["Category"].trim()))];
            filterControls.innerHTML = "";
            categories.forEach(category => {
                const pill = document.createElement("button");
                pill.textContent = category;
                pill.dataset.category = category;
                pill.classList.add("filter-pill");
                if (category === "All") pill.classList.add("active");

                pill.addEventListener("click", () => {
                    filterControls.querySelectorAll(".filter-pill").forEach(btn => btn.classList.remove("active"));
                    pill.classList.add("active");
                    const filtered = category === "All" ? data : data.filter(item => item["Category"].trim() === category);
                    renderCardGrid(filtered, container, renderReportingCard);
                });

                filterControls.appendChild(pill);
            });

            renderCardGrid(data, container, renderReportingCard);
        }
    });
}

function renderReportingCard(item) {
    const card = document.createElement("div");
    card.classList.add("card");

    let html = "";

    if (item["Pic_Link"] && item["Pic_Link"].trim()) {
        html += `<img src="${item["Pic_Link"]}" alt="${item["Title"] || ""}" loading="lazy">`;
    }

    html += `<div class="card-body">`;
    html += `<h3>${item["Title"] || ""}</h3>`;

    if (item["Description"] && item["Description"].trim()) {
        html += `<p>${item["Description"]}</p>`;
    }

    if (item["AwdDesc"] && item["AwdDesc"].trim()) {
        html += `<p class="award-text">${item["AwdDesc"]}</p>`;
    }

    html += `<div class="card-links">`;

    if (item["Link"] && item["Link"].trim()) {
        html += `<a href="${item["Link"]}" target="_blank">Read More</a>`;
    }

    if (item["pdf"] && item["pdf"].trim()) {
        html += `<a href="${item["pdf"]}" target="_blank" download><img src="https://portfolio-2025.s3.us-east-2.amazonaws.com/reporting/pdfs/pdf.png" alt="Download PDF" class="pdf-icon"></a>`;
    }

    html += `</div></div>`;

    card.innerHTML = html;
    return card;
}

// ========================================
// Editing Section
// ========================================
async function loadEditingSection() {
    const response = await fetch(DATA_SOURCES.editing);
    if (!response.ok) return;

    const csvData = await response.text();
    Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const container = document.querySelector("#editing .card-grid");
            renderCardGrid(results.data, container, renderReportingCard);
        }
    });
}

// ========================================
// Graphics Section (NEW)
// ========================================
async function loadGraphicsSection() {
    try {
        const response = await fetch(DATA_SOURCES.graphics);
        if (!response.ok) return;

        const data = await response.json();
        const container = document.getElementById("graphics-grid");

        renderCardGrid(data, container, renderGraphicsItem);
    } catch (err) {
        console.error("Error loading graphics:", err);
    }
}

function renderGraphicsItem(item) {
    const el = document.createElement("a");
    el.classList.add("masonry-item", "graphics-item");
    el.href = item.interactive || item.image;
    el.target = "_blank";

    let html = `<img src="${item.image}" alt="${item.alt || item.title}" loading="lazy">`;
    html += `<div class="item-overlay"><span>${item.title}</span></div>`;

    el.innerHTML = html;
    return el;
}

// ========================================
// Personal Projects Section
// ========================================
async function loadProjectsSection() {
    const response = await fetch(DATA_SOURCES.projects);
    if (!response.ok) return;

    const csvData = await response.text();
    Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const container = document.querySelector("#projects .card-grid");
            renderCardGrid(results.data, container, renderProjectCard);
        }
    });
}

function renderProjectCard(item) {
    const card = document.createElement("div");
    card.classList.add("card");

    let html = "";

    if (item["Pic_Link"] && item["Pic_Link"].trim()) {
        html += `<img src="${item["Pic_Link"]}" alt="${item["Title"] || ""}" loading="lazy">`;
    }

    html += `<div class="card-body">`;
    html += `<h3>${item["Title"] || ""}</h3>`;

    if (item["Description"] && item["Description"].trim()) {
        html += `<p>${item["Description"]}</p>`;
    }

    if (item["Link"] && item["Link"].trim()) {
        html += `<div class="card-links"><a href="${item["Link"]}" target="_blank">Learn More</a></div>`;
    }

    html += `</div>`;

    card.innerHTML = html;
    return card;
}

// ========================================
// Art Section
// ========================================
async function loadArtSection() {
    const response = await fetch(DATA_SOURCES.art);
    if (!response.ok) return;

    const csvData = await response.text();
    Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const container = document.getElementById("art-grid");
            renderCardGrid(results.data, container, renderArtItem);
        }
    });
}

function renderArtItem(item) {
    const el = document.createElement("div");
    el.classList.add("masonry-item");

    const img = document.createElement("img");
    img.src = item["assets.image_url"];
    img.alt = item["assets.name"] || "Art piece";
    img.loading = "lazy";

    el.appendChild(img);
    return el;
}

// ========================================
// Music Section
// ========================================
function loadMusicSection() {
    const container = document.getElementById("music-list");
    if (!container) return;

    const embedCodes = [
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1603484769&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1590536087&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1572008146&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1521350047&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1445866849&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1404946300&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1404946312&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1404946267&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>"
    ];

    const limit = INITIAL_VISIBLE_MUSIC;
    const section = container.closest(".portfolio-section");

    embedCodes.forEach((embedHtml, i) => {
        const item = document.createElement("div");
        item.classList.add("music-item");
        item.style.transitionDelay = `${Math.min(i, limit - 1) * 40}ms`;
        item.innerHTML = embedHtml;
        if (i >= limit) item.classList.add("hidden-item");
        container.appendChild(item);
    });

    if (embedCodes.length > limit && section) {
        const btn = document.createElement("button");
        btn.classList.add("view-more-btn");
        btn.textContent = `View more (${embedCodes.length - limit})`;
        btn.addEventListener("click", () => {
            container.querySelectorAll(".hidden-item").forEach((el, i) => {
                el.style.transitionDelay = `${i * 40}ms`;
                el.classList.remove("hidden-item");
            });
            observeElements(container.querySelectorAll(".music-item:not(.visible)"));
            btn.remove();
        });
        container.after(btn);
    }

    observeElements(container.querySelectorAll(".music-item:not(.hidden-item)"));
}

// ========================================
// Photography Section
// ========================================
function loadPhotographySection() {
    const imageLinks = [
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/hawk.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/snow2.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/dandeacon.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/pier.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/octopusproject.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/hummingbird.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/gecko.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/highline.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/hiphop.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/hiphop1.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/howardbeach.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/italy.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/seanbellprotest.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/shore.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/snow.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/snow3.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/stormking.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/stormking1.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/flood.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/stthomas.jpg"
    ];

    const container = document.getElementById("photography-grid");
    const section = container.closest(".portfolio-section");
    const limit = INITIAL_VISIBLE;

    imageLinks.forEach((link, i) => {
        const item = document.createElement("div");
        item.classList.add("masonry-item");
        item.style.transitionDelay = `${Math.min(i, limit - 1) * 40}ms`;

        const img = document.createElement("img");
        img.src = link;
        img.alt = "Photography";
        img.loading = "lazy";

        item.appendChild(img);
        if (i >= limit) item.classList.add("hidden-item");
        container.appendChild(item);
    });

    if (imageLinks.length > limit && section) {
        const btn = document.createElement("button");
        btn.classList.add("view-more-btn");
        btn.textContent = `View more (${imageLinks.length - limit})`;
        btn.addEventListener("click", () => {
            container.querySelectorAll(".hidden-item").forEach((el, i) => {
                el.style.transitionDelay = `${i * 40}ms`;
                el.classList.remove("hidden-item");
            });
            observeElements(container.querySelectorAll(".masonry-item:not(.visible)"));
            btn.remove();
        });
        container.after(btn);
    }

    observeElements(container.querySelectorAll(".masonry-item:not(.hidden-item)"));
}

// ========================================
// Nav Active State — Intersection Observer
// ========================================
function setupNavHighlighting() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-links a");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
                });
            }
        });
    }, { rootMargin: "-20% 0px -75% 0px" });

    sections.forEach(section => observer.observe(section));
}

// ========================================
// Nav Shadow on Scroll
// ========================================
function setupNavShadow() {
    const nav = document.getElementById("main-nav");
    window.addEventListener("scroll", () => {
        nav.classList.toggle("scrolled", window.scrollY > 10);
    }, { passive: true });
}

// ========================================
// Back to Top Button
// ========================================
function setupBackToTop() {
    const btn = document.getElementById("back-to-top");

    window.addEventListener("scroll", () => {
        btn.classList.toggle("show", window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

// ========================================
// Dynamic Footer Year
// ========================================
function setFooterYear() {
    const el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
}

// ========================================
// Initialize
// ========================================
function initialize() {
    setFooterYear();
    setupNavShadow();
    setupBackToTop();
    setupNavHighlighting();

    ensurePapaParse(() => {
        loadReportingSection();
        loadEditingSection();
        loadProjectsSection();
        loadArtSection();
    });

    // Graphics uses JSON, not PapaParse
    loadGraphicsSection();

    // These don't need PapaParse
    loadMusicSection();
    loadPhotographySection();
}

document.addEventListener("DOMContentLoaded", initialize);
