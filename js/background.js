chrome.omnibox.onInputEntered.addListener((text) => {
    chrome.storage.sync.get(["course_dict"], (data) => {
        const course_dict = data.course_dict;
        console.log(course_dict);
        console.log(course_dict[text]);
        chrome.tabs.create({ url: course_dict[text]["url"] });
    });
  });