import React from "react";
import cx from "classnames";
import logoSrc from "../../logo.svg";
import "./Page.css";

const Page = ({ className, children }) => (
  <>
    <div className={cx(className, "gif-page-container")}>{children}</div>
    <footer className="row">
      <img alt="fostive logo" src={logoSrc} />
    </footer>
  </>
);

export default Page;
