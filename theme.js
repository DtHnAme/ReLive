let styleSnippetConfig = JSON.parse(
    window.localStorage.getItem(
        "cc.microblock.betterncm.stylesnippets.snippetsConfig.relive-theme"
    ) || "{}"
);

window.localStorage.setItem("refined-now-playing-refined-control-bar", styleSnippetConfig["@modify-play-page"] == true && styleSnippetConfig["@modify-play-page"] == undefined ? "false" : "true");

plugin.onAllPluginsLoaded(async function (plugins) {
    if (!plugins.StyleSnippet?.addExternalSnippet) {
        setTimeout(async () => {
            (await betterncm.utils.waitForElement("header")).prepend(
                dom("div", {
                    innerText:
                        "请安装/更新 StyleSnippet 插件，否则 ReLive 主题将不会生效。",
                    style: {
                        width: "100%",
                        height: "30px",
                        lineHeight: "30px",
                        background: "#ec414188",
                        color: "white",
                        textAlign: "center",
                        zIndex: 999,
                        position: "absolute",
                        pointerEvents: "none",
                    },
                })
            );
        }, 1000);

        return;
    }

    plugins.StyleSnippet.addExternalSnippet(
        await betterncm.fs.readFileText(this.pluginPath + "./theme.less"),
        "ReLiveTheme",
        "relive-theme"
    );

    document.addEventListener("fullscreenchange", () => {
        if (document.fullscreenElement) document.body.classList.add("fullscreen");
        else document.body.classList.remove("fullscreen");
    });

    // light/dark theme switcher
    let isDark = JSON.parse(window.localStorage.getItem("relive-theme-dark") || "false");
    function loadDark() {
        if (isDark) {
            document.body.classList.add("s-theme-white");
            document.querySelector("#skin_default").href = undefined;
            document.querySelector("#pri-skin-gride").href =
                "orpheus://skin/default/default/web/css/skin.ls.css";
        } else {
            document.body.classList.remove("s-theme-white");
            document.querySelector("#skin_default").href =
                "../../style/res/less/default/css/skin.ls.css";
            document.querySelector("#pri-skin-gride").href =
                "orpheus://skin/pub/web/css/skin.ls.css";
        }
    }
    loadDark();
    let lastSkinNode;
    new MutationObserver(async () => {
        let skinNode = document.querySelector(".m-tool > .skin");
        if (!skinNode || skinNode == lastSkinNode) return;
        lastSkinNode = skinNode;
        skinNode.addEventListener("click", (e) => {
            isDark = !isDark;
            window.localStorage.setItem("relive-theme-dark", JSON.stringify(isDark));
            loadDark();
        });
    }).observe(document.querySelector("html"), {
        childList: true,
        subtree: true,
    });

    // fullscreen popup fix
    new MutationObserver((mutation) => {
        for (const mut of mutation) {
            let target = mut.target;
            target.childNodes.forEach((node) => {
                if (node.tagName == "DIV") {
                    document.body.appendChild(node);
                }
            });
        }
    }).observe(document.querySelector("html"), {
        childList: true,
    });

    // program detector
    new MutationObserver((mutation) => {
        for (const mut of mutation) {
            let target = mut.target;
            for (const node of target.children) {
                if (node.classList.contains("g-single")) {
                    document.body.classList.toggle(
                        "mq-playing-program",
                        node.childNodes.item(0).classList.contains("g-single-program")
                    );
                }
            }
        }
    }).observe(document.querySelector("body"), {
        childList: true,
    });
});
