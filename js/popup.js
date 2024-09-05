var add_btn = document.getElementById("add_btn");
var course_input = document.getElementById("course_input");
var course_list_div = document.getElementById("course_list_div");
var course_list = [];

function add_new_p(course) {
    var tempDiv = document.createElement("div");
    var newText = document.createElement("span");
    var del_btn = document.createElement("button");
    tempDiv.style.height = "30px";
    tempDiv.style.display = "flex";
    tempDiv.style.justifyContent = "space-between";
    tempDiv.style.alignItems = "center";
    del_btn.innerText = "-";
    del_btn.style.marginLeft = "auto";
    del_btn.classList.add("btn")
    del_btn.classList.add("del-btn")
    del_btn.onclick = function () {
        chrome.storage.sync.set({ change_flag: true });
        course_list_div.removeChild(tempDiv);
        course_list = course_list.filter(item => item !== course);
        chrome.storage.sync.set({ course_list: course_list });
    }
    newText.innerText = course;
    tempDiv.appendChild(newText)
    tempDiv.appendChild(del_btn)
    course_list_div.appendChild(tempDiv);
    course_input.value = "";
}

chrome.storage.sync.get("course_list", (data) => {
    if (data.course_list && data.course_list.length > 0) {
        course_list = data.course_list;
        course_list.forEach(function (course_code) {
            add_new_p(course_code);
        });
    }else{
        console.log('add at least one course!');
    }
})

add_btn.addEventListener("click", function () {
    if (course_input.value === "") {
        // alert("Please input course code!")
        return;
    }
    var code = course_input.value.toUpperCase();
    chrome.storage.sync.set({ change_flag: true });
    course_list.push(code);
    add_new_p(code);
    chrome.storage.sync.set({ course_list: course_list });
});


// 到此，会有正确的course_list (list)，否则为空

chrome.storage.sync.get("unshown_course_list",(data)=>{
    if(data.unshown_course_list){
        unshown_course_list = data.unshown_course_list;
        unshown_course_list.forEach(function(course_code){
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
    text_p.style.margin= "5px 0 5px 5px";
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
    btn.classList.add("btn");
    btn.classList.add("add-btn");
    btn.onclick = function () {
        detail = ipt_detail.value;
        url = ipt_url.value;
        if (detail === "" || url === "") {
            return;
        }
        chrome.storage.sync.get(["course_dict", "unshown_course_list"], (data) => {
            if (data.course_dict){
                data.course_dict[course_code] = { "detail": detail, "url": url };
                chrome.storage.sync.set({ course_dict: data.course_dict });
            }
            if (data.unshown_course_list){
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

