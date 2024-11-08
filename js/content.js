const Home_handler = () => {
    var course_list = [];
    var course_dict = {};
    var change_flag;

    // 获取psb课程列表，并存入storage
    var psb_course_list = [];
    var dates = document.querySelectorAll(".categoryname");
    dates.forEach(function (date) {
        if (date.innerText == "2024-25") {
            var name_section = date.parentNode.previousElementSibling.firstElementChild;
            var psb_course_code = name_section.innerText; //.substring(0,8)
            psb_course_list.push(psb_course_code);
        }
    });
    console.log("psb:", psb_course_list);
    chrome.storage.sync.set({ psb_course_list: psb_course_list });

    // 每次进入页面时，根据storage更新页面
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
                if (data.course_dict) {
                    course_dict = data.course_dict;
                }
                chrome.storage.sync.set({ change_flag: false });
                course_list = data.course_list;
                course_dict = gen_dict(course_dict);
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
    <div class="card-class">
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

    // 根据页面中的class和storage里的list生成dict  => dict
    var mainDiv = document.getElementById("frontpage-course-list")
    function gen_dict(course_dict) {
        var courseCount = {};
        summaryElements.forEach(function (summaryElement) {
            var firstChild = summaryElement.firstElementChild;
            if (firstChild) {
                var firstGrandChild = firstChild.firstElementChild;
                if (firstGrandChild) {
                    var textContent = firstGrandChild.textContent;
                    var urlContent = firstGrandChild.href;
                    console.log(course_dict);
                    course_list.forEach(function (course_id) {
                        // course_id = code+detail
                        console.log(course_id);
                        if (Object.keys(course_dict).includes(course_id)) {
                            return;
                        } else {
                            console.log("course_id not found in dict");
                            course_dict[course_id] = {
                                "mo_code": "",
                                "detail": "",
                                "url": ""
                            }
                        }
                        var prefix = course_id.substring(0, 8);
                        if (!courseCount[prefix]) {
                            courseCount[prefix] = 0;
                        }
                        courseCount[prefix]++;
                        console.log(courseCount);
                    });
                    course_list.forEach(function (course_id) {
                        if (textContent.includes(course_id)) {
                            console.log("course_id found in textContent");
                            course_dict[course_id]["detail"] = textContent.substring(9);
                            course_dict[course_id]["url"] = urlContent;
                        }
                    });
                }
            }
        });
        var copy_courseCount = JSON.parse(JSON.stringify(courseCount));
        console.log("copy!");
        course_list.forEach(function (course_code) {
            var prefix = course_code.substring(0, 8);
            var suffix = copy_courseCount[prefix] > 1 ? '-' + String.fromCharCode(65 + (copy_courseCount[prefix] - courseCount[prefix])) : '';
            courseCount[prefix]--;
            course_dict[course_code]["mo_code"] = prefix + suffix;
            if (course_dict[course_code]["detail"] == "") {
                unshown_course_list.push(course_code);
            }
        });
        chrome.storage.sync.set({ unshown_course_list: unshown_course_list });

        return course_dict;
    }

    // 根据list和dict生成页面元素（unshown的课程不显示）
    function initialize() {
        var add_div = document.createElement('div');
        add_div.classList.add("container-class");
        course_list.forEach(function (course_code) {
            var course_detail = course_dict[course_code]["detail"];
            var mo_code = course_dict[course_code]["mo_code"];
            var newDiv = document.createElement('div');
            newDiv.innerHTML = divHTML.replace("{course_code}", mo_code).replace("{course_name}", course_detail).replace("{course_url}", course_dict[course_code]["url"]);
            add_div.appendChild(newDiv);
        });
        mainDiv.insertAdjacentElement('beforebegin', add_div);
    }

};

// My Courses 页面
const CourseList_handler = () => {
    var course_list = [];
    var course_dict = {};
    const inputElement = document.querySelector('input[type="text"]');
    chrome.storage.sync.get(["course_list", "course_dict"], (data) => {
        course_list = data.course_list;
        course_dict = data.course_dict;
        generate(course_list, course_dict);
        inputElement.addEventListener('input', debounce(() => {
            generate(course_list, course_dict);
        }, 500));
    });

    function generate(course_list, course_dict) {
        console.log("generate");
        console.log(course_list);
        const observer = new MutationObserver((mutations) => {
            const targetElement = document.querySelector('.coursemenubtn');
            if (targetElement) {
                observer.disconnect();
                var card_menu_btn = document.querySelectorAll(".coursemenubtn");
                card_menu_btn.forEach(function (i) {
                    var my_card_btn = document.createElement('button');
                    my_card_btn.textContent = "+";
                    my_card_btn.classList.add("btn", "btn-link", "btn-icon", "icon-size-3", "coursemenubtn");
                    my_card_btn.style.fontWeight = "bold";
                    my_card_btn.style.userSelect = "none";
                    my_card_btn.style.fontSize = "20px";
                    my_card_btn.addEventListener("click", () => {
                        var parent_node = i.parentNode.parentNode.parentNode.parentNode;
                        var url = parent_node.querySelector("a").href;
                        var info = i.parentNode.querySelector(".sr-only").textContent.substring(27);
                        // info是code+detail
                        var code = info.substring(0, 8);
                        var detail = info.substring(9);
                        if (course_list) {
                            if (course_list.includes(code)) {
                                alert("You have already added this course to your mO.odle Courses");
                                return;
                            }
                        } else {
                            course_list = [];
                        }
                        course_list.push(info);
                        course_dict[info] = {
                            "detail": detail,
                            "mo_code": code,
                            "url": url
                        }
                        alert("Course added successfully!");
                        chrome.storage.sync.set({ course_list: course_list, course_dict: course_dict }); // , change_flag: true
                    })
                    i.parentNode.style.display = "flex";
                    i.parentNode.insertBefore(my_card_btn, i)
                });
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    }

    function debounce(func, delay) {
        let timeoutId;

        return function (...args) {
            // 清除之前的定时器
            clearTimeout(timeoutId);

            // 设置新的定时器
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

}

// sidebar
const CourePage_handler = () => {
    var sidebar = document.getElementById("courseindex-content");

    var course_dict = {};
    chrome.storage.sync.get(["course_dict", "change_flag", "course_list"], (data) => {
        if (data.change_flag) {
            void 0;
            // 就是只有在Home页刷新才会更新dict，否则在popup更新后并不会更新侧边栏
        }
        course_dict = data.course_dict;
        var container = document.createElement('div');
        for (const [key, value] of Object.entries(course_dict)) {
            const div = document.createElement('div');
            div.textContent = value.mo_code;
            div.classList.add('course_text');
            div.addEventListener('click', () => {
                window.location.href = value.url;
            });
            container.appendChild(div);
        }

        const div = document.createElement('div');
        div.classList.add('dashed-line');
        div.style.marginLeft = "10px";
        div.style.width = "calc(100% - 20px)";
        container.appendChild(div);

        const currentURL = window.location.href;
        // if current page is not in the course_dict, add a button to add it
        const title = document.querySelector('.h2').textContent;
        if (!Object.keys(course_dict).includes(title)) {
            var add_button = document.createElement('div');
            add_button.textContent = "Add this course";
            add_button.classList.add('course_text');
            add_button.addEventListener('click', () => {
                course_dict[title] = {
                    "detail": title.substring(9),
                    "mo_code": title.substring(0, 8),
                    "url": currentURL
                }
                var course_list = data.course_list;
                course_list.push(courseCode);
                chrome.storage.sync.set({ course_dict: course_dict, change_flag: true, course_list: course_list });
                // reload sidebar
                sidebar.parentNode.removeChild(container);
                CourePage_handler();
            });
            container.appendChild(add_button);
        } else {
            var remove_button = document.createElement('div');
            remove_button.textContent = "Remove this course";
            remove_button.classList.add('course_text');
            remove_button.addEventListener('click', () => {
                delete course_dict[courseCode];
                var course_list = data.course_list;
                course_list = course_list.filter(item => item !== courseCode);
                chrome.storage.sync.set({ course_dict: course_dict, change_flag: true, course_list: course_list });
                // reload sidebar
                sidebar.parentNode.removeChild(container);
                CourePage_handler();
            });
            container.appendChild(remove_button);
        }
        sidebar.parentNode.insertBefore(container, sidebar);
    });
};


// route
const currentURL = window.location.href;
const route = () => {

    if (currentURL.includes("view.php")) {
        CourePage_handler();
    } else if (currentURL.includes("courses.php")) {
        CourseList_handler();
    } else {
        Home_handler();
    }
};

route();
