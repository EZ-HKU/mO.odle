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
                if (data.course_dict){
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

    // 根据页面中的class和storage里的list生成dict  => dict
    var mainDiv = document.getElementById("frontpage-course-list")
    function gen_dict(course_dict) {
        summaryElements.forEach(function (summaryElement) {
            var firstChild = summaryElement.firstElementChild;
            if (firstChild) {
                var firstGrandChild = firstChild.firstElementChild;
                if (firstGrandChild) {
                    var textContent = firstGrandChild.textContent;
                    var urlContent = firstGrandChild.href;
                    console.log(course_dict);
                    course_list.forEach(function (course_id) {
                        console.log(course_id);
                        if (Object.keys(course_dict).includes(course_id)) {
                            // return;
                        }else{
                            console.log("course_id not found in dict");
                            course_dict[course_id] = {
                                "detail": "",
                                "url": ""
                            }
                        }
                        if (textContent.includes(course_id)) {
                            console.log("course_id found in textContent");
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

    // 根据list和dict生成页面元素（unshown的课程不显示）
    function initialize() {
        course_list.forEach(function (course_code) {
            course_detail = course_dict[course_code]["detail"];
            var newDiv = document.createElement('div');
            newDiv.innerHTML = divHTML.replace("{course_code}", course_code).replace("{course_name}", course_detail).replace("{course_url}", course_dict[course_code]["url"]);
            newDiv.style.display = "inline-block";
            mainDiv.insertAdjacentElement('beforebegin', newDiv);
        });
    }

};

const CourseList_handler = () => {
    var course_list = [];
    var course_dict = {};
    chrome.storage.sync.get(["course_list", "course_dict"], (data) => {
        course_list = data.course_list;
        course_dict = data.course_dict;
    });

    function generate() {
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
                        var code = info.substring(0, 8);
                        var detail = info.substring(9);
                        if (course_list.includes(code)) {
                            alert("You have already added this course to your mO.odle Courses");
                        } else {
                            course_list.push(code);
                            course_dict[code] = {
                                "detail": detail,
                                "url": url
                            }
                            chrome.storage.sync.set({ course_list: course_list, course_dict: course_dict}); // , change_flag: true
                        }

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

    generate();

    const inputElement = document.querySelector('input[type="text"]');
    inputElement.addEventListener('input', debounce(generate, 500));

}

// sidebar
const CourePage_handler = () => {
    var sidebar = document.getElementById("courseindex-content");

    var course_dict = {};
    chrome.storage.sync.get(["course_dict", "change_flag"], (data) => {
        if (data.change_flag) {
            void 0;
            // 就是只有在Home页刷新才会更新dict，否则在popup更新后并不会更新侧边栏
        }
        course_dict = data.course_dict;
        var container = document.createElement('div');
        for (const [key, value] of Object.entries(course_dict)) {
            const div = document.createElement('div');
            div.textContent = key;
            div.classList.add('course_text');
            div.addEventListener('click', () => {
                window.location.href = value.url;
            });
            container.appendChild(div);
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
