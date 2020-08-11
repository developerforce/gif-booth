import React, { useState, useEffect } from 'react';
import { Container, Card, CardImg } from 'reactstrap';
import { Link } from 'react-router-dom';
import StackGrid from "react-stack-grid";
import download from 'downloadjs';
import '../App.css';

const ListPage = () => {
	const s3URL = 'https://bucketeer-7dcba73d-2692-4191-be53-1b4e69bfff3d.s3.amazonaws.com/';
	const [data, setData] = useState([]);

	useEffect(() => {
		loadGifs();
	}, []);

	const handleDownload = async (filename) => {
    const res = await fetch(`/s3-download?filename=${filename}`); //console.log(res);
    const fileBlob = res.blob(); //console.log(fileBlob);
    fileBlob.then((res) => download(res, `${filename}.gif`));
	}
	
	const deleteObj = (filename) => {
    const formData = { filename };
    fetch('/deleteObj', {
      method: 'delete', // or 'PUT'
      body: JSON.stringify(formData),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
		.then(response => { console.log('Success:', response);
			loadGifs();
		})
    .catch(error => console.error('Error:', error));
	}
	
	const loadGifs = () => {
    fetch('/all-gifs')
    .then(res => res.json())
		.then(response => { console.log(response);
			const { Contents } = response;
			setData(Contents);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
	
	return (
		<Container fluid>
			<StackGrid
				columnWidth={139}
				monitorImagesLoaded={true}
				gutterWidth={15}
				gutterHeight={15}
			>
				<Link
					to="/new-gif"
					className="btn btn-info btn-lg btn-block"
				>
					<div>New GIF</div>
				</Link>
				{data.map(({ Key }, i) => 	
					<Card className="" key={i}>
						<a href=" " className="trash" onClick={()=>deleteObj(Key)} style={{ visibility: 'hidden' }}> </a>
						<CardImg style={{ cursor: 'pointer' }} onClick={()=>handleDownload(Key)} src={`${s3URL}${Key}`} alt="Card image cap" />
					</Card>
				)}
			</StackGrid>
    </Container>
	);
};

export default ListPage;
