// Configuration for publications.html only; the homepage is unaffected.
// false: show only PhD Thesis and Papers, preserving the data order within each.
// true: show the topic sections below, with their optional subsections.
// Paper labels stay unchanged, so you can switch back at any time.
window.PUBLICATION_SHOW_TOPICS = false;

// The following settings apply only when PUBLICATION_SHOW_TOPICS is true.
// Each paper keeps its short section label in data/publications.js.
// Set the matching label's title and description below to customize its display.
// New labels still create sections automatically, even without configuration.
// Empty sections are hidden; missing section labels default to "Papers".
window.PUBLICATION_SECTION_ORDER = [
    "PhD Thesis",
    "Feature Learning",
    "Simple Models"
];

window.PUBLICATION_SECTION_DETAILS = {
    "Feature Learning": {
        title: "Feature Learning Dynamics",
        description: "Develop mathematical tools to understand how simple learning algorithms discover features and latent structure.",
        // Set to false to hide subgroup headings and restore one list in data order.
        showSubsections: false,
        // Add subsection: "GD" or subsection: "EM" to the corresponding papers.
        // These keys control subgroup order; values are the displayed headings.
        // New subgroup labels appear afterward; unlabeled papers appear in Other.
        subsections: {
            "GD": "Gradient Descent for Neural Networks",
            "EM": "Expectation-Maximization for Latent Variable Models"
        }
    },
    "Simple Models": {
        title: "Understanding Phenomena through Simple Models",
        description: "Study mechanisms behind deep learning behavior using simple models."
    }
};
