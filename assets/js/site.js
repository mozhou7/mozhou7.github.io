const images = [
    "mozhou-1.jpg",
    "mozhou-2.jpg"
];
const featuredAuthor = "Mo Zhou";

function setRandomProfileImage() {
    const imgElement = document.getElementById("randomImage");
    if (!imgElement) {
        return;
    }

    const randomIndex = Math.floor(Math.random() * images.length);
    imgElement.src = images[randomIndex];
}

function getAnchorOffset() {
    const nav = document.querySelector(".site-nav");
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    return navHeight + 18;
}

function scrollToAnchor(hash, behavior = "smooth") {
    if (!hash || hash === "#") {
        return;
    }

    if (hash === "#top") {
        window.scrollTo({ top: 0, behavior });
        return;
    }

    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (!target) {
        return;
    }

    const scrollTarget = target.querySelector("[data-scroll-target]") || target;
    const top = scrollTarget.getBoundingClientRect().top + window.scrollY - getAnchorOffset();
    window.scrollTo({ top: Math.max(0, top), behavior });
}

function setupAnchorNavigation() {
    document.querySelectorAll('.site-nav a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const hash = link.getAttribute("href");
            event.preventDefault();
            scrollToAnchor(hash);

            if (hash && hash !== window.location.hash) {
                history.pushState(null, "", hash);
            }
        });
    });

    if (window.location.hash) {
        requestAnimationFrame(() => scrollToAnchor(window.location.hash, "auto"));
    }
}

function appendText(parent, text) {
    parent.appendChild(document.createTextNode(text));
}

function appendAuthors(parent, publication) {
    const equalContributors = new Set(publication.equalContribution || []);

    if (publication.authorOrder === "alpha-beta") {
        appendText(parent, "(\u03b1-\u03b2 order) ");
    }

    publication.authors.forEach((author, index) => {
        if (index > 0) {
            appendText(parent, ", ");
        }

        if (author === featuredAuthor) {
            const authorName = document.createElement("b");
            authorName.textContent = author;
            parent.appendChild(authorName);
        } else {
            appendText(parent, author);
        }

        if (equalContributors.has(author)) {
            appendText(parent, "*");
        }
    });

    if (publication.authorsSuffix) {
        appendText(parent, publication.authorsSuffix);
    }
}

function appendVenue(parent, publication) {
    const venue = document.createElement("em");
    venue.textContent = publication.venue;
    parent.appendChild(venue);

    if (publication.year !== undefined) {
        appendText(parent, `, ${publication.year}`);
    }

    if (publication.venueSuffix) {
        appendText(parent, publication.venueSuffix);
    }

    if (publication.note) {
        appendText(parent, " ");

        const note = document.createElement("span");
        if (publication.noteClass) {
            note.className = publication.noteClass;
        }
        note.textContent = publication.note;
        parent.appendChild(note);

        if (publication.noteSuffix) {
            appendText(parent, publication.noteSuffix);
        }
    }
}

function createPublicationItem(publication) {
    const item = document.createElement("li");
    item.className = "publication-item";

    if (publication.selected) {
        item.dataset.selected = "";
    }

    if (publication.selectedOrder !== undefined) {
        item.dataset.selectedOrder = String(publication.selectedOrder);
    }

    const title = document.createElement("div");
    title.className = "paper-title";

    if (publication.url) {
        const link = document.createElement("a");
        link.href = publication.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = publication.title;
        title.appendChild(link);
    } else {
        title.textContent = publication.title;
    }

    const authors = document.createElement("div");
    authors.className = "paper-meta";
    appendAuthors(authors, publication);

    const venue = document.createElement("div");
    venue.className = "paper-venue";
    appendVenue(venue, publication);

    item.append(title, authors, venue);
    return item;
}

function compareSelectedPublications(a, b) {
    const aOrder = Number.parseFloat(a.publication.selectedOrder);
    const bOrder = Number.parseFloat(b.publication.selectedOrder);
    const aHasOrder = Number.isFinite(aOrder);
    const bHasOrder = Number.isFinite(bOrder);

    if (aHasOrder && bHasOrder && aOrder !== bOrder) {
        return aOrder - bOrder;
    }

    if (aHasOrder || bHasOrder) {
        return aHasOrder ? -1 : 1;
    }

    return a.index - b.index;
}

function renderPublications() {
    const publications = Array.isArray(window.PUBLICATIONS) ? window.PUBLICATIONS : [];
    const selectedList = document.getElementById("selected-publications");
    const fullList = document.querySelector("#full-publications .publication-list");
    if (!selectedList || !fullList) {
        return;
    }

    const fullItems = publications.map((publication) => createPublicationItem(publication));
    const selectedItems = publications
        .map((publication, index) => ({ publication, index }))
        .filter(({ publication }) => publication.selected)
        .sort(compareSelectedPublications)
        .map(({ publication }) => createPublicationItem(publication));

    fullList.replaceChildren(...fullItems);
    selectedList.replaceChildren(...selectedItems);
}

function setPaperView(view) {
    const selectedList = document.getElementById("selected-publications");
    const fullPublications = document.getElementById("full-publications");
    const status = document.getElementById("paper-view-status");
    if (!selectedList || !fullPublications) {
        return;
    }

    const showAll = view === "all";
    selectedList.hidden = showAll;
    fullPublications.hidden = !showAll;

    document.querySelectorAll("[data-paper-view]").forEach((button) => {
        const isActive = button.dataset.paperView === view;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    if (status) {
        status.textContent = showAll ? "Showing all papers." : "Showing recent and selected papers.";
    }
}

function setupPaperViewControls() {
    document.querySelectorAll("[data-paper-view]").forEach((button) => {
        button.addEventListener("click", () => {
            setPaperView(button.dataset.paperView);
        });
    });

    setPaperView("selected");
}

function refreshMathJax() {
    if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
        window.MathJax.typesetPromise();
    }
}

function setupExpandButtons() {
    document.querySelectorAll("[data-expand-button]").forEach((button) => {
        const target = document.getElementById(button.dataset.expandTarget);
        if (!target) {
            return;
        }

        const elementToHide = button.dataset.hideWhenExpanded
            ? document.getElementById(button.dataset.hideWhenExpanded)
            : null;
        const collapsedLabel = button.dataset.collapsedLabel || button.textContent.trim();
        const expandedLabel = button.dataset.expandedLabel || "Show less";

        if (target.classList.contains("is-collapsible")) {
            const startsExpanded = button.getAttribute("aria-expanded") === "true";
            target.classList.toggle("is-expanded", startsExpanded);
            target.classList.toggle("is-collapsed", !startsExpanded);
        }

        button.addEventListener("click", () => {
            const shouldExpand = button.getAttribute("aria-expanded") !== "true";
            button.setAttribute("aria-expanded", String(shouldExpand));
            button.textContent = shouldExpand ? expandedLabel : collapsedLabel;

            if (target.classList.contains("is-collapsible")) {
                target.classList.toggle("is-expanded", shouldExpand);
                target.classList.toggle("is-collapsed", !shouldExpand);
            } else {
                target.hidden = !shouldExpand;
            }

            if (elementToHide) {
                elementToHide.hidden = shouldExpand;
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setRandomProfileImage();
    renderPublications();
    setupPaperViewControls();
    setupExpandButtons();
    setupAnchorNavigation();
    refreshMathJax();
});
