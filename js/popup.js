var add_btn = document.getElementById("add_btn");
var course_input = document.getElementById("course_input");
var course_list_div = document.getElementById("course_list_div");
var course_list = [];

function add_new_p(course_title, value, course_list, course_dict) {
    console.log(course_list);
    console.log(course_title, value);
    var tempDiv = document.createElement("div");
    var newText = document.createElement("span");
    var del_btn = document.createElement("button");
    tempDiv.style.height = "30px";
    tempDiv.style.display = "flex";
    tempDiv.style.justifyContent = "space-between";
    tempDiv.style.alignItems = "center";
    del_btn.innerText = "-";
    del_btn.style.marginLeft = "auto";
    del_btn.classList.add("my-btn")
    del_btn.classList.add("del-btn")
    del_btn.onclick = function () {
        chrome.storage.sync.set({ change_flag: true });
        course_list_div.removeChild(tempDiv);
        course_list = course_list.filter(item => item !== course_title);
        delete course_dict[course_title];
        chrome.storage.sync.set({ course_list: course_list, course_dict: course_dict });
    }
    newText.innerText = value.mo_code;
    tempDiv.appendChild(newText)
    tempDiv.appendChild(del_btn)
    course_list_div.appendChild(tempDiv);
    // course_input.value = "";
}

chrome.storage.sync.get(["course_dict", "course_list"], (data) => {
    if (data.course_dict && Object.keys(data.course_dict).length > 0) {
        var course_dict = data.course_dict;
        var course_list = data.course_list;
        for (const [key, value] of Object.entries(course_dict)) {
            add_new_p(key, value, course_list, course_dict);
        }
        
    } else {
        console.log('add at least one course!');
    }
})

// function click_add_btn() {
//     console.log('add course');
//     if (course_input.value === "") {
//         chrome.tabs.create({ url: "https://moodle.hku.hk/my/courses.php" });
//         return;
//     }
//     var code = course_input.value.toUpperCase();
//     chrome.storage.sync.set({ change_flag: true });
//     course_list.push(code);
//     add_new_p(code);
//     chrome.storage.sync.set({ course_list: course_list });
// }

// course_input.addEventListener("keydown", (event) => {
//     if (event.key == 'Enter') {
//         click_add_btn();
//     }
// })


// add_btn.addEventListener("click", click_add_btn);


// 到此，会有正确的course_list (list)，否则为空
// 以下为unshown

chrome.storage.sync.get("unshown_course_list", (data) => {
    if (data.unshown_course_list) {
        unshown_course_list = data.unshown_course_list;
        unshown_course_list.forEach(function (course_code) {
            addDiv(course_code);
        });
    }
})

var container = document.getElementById("container")
var detail = "";
var url = "";

function addDiv(course_code) {
    var div = document.createElement("div");
    var inner_div = document.createElement('div')
    inner_div.style.display = "flex";
    inner_div.style.justifyContent = "space-between";
    inner_div.style.alignItems = "center";
    var text_p = document.createElement("p");
    text_p.innerText = course_code;
    text_p.style.margin = "5px 0 5px 5px";
    text_p.style.fontSize = "14px";
    var ipt_detail = document.createElement("input");
    var ipt_url = document.createElement("input");
    ipt_detail.classList.add("input");
    ipt_url.classList.add("input");
    ipt_detail.type = "text";
    ipt_detail.placeholder = "Name";
    ipt_url.type = "text";
    ipt_url.placeholder = "URL";
    var btn = document.createElement("button");
    btn.innerText = "+";
    btn.classList.add("my-btn");
    btn.classList.add("add-btn");
    btn.onclick = function () {
        detail = ipt_detail.value;
        url = ipt_url.value;
        if (detail === "" || url === "") {
            return;
        }
        chrome.storage.sync.get(["course_dict", "unshown_course_list"], (data) => {
            if (data.course_dict) {
                data.course_dict[course_code] = { "detail": detail, "url": url };
                chrome.storage.sync.set({ course_dict: data.course_dict });
            }
            if (data.unshown_course_list) {
                chrome.storage.sync.set({ unshown_course_list: data.unshown_course_list.filter(item => item !== course_code) });
            }
        })
        ipt_detail.value = "";
        ipt_url.value = "";
        container.removeChild(div);
    }
    inner_div.appendChild(ipt_url);
    inner_div.appendChild(btn);
    div.appendChild(text_p);
    div.appendChild(ipt_detail);
    div.appendChild(inner_div);
    container.appendChild(div);
}

// 以下为psb

chrome.storage.sync.get(["psb_course_list"], (data) => {
    console.log(data);
    if (data.psb_course_list) {
        var psb_course_list = data.psb_course_list;
        psb_course_list.forEach(function (course_code) {
            // 这个course_code是完整的(code+detail)
            addPsbDiv(course_code);
        });
    }
});

var psb_course_list_div = document.getElementById("psb_course_list_div");
function addPsbDiv(course_code) {
    chrome.storage.sync.get(["course_list"], (data) => {
        var course_list = data.course_list;
        if (course_list){
            if (course_list.includes(course_code)){
                return;
            }
        }
        var psb_div = document.createElement("div");
        var pp = document.createElement("p");
        pp.innerText = course_code;
        pp.style.whiteSpace = "nowrap";
        pp.style.overflow = "hidden";
        pp.style.textOverflow = "ellipsis";
        psb_div.appendChild(pp);
        psb_div.classList.add("course_text")
        psb_div.style.margin = "5px 0"
        psb_course_list_div.appendChild(psb_div);
        psb_div.addEventListener("click", function () {
            chrome.storage.sync.get(["course_list", "course_dict"], (data) => {
                course_list = data.course_list;
                course_dict = data.course_dict;
                if (!course_list){
                    course_list = [];
                }
                // 这个code是code+detail
                course_list.push(course_code); //.substring(0, 8)
                chrome.storage.sync.set({ course_list: course_list, change_flag: true });
                console.log(course_list);
                add_new_p(course_code, { "mo_code": course_code.substring(0, 8) }, course_list, course_dict);
                psb_course_list_div.removeChild(psb_div);
                var len = psb_course_list_div.children.length * 40;
                psb_course_list_div.style.height = len + "px";
            });
        });
    });
}


// expand btn
var expand_btn = document.getElementById("expand_btn");
expand_btn.addEventListener("click", function () {
    console.log(psb_course_list_div.classList);
    if (psb_course_list_div.classList.length === 1) {
        psb_course_list_div.classList.remove('expand'); // 移除旧类
        psb_course_list_div.style.height = "0";
    }else{
        psb_course_list_div.classList.add('expand'); // 添加新类
        var len = psb_course_list_div.children.length * 40;
        psb_course_list_div.style.height = len + "px";
    }
});


// help
var help_btn = document.getElementById("help");
var help_text = document.getElementById("help_text");
help_btn.addEventListener("click", function () {
    if (help_text.style.display == "block") {
        help_text.style.display = "none";
    } else {
        help_text.style.display = "block";
    }
});