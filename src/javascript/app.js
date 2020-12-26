const { dialog } = require("electron").remote;
const { remote } = require("electron");
const sidePanel = document.querySelectorAll("h3");
let activePanel = sidePanel[0];
const LCUConnector = require("lcu-connector");
const connector = new LCUConnector();
const request = require("request");
const exit = document.querySelector("#exit");
var LeagueClient;

try {
  const fs = require("fs");
  const file = fs.readFileSync("config\\clientPath.txt").toString();
  if (file.split("\\").join("/") !== "") {
    connector._dirPath = file.split("\\").join("/");
  }
} catch (err) {}

connector.on("connect", (data) => {
  let url = `${data["protocol"]}://${data["address"]}:${data["port"]}`;
  let auth = "Basic " + btoa(`${data["username"]}:${data["password"]}`);
  LeagueClient = new ClientConnection(url, auth);
});

class ClientConnection {
  #url;
  #options;
  #endpoints;
  constructor(url, auth) {
    this.#url = url;
    this.#options = {
      rejectUnauthorized: false,
      headers: {
        Accept: "application/json",
        Authorization: auth,
      },
      url: this.url,
    };
    this.#endpoints = {
      presetIcon: "/lol-summoner/v1/current-summoner/icon/",
      lolChat: "/lol-chat/v1/me/",
      aram: "/lol-champ-select/v1/team-boost/purchase/",
      profile: "/lol-summoner/v1/current-summoner/summoner-profile/",
      friends: "/lol-chat/v1/friends/",
      conversations: "/lol-chat/v1/conversations/",
    };
  }

  // Alıcı
  get endpoints() {
    return this.#endpoints;
  }
  get options() {
    return this.#options;
  }
  get url() {
    return this.#url;
  }

  // Simgeyi önceden ayarlanmış Çince olanlarla değiştir
  requestPresetIcon(body) {
    this.makeRequest("PUT", body, this.#endpoints.presetIcon);
  }

  // Kullanıcının verdiği kodla simgeyi değiştir
  requestAnyIcon(body) {
    this.makeRequest("PUT", body, this.#endpoints.lolChat);
  }

  // Aram boost
  requestAram() {
    this.makeRequest("POST", "", this.#endpoints.aram);
  }

  // Profil arkaplanını değiştir
  requestBackground(body) {
    this.makeRequest("POST", body, this.#endpoints.profile);
  }

  // Clientte rankı değiştir
  requestRank(body) {
    this.makeRequest("PUT", body, this.#endpoints.lolChat);
  }

  // Durumu Değiştir
  requestStatus(body) {
    this.makeRequest("PUT", body, this.#endpoints.lolChat);
  }

  // Ozel İstek
  requestCustom(method, body, endPoint, reply) {
    this.#options["url"] = this.#url + endPoint;
    this.#options["method"] = method;
    this.#options["body"] = JSON.stringify(body);
    request(this.#options, function (error, response) {
      let dialogOptions = {};
      try {
        dialogOptions = {
          type: "info",
          title: "Bilgi",
          message: `Yanıt durum kodu: ${response.statusCode}`,
        };
        reply.value = "";
        let obj = JSON.parse(response.body);
        let format = JSON.stringify(obj, null, 3);
        reply.value = format;
        let input = new Event("input");
        reply.dispatchEvent(input);
      } catch (e) {
        dialogOptions = {
          type: "info",
          title: "Bilgi",
          message: "İstek Yapıldı",
        };
      }
      dialog.showMessageBox(dialogOptions);
    });
  }
  
  makeRequest(method, body, endPoint) {
    this.#options["url"] = this.#url + endPoint;
    this.#options["method"] = method;
    this.#options["body"] = JSON.stringify(body);
    this.run(this.#options);
  }
  run(command) {
    request(command, function (error, response) {
      let dialogOptions = {};
      if (
        !error &&
        (response.statusCode === 201 ||
          response.statusCode === 200 ||
          response.statusCode === 204)
      ) {
        dialogOptions = {
          type: "info",
          title: "Başarılı",
          message: "Dostum işlem başarılı oldu amk",
        };
      } else {
        let status = "Dostum LOL'ün apisinden cevap alamadık";
        try {
          status = response.body;
        } catch (e) {}
        dialogOptions = {
          type: "error",
          title: "YARRAK HATASI",
          message: `Bir hata oluştu: \n(${status})`,
        };
      }
      dialog.showMessageBox(dialogOptions);
    });
  }
}

// LOL ile olan bağlantı gittiğinde uygulamayı kapat
connector.on("disconnect", (data) => {
  dialog.showErrorBox(
    "YARRAK HATASI",
    "LOL ile olan baglantı kesildi. Uygulamayı kapatın!"
  );
  remote.BrowserWindow.getFocusedWindow().close();
});
connector.start();

exit.addEventListener("mouseover", function () {
  if (activePanel !== this) {
    this.classList.add("barMouseOver");
  }
});
exit.addEventListener("mouseleave", function () {
  if (activePanel !== this) {
    this.classList.remove("barMouseOver");
  }
});
exit.addEventListener("mousedown", function () {
  remote.BrowserWindow.getFocusedWindow().close();
});

for (let i = 0; i < sidePanel.length - 1; i++) {
  sidePanel[i].addEventListener("mouseover", function () {
    if (activePanel !== this) {
      this.classList.add("barMouseOver");
    }
  });
  sidePanel[i].addEventListener("mouseleave", function () {
    if (activePanel !== this) {
      this.classList.remove("barMouseOver");
    }
  });
  sidePanel[i].addEventListener("mousedown", function (e) {
    if (typeof e === "object" && e.button === 0) {
      activePanel.classList.remove("barMouseOver");
      activePanel = this;
      active();
    }
  });
}
active();

// Her html sayfasını yükleme fonksiyonu
function active() {
  activePanel.classList.add("barMouseOver");
  const page = activePanel.id;
  const xhr = new XMLHttpRequest();
  xhr.open("GET", `./html/${page}.html`, true);
  xhr.onreadystatechange = function () {
    if (this.readyState !== 4) return;
    if (this.status !== 200) return;
    document.querySelector(".pane").innerHTML = this.responseText;
    loadjs(page);
  };
  xhr.send();
}
function loadjs(page) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `javascript/${page}.js`;
  script.defer = true;
  document.body.appendChild(script);
}
