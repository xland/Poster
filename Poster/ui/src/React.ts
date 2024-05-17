let appendChild = (children: any, node: Node) => {
  if (Array.isArray(children)) {
    for (const child of children) {
      if (child) appendChild(child, node);
    }
  } else if (typeof children === "string" || typeof children === "number") {
    let textNode = document.createTextNode(children as any);
    node.appendChild(textNode);
  } else if (typeof children.nodeType === "number") {
    node.appendChild(children);
  }
};
let appendAttr = (attr: object, node: HTMLElement) => {
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
let createElement = (tag: any, attr: any, ...children: any[]): any => {
  if (typeof tag === "string") {
    let node = document.createElement(tag);
    if (attr) appendAttr(attr, node);
    if (children) appendChild(children, node);
    return node;
  } else if (typeof tag === "function") {
    return tag({ ...attr, children });
  } else console.log("jsx error", tag, attr, children);
};
let Fragment = (attr: any) => {
  const fragment = document.createDocumentFragment();
  appendChild(attr.children, fragment);
  return fragment;
};
export default { createElement, Fragment };
