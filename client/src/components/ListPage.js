import React, { useState, useEffect } from 'react';
import { Container, CardImg } from 'reactstrap';
import { Link } from 'react-router-dom';
import StackGrid from "react-stack-grid";

const ListPage = () => {

	const [data, setData] = useState([]);

	useEffect(() => {
    fetch('/all-gifs')
    .then(res => res.json())
		.then(response => { //console.log(response);
			const { resources } = response;
			setData(resources);
    })
    .catch(error => {
      console.error('Error:', error);
    });
	}, []);
	
	return (
		<Container fluid>
			<StackGrid
				columnWidth={250}
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
				{data.map(({ secure_url }, i) => <CardImg key={i} top width="100%" src={secure_url} alt="Card image cap" />)}
			</StackGrid>
    </Container>
	);
};

export default ListPage;
