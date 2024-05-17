(() => {
  // src/React.ts
  var appendChild = (children, node) => {
    if (Array.isArray(children)) {
      for (const child of children) {
        if (child) appendChild(child, node);
      }
    } else if (typeof children === "string" || typeof children === "number") {
      let textNode = document.createTextNode(children);
      node.appendChild(textNode);
    } else if (typeof children.nodeType === "number") {
      node.appendChild(children);
    }
  };
  var appendAttr = (attr, node) => {
    for (let key of Object.keys(attr)) {
      if (key === "style") {
        node.setAttribute("style", attr[key]);
      } else if (typeof attr[key] === "function") {
        if (key.startsWith("on")) {
          node.addEventListener(key.toLocaleLowerCase().substring(2), attr[key]);
        }
      } else if (typeof attr[key] === "object") {
        node[key] = attr[key];
      } else {
        node.setAttribute(key, attr[key]);
      }
    }
  };
  var createElement = (tag, attr, ...children) => {
    if (typeof tag === "string") {
      let node = document.createElement(tag);
      if (attr) appendAttr(attr, node);
      if (children) appendChild(children, node);
      return node;
    } else if (typeof tag === "function") {
      return tag({ ...attr, children });
    } else console.log("jsx error", tag, attr, children);
  };
  var Fragment = (attr) => {
    const fragment = document.createDocumentFragment();
    appendChild(attr.children, fragment);
    return fragment;
  };
  var React_default = { createElement, Fragment };

  // src/TitleBar.tsx
  function TitleBar_default(props) {
    let closeWin = () => {
      chrome.webview.hostObjects.sync.host.CloseWindow();
    };
    return /* @__PURE__ */ React_default.createElement("div", { class: "TitleBar" }, /* @__PURE__ */ React_default.createElement("div", { class: "TitleLabel" }, "allen"), /* @__PURE__ */ React_default.createElement("div", { class: "WindowToolBox" }, /* @__PURE__ */ React_default.createElement("div", { class: "WindowToolBtn" }, /* @__PURE__ */ React_default.createElement("i", { class: "icon iconminimize" })), /* @__PURE__ */ React_default.createElement("div", { class: "WindowToolBtn" }, /* @__PURE__ */ React_default.createElement("i", { class: "icon iconmaximize" })), /* @__PURE__ */ React_default.createElement("div", { class: "WindowToolBtn closeBtn", onClick: closeWin }, /* @__PURE__ */ React_default.createElement("i", { class: "icon iconclose" }))));
  }

  // src/Sizer.tsx
  function Sizer_default(props) {
    let sizeDown = (e) => {
      if (e.button != 0) {
        return;
      }
      let target = e.currentTarget;
      let name = target.className;
      let val;
      if (name === "topBorderLeft") {
        val = 13;
      } else if (name === "topBorderCenter") {
        val = 12;
      } else if (name === "topBorderRight") {
        val = 14;
      } else if (name === "leftBorder") {
        val = 10;
      } else if (name === "rightBorder") {
        val = 11;
      } else if (name === "bottomBorderLeft") {
        val = 16;
      } else if (name === "bottomBorderCenter") {
        val = 15;
      } else if (name === "bottomBorderRight") {
        val = 17;
      }
      chrome.webview.hostObjects.sync.host.HitTest(val);
    };
    return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement("div", { class: "topBorder" }, /* @__PURE__ */ React_default.createElement("div", { class: "topBorderLeft", onMouseDown: sizeDown }), /* @__PURE__ */ React_default.createElement("div", { class: "topBorderCenter", onMouseDown: sizeDown }), /* @__PURE__ */ React_default.createElement("div", { class: "topBorderRight", onMouseDown: sizeDown })), /* @__PURE__ */ React_default.createElement("div", { class: "leftBorder", onMouseDown: sizeDown }), /* @__PURE__ */ React_default.createElement("div", { class: "rightBorder", onMouseDown: sizeDown }), /* @__PURE__ */ React_default.createElement("div", { class: "bottomBorder" }, /* @__PURE__ */ React_default.createElement("div", { class: "bottomBorderLeft", onMouseDown: sizeDown }), /* @__PURE__ */ React_default.createElement("div", { class: "bottomBorderCenter", onMouseDown: sizeDown }), /* @__PURE__ */ React_default.createElement("div", { class: "bottomBorderRight", onMouseDown: sizeDown })));
  }

  // src/ContentBox.tsx
  function ContentBox_default(props) {
    return /* @__PURE__ */ React_default.createElement("div", { class: "ContentBox" }, /* @__PURE__ */ React_default.createElement("div", { class: "leftBox" }), /* @__PURE__ */ React_default.createElement("div", { class: "editorBox" }));
  }

  // src/Index.tsx
  var App = () => {
    return /* @__PURE__ */ React_default.createElement(React_default.Fragment, null, /* @__PURE__ */ React_default.createElement(TitleBar_default, null), /* @__PURE__ */ React_default.createElement(ContentBox_default, null), /* @__PURE__ */ React_default.createElement(Sizer_default, null));
  };
  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(/* @__PURE__ */ React_default.createElement(App, null));
    document.body.setAttribute("class", "blue");
  });
})();
//# sourceMappingURL=Index.js.map
