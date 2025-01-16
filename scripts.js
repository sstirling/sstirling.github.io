// File 1 of Portfolio Website JavaScript

const reportingCsvUrl = "https://portfolio-2025.s3.us-east-2.amazonaws.com/reporting/portfolio-reporting.csv";
const artCsvUrl = "https://portfolio-2025.s3.us-east-2.amazonaws.com/art/art-portfolio.csv";
const editingCsvUrl = "https://portfolio-2025.s3.us-east-2.amazonaws.com/editing/portfolio-editing.csv";

// Dynamically load PapaParse library
function loadPapaParse(callback) {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js";
    script.onload = callback;
    document.head.appendChild(script);
}

// Ensure PapaParse is loaded before using it
function ensurePapaParse(callback) {
    if (typeof Papa === "undefined") {
        console.log("PapaParse not found, loading dynamically...");
        loadPapaParse(callback);
    } else {
        callback();
    }
}

// Load Reporting Carousel with Filter Buttons
async function loadReportingCarousel() {
    const response = await fetch(reportingCsvUrl);
    if (!response.ok) {
        console.error("Error fetching reporting CSV:", response.statusText);
        return;
    }

    const csvData = await response.text();
    Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const reportingCarousel = document.querySelector("#reporting .carousel");
            const filterControls = document.querySelector("#reporting .filter-controls");

            reportingCarousel.innerHTML = ""; // Clear any previous content
            filterControls.innerHTML = ""; // Clear previous filter buttons

            const data = results.data;
            const categories = ["All", ...new Set(data.map(item => item["Category"].trim()))];

            // Add Filter Buttons
            categories.forEach(category => {
                const button = document.createElement("button");
                button.textContent = category;
                button.dataset.category = category;
                button.classList.add("filter-button");
                if (category === "All") button.classList.add("active");

                button.addEventListener("click", () => {
                    document.querySelectorAll(".filter-button").forEach(btn => btn.classList.remove("active"));
                    button.classList.add("active");

                    const filteredData = category === "All"
                        ? data
                        : data.filter(item => item["Category"].trim() === category);
                    renderCarouselItems(filteredData, reportingCarousel);
                });

                filterControls.appendChild(button);
            });

            // Render all items initially
            renderCarouselItems(data, reportingCarousel);
        }
    });
}

function renderCarouselItems(data, container) {
    container.innerHTML = ""; // Clear existing items
    data.forEach(item => {
        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");

        // Create Image
        const img = document.createElement("img");
        img.src = item["Pic_Link"];
        img.alt = item["Title"];
        img.style.maxWidth = "100%";
        carouselItem.appendChild(img);

        // Create Title
        const title = document.createElement("h3");
        title.textContent = item["Title"];
        title.classList.add("reporting-title");
        carouselItem.appendChild(title);

        // Create Description
        const description = document.createElement("p");
        description.textContent = item["Description"];
        description.classList.add("reporting-description");
        carouselItem.appendChild(description);

        // Create Award Description (AwdDesc)
        if (item["AwdDesc"] && item["AwdDesc"].trim()) {
            const awardDesc = document.createElement("p");
            awardDesc.textContent = item["AwdDesc"];
            awardDesc.classList.add("reporting-awddesc");
            awardDesc.style.fontSize = "0.8rem"; // Reduced font size for less prominence
            awardDesc.style.color = "#777"; // Subtle color
            awardDesc.style.fontStyle = "italic"; // Italic for subtle emphasis
            carouselItem.appendChild(awardDesc);
        }

        // Create Link
        const link = document.createElement("a");
        link.href = item["Link"];
        link.target = "_blank";
        link.textContent = "Read More";
        link.classList.add("reporting-link");
        carouselItem.appendChild(link);

     // Add PDF Icon
if (item["pdf"] && item["pdf"].trim()) { // Updated field name to "pdf"
    const pdfLink = document.createElement("a");
    pdfLink.href = item["pdf"]; // Use "pdf" field
    pdfLink.target = "_blank";
    pdfLink.download = ""; // Enables download functionality

    const pdfIcon = document.createElement("img");
    pdfIcon.src = "https://portfolio-2025.s3.us-east-2.amazonaws.com/reporting/pdfs/pdf.png"; // Updated icon URL
    pdfIcon.alt = "Download PDF";
    pdfIcon.classList.add("pdf-icon");

    pdfLink.appendChild(pdfIcon);
    carouselItem.appendChild(pdfLink); // Add link as the last item in the content flow
}



        container.appendChild(carouselItem);
    });
}


// Load Art Carousel
async function loadArtCarousel() {
    const response = await fetch(artCsvUrl);
    if (!response.ok) {
        console.error("Error fetching art CSV:", response.statusText);
        return;
    }

    const csvData = await response.text();
    Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const artCarousel = document.querySelector("#art-carousel");
            results.data.forEach(item => {
                const carouselItem = document.createElement("div");
                carouselItem.classList.add("carousel-item");

                const img = document.createElement("img");
                img.src = item["assets.image_url"];
                img.alt = item["assets.name"];
                img.style.maxWidth = "100%";

                const title = document.createElement("h3");
                title.textContent = item["assets.name"];

                carouselItem.appendChild(img);
                carouselItem.appendChild(title);

                artCarousel.appendChild(carouselItem);
            });
        }
    });
}

// File 2 of Portfolio Website JavaScript

// Load Editing Carousel
async function loadEditingCarousel() {
    const response = await fetch(editingCsvUrl);
    if (!response.ok) {
        console.error("Error fetching editing CSV:", response.statusText);
        return;
    }

    const csvData = await response.text();
    Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: function (results) {
            const editingCarousel = document.querySelector("#editing .carousel");

            editingCarousel.innerHTML = ""; // Clear any previous content

            const data = results.data;

            // Render all items
            renderCarouselItems(data, editingCarousel);
        }
    });
}

// Manually Populate Music Carousel
function loadManualMusicCarousel() {
    const musicCarousel = document.querySelector("#music-carousel");

    if (!musicCarousel) {
        console.error("#music-carousel not found in DOM.");
        return;
    }

    // Add your embed codes manually here
    const embedCodes = [
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1603484769&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1590536087&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1572008146&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe><div style='font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;'><a href='https://soundcloud.com/user-20991475' title='Steef' target='_blank' style='color: #cccccc; text-decoration: none;'>Steef</a> · <a href='https://soundcloud.com/user-20991475/jersey-city' title='Jersey City' target='_blank' style='color: #cccccc; text-decoration: none;'>Jersey City</a></div>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1521350047&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe><div style='font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;'><a href='https://soundcloud.com/user-20991475' title='Steef' target='_blank' style='color: #cccccc; text-decoration: none;'>Steef</a> · <a href='https://soundcloud.com/user-20991475/buena' title='Buena' target='_blank' style='color: #cccccc; text-decoration: none;'>Buena</a></div>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1445866849&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe><div style='font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;'><a href='https://soundcloud.com/user-20991475' title='Steef' target='_blank' style='color: #cccccc; text-decoration: none;'>Steef</a> · <a href='https://soundcloud.com/user-20991475/neptune-city' title='Neptune City' target='_blank' style='color: #cccccc; text-decoration: none;'>Neptune City</a></div>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1404946300&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe><div style='font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;'><a href='https://soundcloud.com/user-20991475' title='Steef' target='_blank' style='color: #cccccc; text-decoration: none;'>Steef</a> · <a href='https://soundcloud.com/user-20991475/unsolvable-keys' title='Unsolvable keys' target='_blank' style='color: #cccccc; text-decoration: none;'>Unsolvable keys</a></div>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1404946312&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe><div style='font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;'><a href='https://soundcloud.com/user-20991475' title='Steef' target='_blank' style='color: #cccccc; text-decoration: none;'>Steef</a> · <a href='https://soundcloud.com/user-20991475/pink-stinger' title='Pink stinger' target='_blank' style='color: #cccccc; text-decoration: none;'>Pink stinger</a></div>",
        "<iframe width='100%' height='166' scrolling='no' frameborder='no' allow='autoplay' src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/1404946267&color=%2332c0c2&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false'></iframe><div style='font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;'><a href='https://soundcloud.com/user-20991475' title='Steef' target='_blank' style='color: #cccccc; text-decoration: none;'>Steef</a> · <a href='https://soundcloud.com/user-20991475/fire-sale' title='Fire sale' target='_blank' style='color: #cccccc; text-decoration: none;'>Fire sale</a></div>"
    ];

    embedCodes.forEach(embedHtml => {
        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");

        const embedContainer = document.createElement("div");
        embedContainer.innerHTML = embedHtml;
        embedContainer.style.width = "100%";
        embedContainer.style.overflow = "hidden";

        carouselItem.appendChild(embedContainer);
        musicCarousel.appendChild(carouselItem);
    });

    console.log("Music carousel populated with manual entries.");
}

// Initialize Carousels
function initializeCarousels() {
    ensurePapaParse(() => {
        console.log("PapaParse loaded. Initializing carousels...");
        loadReportingCarousel();
        loadArtCarousel();
        loadEditingCarousel();
        loadManualMusicCarousel();
    });
}

// Trigger initialization when DOM is ready
document.addEventListener("DOMContentLoaded", initializeCarousels);

function loadPhotographyCarousel() {
    const imageLinks = [
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/hawk.jpg",
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
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/seanbell.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/seanbellprotest.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/shore.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/snow.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/snow2.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/snow3.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/stormking.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/stormking1.jpg",
        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/flood.jpg",

        "https://s3.us-east-2.amazonaws.com/www.sstirling.com/photo/stthomas.jpg"
    ];

    const photographyCarousel = document.querySelector("#photography-carousel");

    imageLinks.forEach(link => {
        const carouselItem = document.createElement("div");
        carouselItem.classList.add("carousel-item");

        const img = document.createElement("img");
        img.src = link;
        img.alt = "Photography image";
        img.style.maxWidth = "100%";

        carouselItem.appendChild(img);
        photographyCarousel.appendChild(carouselItem);
    });
}

// Ensure this function is called in your initialization block:
function initializeCarousels() {
    ensurePapaParse(() => {
        console.log("PapaParse loaded. Initializing carousels...");
        loadReportingCarousel();
        loadArtCarousel();
        loadEditingCarousel();
        loadManualMusicCarousel();
        loadPhotographyCarousel(); // Add this line
    });
}
