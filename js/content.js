// import { Course, CourseCodeList } from "./course.js";
// const Course = require('./popup.js');
// const CourseCodeList = require('./popup.js');

function Course(title, code, detail, url) {
    this.title = title;
    this.code = code;
    this.detail = detail;
    this.url = url;
}


function CourseList() {
    this.courses = [];
}

CourseList.prototype.addCourse = function (course) {
    this.courses.push(course);
};

CourseList.prototype.findCourseByCode = function (code) {
    return this.courses.find(function (course) {
        return course.code === code;
    });
};

CourseList.prototype.findCourseByTitle = function (title) {
    return this.courses.find(function (course) {
        return course.title === title;
    });
};

CourseList.prototype.deleteCourseByCode = function (code) {
    this.courses = this.courses.filter(function (course) {
        return course.code !== code;
    });
};

CourseList.prototype.deleteCourseByTitle = function (title) {
    this.courses = this.courses.filter(function (course) {
        return course.title !== title;
    });
};

function CoursesWithSameCode(code, courses) {
    this.code = code;
    this.courses = courses;
}

function CourseCodeList() {
    this.courseCodes = [];
}

CourseCodeList.prototype.addCourse = function (course) {
    var existingCourseCode = this.findCourseByCode(course.code);
    if (existingCourseCode) {
        existingCourseCode.CourseList.addCourse(course);
    } else {
        var newCourseList = new CourseList();
        newCourseList.addCourse(course);
        var newCourseCode = new CoursesWithSameCode(course.code, newCourseList);
        this.courseCodes.push(newCourseCode);
    }
};

CourseCodeList.prototype.getAllCourses = function () {
    var courses = [];
    this.courseCodes.forEach(function (courseCode) {
        courses = courses.concat(courseCode.courses.courses);
    });
    return courses;
}

CourseCodeList.prototype.findCoursesByCode = function (code) {
    var courseCode = this.findCourseByCode(code);
    return courseCode ? courseCode.courses.courses : null;
};

CourseCodeList.prototype.findCourseByTitle = function (title) {
    for (var i = 0; i < this.courseCodes.length; i++) {
        var course = this.courseCodes[i].courses.findCourseByTitle(title);
        if (course) {
            return course;
        }
    }
    return null;
};

CourseCodeList.prototype.findCourseByCode = function (code) {
    return this.courseCodes.find(function (courseCode) {
        return courseCode.code === code;
    });
};

courseCodeListFromStorage = function (courseCodeList) {
    var newCourseCodeList = new CourseCodeList();
    courseCodeList.courseCodes.forEach(function (courseCode) {
        var newCourseList = new CourseList();
        courseCode.courses.courses.forEach(function (course) {
            newCourseList.addCourse(new Course(course.title, course.code, course.detail, course.url));
        });
        newCourseCodeList.courseCodes.push(new CoursesWithSameCode(courseCode.code, newCourseList));
    });
    return newCourseCodeList;
}




// 获取psb课程列表，并存入storage
function get_psb() {
    chrome.storage.sync.get(["psb_course_list"], (data) => {
        if (!data.psb_course_list) {
            var psb_course_list = new CourseCodeList();
            var dates = document.querySelectorAll(".categoryname");
            dates.forEach(function (date) {
                if (date.innerText == "2024-25") {
                    var course_div = date.parentNode.previousElementSibling.firstElementChild;
                    var title = course_div.innerText;
                    var code = title.substring(0, 8);
                    var detail = title.substring(9);
                    var url = course_div.href;
                    var course = new Course(title, code, detail, url);
                    psb_course_list.addCourse(course);
                }
            });
            chrome.storage.sync.set({ psb_course_list: psb_course_list });
            console.log("psb:", psb_course_list);
        }
    });
}


// 获取course code list，生成页面
var divHTML = `
<div class="card-class">
<a class="card2" href="{course_url}" target="_blank">
    <p class="course-code-class" style="font-weight: bold;">{course_code}</p>
    <p class="small">{course_name}</p>
</a>
</div>`;

function initialize() {
    var mainDiv = document.getElementById("frontpage-course-list");
    var add_div = document.createElement('div');
    add_div.classList.add("container-class");
    chrome.storage.sync.get(["course_code_list"], (data) => {
        if (data.course_code_list) {
            var courseCodeList = courseCodeListFromStorage(data.course_code_list);
            var courses = courseCodeList.getAllCourses();
            courses.forEach(function (course) {
                var newDiv = document.createElement('div');
                newDiv.innerHTML = divHTML.replace("{course_code}", course.code).replace("{course_name}", course.detail).replace("{course_url}", course.url);
                add_div.appendChild(newDiv);
            });
            mainDiv.insertAdjacentElement('beforebegin', add_div);
        }
    }
    );
}

// my courses 页面
function CourseList_handler() {
    const inputElement = document.querySelector('input[type="text"]');
    inputElement.addEventListener('input', debounce(() => {
        generate();
    }, 600));
    generate();
}

function generate() {
    const observer = new MutationObserver((mutations) => {
        const targetElement = document.querySelector('.coursemenubtn');
        if (targetElement) {
            console.log("generate");
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
                    var title = i.parentNode.querySelector(".sr-only").textContent.substring(27);
                    var code = title.substring(0, 8);
                    var detail = title.substring(9);
                    chrome.storage.sync.get(["course_code_list"], (data) => {
                        if (!data.course_code_list) {
                            var course_code_list = new CourseCodeList();
                        } else {
                            var course_code_list = courseCodeListFromStorage(data.course_code_list);
                            if (course_code_list.findCourseByTitle(title)) {
                                alert("You have already added this course to your mO.odle Courses");
                                return;
                            }
                        }
                        course_code_list.addCourse(new Course(title, code, detail, url));
                        alert("Course added successfully!");
                        chrome.storage.sync.set({ course_code_list: course_code_list }); // , change_flag: true
                    });

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

// sidebar
function CourePage_handler(){
    var sidebar = document.getElementById("courseindex-content");
    chrome.storage.sync.get(["course_code_list"], (data) => {
        if (data.course_code_list) {
            var course_code_list = courseCodeListFromStorage(data.course_code_list);
        }else{
            return;
        }
        var container = document.createElement('div');
        var courses = course_code_list.getAllCourses();
        courses.forEach(function (course) {
            const div = document.createElement('div');
            var text = document.createElement('div');
            text.textContent = course.title;
            text.style.whiteSpace = "nowrap";
            text.style.overflow = "hidden";
            text.style.textOverflow = "ellipsis";
            text.style.marginInline = "10px";
            text.setAttribute('title', course.title);
            div.appendChild(text);
            div.classList.add('course_text');
            div.addEventListener('click', () => {
                window.location.href = course.url;
            });
            container.appendChild(div);
        });
    
        const div = document.createElement('div');
        div.classList.add('dashed-line');
        div.style.marginLeft = "10px";
        div.style.width = "calc(100% - 20px)";
        container.appendChild(div);
    
        const currentURL = window.location.href;
        // if current page is not in the course_dict, add a button to add it
        const currentCourse = document.querySelector('.h2').textContent;
        if (!course_code_list.findCourseByTitle(currentCourse)) {
            var add_button = document.createElement('div');
            add_button.textContent = "Add this course";
            add_button.classList.add('course_text');
            add_button.addEventListener('click', () => {
                course_code_list.addCourse(new Course(currentCourse, currentCourse.substring(0, 8), currentCourse.substring(9), currentURL));
                chrome.storage.sync.set({ course_code_list: course_code_list });
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
                course_code_list.deleteCourseByTitle(currentCourse);
                chrome.storage.sync.set({ course_code_list: course_code_list });
                // reload sidebar
                sidebar.parentNode.removeChild(container);
                CourePage_handler();
            });
            container.appendChild(remove_button);
        }
        sidebar.parentNode.insertBefore(container, sidebar);
    });
}    




// route
const currentURL = window.location.href;
const route = () => {

    if (currentURL.includes("view.php")) {
        // 课程页面
        CourePage_handler();
    } else if (currentURL.includes("courses.php")) {
        // my courses
        CourseList_handler();
    } else {
        // 主页
        get_psb();
        initialize();
    }
};

route();
