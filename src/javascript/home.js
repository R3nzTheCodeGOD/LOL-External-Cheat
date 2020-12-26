var homeIcons = document.querySelectorAll(".icon");
var newVersion = document.querySelector("#newVersion");
mouseDown(0, "https://github.com/R3nzTheCodeGOD");
mouseDown(1, "https://discord.gg/4tBgrp4t5a");
async function load() {
  newVersion.innerHTML = `Yeni Versiyon: V.1.1.0`;
}
load();
for (var i = 0; i < homeIcons.length; i++) {
  homeIcons[i].addEventListener("mouseover", function () {
    this.classList.add("gitIconToggle");
  });
  homeIcons[i].addEventListener("mouseleave", function () {
    this.classList.remove("gitIconToggle");
  });
}
function mouseDown(element, url) {
  homeIcons[element].addEventListener("mousedown", function (e) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });
}
