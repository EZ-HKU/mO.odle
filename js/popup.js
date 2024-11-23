var course_list_div = document.getElementById("course_list_div");
var expand_btn = document.getElementById("expand_btn");
var psb_list_div = document.getElementById("psb_list_div");
// var course_list = [];
// var course_dict = {};
// var psb_list = [];

// course_title: code+detail
// course_list: list of course_title (str)
// course_dict: dict of course_title: { mo_code: {
//                                      title: ori code + detail, 
//                                      detail: detail, 
//                                      url: url } }        
// psb_list: list of course_title

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
    var tempList = this.findCoursesByCode(course.code);
    if (tempList) {
        this.courseCodes.forEach(function (courseCode) {
            if (courseCode.code === course.code) {
                courseCode.courses.addCourse(course);
            }
        });

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
    return this.courseCodes.find(function (courseCode) {
        return courseCode.code === code;
    });
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

CourseCodeList.prototype.removeCourseByTitle = function (title) {
    for (var i = 0; i < this.courseCodes.length; i++) {
        this.courseCodes[i].courses.deleteCourseByTitle(title);
    }
}



courseCodeListFromStorage = function (courseCodeList) {
    if (!courseCodeList) {
        return new CourseCodeList();
    }
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


// 以下为course_list

function add_course(course) {
    var tempDiv = document.createElement("div");
    var newText = document.createElement("span");
    var del_btn = document.createElement("button");
    tempDiv.style.height = "30px";
    tempDiv.style.width = "210px"
    tempDiv.style.display = "flex";
    tempDiv.style.justifyContent = "space-between";
    tempDiv.style.alignItems = "center";
    del_btn.innerText = "-";
    del_btn.style.marginLeft = "auto";
    del_btn.classList.add("my-btn")
    del_btn.classList.add("del-btn")
    del_btn.onclick = function () {
        chrome.storage.sync.get(["course_code_list", "psb_list"], (data) => {
            var course_code_list = courseCodeListFromStorage(data.course_code_list);
            course_code_list.removeCourseByTitle(course.title);
            course_list_div.removeChild(tempDiv);
            if (data.psb_list) {
                var psb_list = courseCodeListFromStorage(data.psb_list);
                add_psb_course(course);
                psb_list.addCourse(course);
                chrome.storage.sync.set({ psb_list: psb_list });
            }
            var len = course_list_div.children.length * 30;
            course_list_div.style.height = len + "px";
            chrome.storage.sync.set({ course_code_list: course_code_list, change_flag: true });
        });
    };
    newText.innerText = course.title;
    newText.style.whiteSpace = "nowrap";
    newText.style.overflow = "hidden";
    newText.style.textOverflow = "ellipsis";
    newText.style.marginRight = "15px";
    newText.setAttribute('title', course.title);
    tempDiv.appendChild(newText)
    tempDiv.appendChild(del_btn)
    course_list_div.appendChild(tempDiv);
    var len = course_list_div.children.length * 30;
    course_list_div.style.height = len + "px";
}


function generate_course_list_div() {
    chrome.storage.sync.get(["course_code_list"], (data) => {
        if (data.course_code_list) {
            console.log(data.course_code_list);
            var course_code_list = courseCodeListFromStorage(data.course_code_list);
            var courses = course_code_list.getAllCourses();
            courses.forEach(course => {
                add_course(course);
            });
        }
    })
}



// 以下为psb_list

function add_psb_course(course) {
    var psb_div = document.createElement("div");
    var pp = document.createElement("p");
    pp.classList.add("pp");
    pp.innerText = course.title;
    psb_div.appendChild(pp);
    psb_div.classList.add("course_text");
    psb_div.style.margin = "5px 0";
    psb_div.setAttribute('title', course.title);
    psb_list_div.appendChild(psb_div);
    var len = psb_list_div.children.length * 42;
    psb_list_div.style.height = len + "px";
    psb_div.addEventListener("click", function () {
        chrome.storage.sync.get(["course_code_list", "psb_list"], (data) => {
            var course_code_list = courseCodeListFromStorage(data.course_code_list);
            var psb_list = courseCodeListFromStorage(data.psb_list);
            course_code_list.addCourse(course);
            psb_list_div.removeChild(psb_div);
            psb_list.removeCourseByTitle(course.title);
            var len = psb_list_div.children.length * 42;
            psb_list_div.style.height = len + "px";
            add_course(course);
            chrome.storage.sync.set({ course_code_list: course_code_list, change_flag: true, psb_list: psb_list });
        });
    });
}


function generate_psb_list_div() {
    chrome.storage.sync.get(["psb_list"], (data) => {
        if (data.psb_list) {
            var psb_list = courseCodeListFromStorage(data.psb_list);
            var courses = psb_list.getAllCourses();
            courses.forEach(course => {
                add_psb_course(course);
            });
        }else{
            var psb_div = document.createElement("div");
            var pp = document.createElement("p");
            pp.classList.add("pp");
            pp.innerText = "Get my courses";
            psb_div.appendChild(pp);
            psb_div.classList.add("course_text");
            psb_div.style.margin = "5px 0";
            psb_list_div.appendChild(psb_div);
            var len = psb_list_div.children.length * 42;
            psb_list_div.style.height = len + "px";
            psb_div.addEventListener("click", function () {
                chrome.tabs.create({ url: 'https://moodle.hku.hk/' });
            });
        }
    });
}


// init
generate_psb_list_div();
generate_course_list_div();

document.getElementById('help').addEventListener('click', function () {
    chrome.windows.create({
        url: '../tip.html',
        type: 'popup',
        width: 800,
        height: 600,
        left: 400,
        top: 100
    });
});

document.getElementById('reset').addEventListener('click', function () {
    chrome.storage.sync.remove('psb_list', function() {
        window.location.reload();
    });
});
