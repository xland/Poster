import React from "./React";
import "./Index.scss";
import TitleBar from "./TitleBar";
import Sizer from "./Sizer";
import ContentBox from "./ContentBox";

let App = () => {
    return (<>
        <TitleBar></TitleBar>
        <ContentBox></ContentBox>
        <Sizer></Sizer>
    </>);
};
document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(<App></App>);
    document.body.setAttribute("class", "blue");
});