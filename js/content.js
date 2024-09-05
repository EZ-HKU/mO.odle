var course_list = [];
var course_dict = {};
var change_flag;

chrome.storage.sync.get(["course_list", "course_dict", "change_flag"], (data) => {
    console.log(data);
    if (!data.course_list || data.course_list.length === 0) {
        console.log("no course_list found in storage");
        course_dict = {};
        unshown_course_list = [];
        chrome.storage.sync.set({ course_dict: course_dict, unshown_course_list: unshown_course_list });
    } else {
        change_flag = data.change_flag;
        if (change_flag || !data.course_dict || Object.keys(data.course_dict).length === 0) {
            // 更新了/无dict
            chrome.storage.sync.set({ change_flag: false });
            course_list = data.course_list;
            course_dict = gen_dict();
            chrome.storage.sync.set({ course_dict: course_dict });
        } else {
            course_list = data.course_list;
            course_dict = data.course_dict;
        }
        initialize();
    }
});


var summaryElements = document.querySelectorAll('.summary');
var unshown_course_list = [];
var divHTML = `
<div class="card">
   <a class="card2" href="{course_url}" target="_blank">
    <p class="course-code-class" style="font-weight: bold;">{course_code}</p>
    <p class="small">{course_name}</p>
    <div class="go-corner" href="#">
      <div class="go-arrow">
        →
      </div>
    </div>
  </a>
</div>`;

var mainDiv = document.getElementById("frontpage-course-list")
var course_name;

function gen_dict() {
    summaryElements.forEach(function (summaryElement) {
        var firstChild = summaryElement.firstElementChild;
        if (firstChild) {
            var firstGrandChild = firstChild.firstElementChild;
            if (firstGrandChild) {
                var textContent = firstGrandChild.textContent;
                var urlContent = firstGrandChild.href;
                course_list.forEach(function (course_id) {
                    if (!course_dict[course_id]) {
                        course_dict[course_id] = {
                            "detail": "",
                            "url": ""
                        }
                    }
                    if (textContent.includes(course_id)) {
                        course_dict[course_id]["detail"] = textContent.substring(9);
                        course_dict[course_id]["url"] = urlContent;
                    }
                });
            }
        }
    });

    course_list.forEach(function (course_code) {
        if (course_dict[course_code]["detail"] == "") {
            unshown_course_list.push(course_code);
        }
    });
    chrome.storage.sync.set({ unshown_course_list: unshown_course_list });

    return course_dict;
}

function initialize() {
    course_list.forEach(function (course_code) {
        course_detail = course_dict[course_code]["detail"];
        var newDiv = document.createElement('div');
        newDiv.innerHTML = divHTML.replace("{course_code}", course_code).replace("{course_name}", course_detail).replace("{course_url}", course_dict[course_code]["url"]);
        newDiv.style.display = "inline-block";
        mainDiv.insertAdjacentElement('beforebegin', newDiv);
    });
}
