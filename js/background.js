chrome.omnibox.onInputEntered.addListener((text) => {
    chrome.storage.sync.get(["course_dict"], (data) => {
        const course_dict = data.course_dict;
        const course_code = text.toUpperCase();
        for (const key in course_dict) {
            if (key.includes(course_code)) {
                chrome.tabs.create({ url: course_dict[key]["url"] });
                return;
            }
        }
    });
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    chrome.storage.sync.get(["course_dict"], (data) => {
        const course_dict = data.course_dict;
        const suggestions = [];
        const course_code = text.toUpperCase();
        for (const key in course_dict) {
            if (key.includes(course_code)) {
                suggestions.push({ content: key, description: key+ ": " + course_dict[key]["detail"] });
            }
        }
        suggest(suggestions);
    });
});