// Reuse createPublicationItem from site.js so both pages format papers identically.
function groupPublicationsByLabel(publications, property, fallback) {
    const groups = new Map();
    publications.forEach((publication) => {
        const label = String(publication[property] ?? fallback).trim() || fallback;
        if (!groups.has(label)) {
            groups.set(label, []);
        }
        groups.get(label).push(publication);
    });
    return groups;
}

function orderedPublicationLabels(groups, order) {
    return [...new Set([...order, ...groups.keys()])].filter((label) => groups.has(label));
}

function createPublicationList(publications, headingId) {
    const list = document.createElement("ul");
    list.className = "publication-list";
    list.setAttribute("aria-labelledby", headingId);
    list.append(...publications.map((publication) => {
        const item = createPublicationItem(publication);
        // Abbreviate the marker on this page without changing the homepage renderer.
        if (publication.authorOrder === "alpha-beta") {
            const prefix = item.querySelector(".paper-meta").firstChild;
            prefix.textContent = prefix.textContent.replace("(\u03b1-\u03b2 order)", "(\u03b1-\u03b2)");
        }
        return item;
    }));
    return list;
}

function renderPublicationSections() {
    const container = document.getElementById("publication-sections");
    if (!container) {
        return;
    }

    const publications = window.PUBLICATIONS || [];
    const showTopics = window.PUBLICATION_SHOW_TOPICS !== false;
    const groups = groupPublicationsByLabel(publications, "section", "Papers");

    if (!showTopics) {
        const thesis = groups.get("PhD Thesis");
        const papers = publications.filter((publication) =>
            String(publication.section ?? "").trim() !== "PhD Thesis"
        );
        groups.clear();
        if (thesis) {
            groups.set("PhD Thesis", thesis);
        }
        if (papers.length) {
            groups.set("Papers", papers);
        }
    }

    const labels = orderedPublicationLabels(groups, showTopics
        ? window.PUBLICATION_SECTION_ORDER || []
        : ["PhD Thesis", "Papers"]);
    const sectionDetails = showTopics ? window.PUBLICATION_SECTION_DETAILS || {} : {};

    container.replaceChildren();
    labels.forEach((label, index) => {
        const details = sectionDetails[label] || {};
        const publications = groups.get(label);
        const section = document.createElement("section");
        section.className = "section";
        section.id = `publication-section-${index + 1}`;
        section.setAttribute("aria-labelledby", `${section.id}-heading`);

        const header = document.createElement("div");
        header.className = "section-header";
        header.setAttribute("data-scroll-target", "");

        const heading = document.createElement("h2");
        heading.id = `${section.id}-heading`;
        heading.textContent = details.title || label;
        header.appendChild(heading);

        if (details.description) {
            const description = document.createElement("p");
            description.className = "publication-section-description";
            const emphasis = document.createElement("em");
            emphasis.textContent = details.description;
            description.appendChild(emphasis);
            header.appendChild(description);
        }
        section.appendChild(header);

        if (details.showSubsections) {
            const subgroupTitles = details.subsections || {};
            const subgroups = groupPublicationsByLabel(publications, "subsection", "Other");
            const subgroupLabels = orderedPublicationLabels(subgroups, Object.keys(subgroupTitles));

            subgroupLabels.forEach((subgroupLabel, subgroupIndex) => {
                const subsection = document.createElement("section");
                subsection.className = "publication-subsection";
                const subheading = document.createElement("h3");
                subheading.id = `${section.id}-subsection-${subgroupIndex + 1}-heading`;
                subheading.textContent = subgroupTitles[subgroupLabel] || subgroupLabel;
                subsection.setAttribute("aria-labelledby", subheading.id);
                subsection.append(subheading, createPublicationList(subgroups.get(subgroupLabel), subheading.id));
                section.appendChild(subsection);
            });
        } else {
            section.appendChild(createPublicationList(publications, heading.id));
        }
        container.appendChild(section);
    });
}

// This deferred script runs after the DOM and shared renderer are available,
// before site.js binds navigation and refreshes MathJax at DOMContentLoaded.
renderPublicationSections();
