import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cx from "classnames";
import download from "downloadjs";
import "./Home.css";
import Button from "../../components/Button";
import Page from "../../components/Page";

// const deleteObj = (filename) => {
// 	const formData = { filename };
// 	fetch("/deleteObj", {
// 		method: "delete", // or 'PUT'
// 		body: JSON.stringify(formData),
// 		headers: {
// 			"Content-Type": "application/json",
// 		},
// 	})
// 		.then((res) => res.json())
// 		.then((response) => {
// 			console.log("Success:", response);
// 			loadGifs();
// 		})
// 		.catch((error) => console.error("Error:", error));
// };

// AYYYYYYYY
// this needs to be replaced when dev is over:
// const s3URL = 'https://bucketeer-7dcba73d-2692-4191-be53-1b4e69bfff3d.s3.amazonaws.com/';
const s3URL = "https://gif-app-test.s3.us-east-2.amazonaws.com/";

const handleDownload = async (filename) => {
  const res = await fetch(`/s3-download?filename=${filename}`);
  const fileBlob = res.blob();
  fileBlob.then((res) => download(res, filename));
};

const ListPage = () => {
  const [data, setData] = useState([]);
  const [byNewest, setByNewest] = useState(true);

  useEffect(() => {
    loadGifs();
  }, []);

  const loadGifs = async () => {
    try {
      const res = await fetch("/all-gifs");
      const json = await res.json();
      setData(json.Contents);
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const orderedData = byNewest ? [...data].reverse() : data;

  return (
    <Page className="gif-home">
      <div className="gif-home-header row">
        <span>
          <h1>Browse GIFs</h1>
          <h2>{` (${data?.length || 0})`}</h2>
        </span>
        <div className={cx("gif-home-order", "row")}>
          <p>Sort By</p>
          <button
            className={cx(byNewest && "active")}
            onClick={() => setByNewest(true)}
          >
            Newest
          </button>
          <button
            className={cx(!byNewest && "active")}
            onClick={() => setByNewest(false)}
          >
            Oldest
          </button>
        </div>
      </div>
      <div className="gif-card-container">
        <Link to="/new-gif" className="gif-createnew-button">
          <Button>Create Your Own GIF</Button>
        </Link>
        {orderedData.map(({ Key }) => (
          <img
            key={Key}
            onClick={() => handleDownload(Key)}
            src={`${s3URL}${Key}`}
            alt="Card image cap"
            className="gif-card-image"
          />
        ))}
      </div>
    </Page>
  );
};

export default ListPage;
