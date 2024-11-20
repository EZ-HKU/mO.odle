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

chrome.omnibox.onInputEntered.addListener((text) => {
    chrome.storage.sync.get(["course_code_list"], (data) => {
        if (data.course_code_list) {
            var course_code_list = courseCodeListFromStorage(data.course_code_list);
            var courses = course_code_list.getAllCourses();
            for (let course of courses) {
                var upper = course.title.toUpperCase();
                if (upper.includes(text.toUpperCase())) {
                    chrome.tabs.create({ url: course.url });
                    return;
                }
            }
        }
    });
});

chrome.omnibox.onInputChanged.addListener((text, suggest) => {
    chrome.storage.sync.get(["course_code_list"], (data) => {
        if (data.course_code_list) {
            var course_code_list = courseCodeListFromStorage(data.course_code_list);
            var courses = course_code_list.getAllCourses();
            const suggestions = [];
            courses.forEach(function (course) {
                var upper = course.title.toUpperCase();
                if (upper.includes(text.toUpperCase())) {
                    suggestions.push({ content: course.code, description: course.title });
                }
            });
            suggest(suggestions);
        }
    });
});


// chrome.runtime.onInstalled.addListener(() => {
//     chrome.windows.create({
//       url: '../tip.html',
//       type: 'popup',
//       width: 800,
//       height: 600,
//       left: 400, 
//       top: 100
//     });
//   });

