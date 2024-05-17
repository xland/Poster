import React from "./React";
import "./Sizer.scss";
export default function (props) {
    let sizeDown = (e) => {
        if (e.button != 0) {
            return;
        }
        let target = e.currentTarget as HTMLInputElement;
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
    }
    return (
        <>
            <div class="topBorder">
                <div class="topBorderLeft" onMouseDown={sizeDown}></div>
                <div class="topBorderCenter" onMouseDown={sizeDown}></div>
                <div class="topBorderRight" onMouseDown={sizeDown}></div>
            </div>
            <div class="leftBorder" onMouseDown={sizeDown}></div>
            <div class="rightBorder" onMouseDown={sizeDown}></div>
            <div class="bottomBorder">
                <div class="bottomBorderLeft" onMouseDown={sizeDown}></div>
                <div class="bottomBorderCenter" onMouseDown={sizeDown}></div>
                <div class="bottomBorderRight" onMouseDown={sizeDown}></div>
            </div>
        </>
    );
};