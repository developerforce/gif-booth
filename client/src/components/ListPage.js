import React, { useState, useEffect } from 'react';
import { Container, CardImg, Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import StackGrid from "react-stack-grid";
import download from 'downloadjs';

const ListPage = () => {

	const [data, setData] = useState([]);
	const [token, setToken] = useState();

	useEffect(() => {
    fetch('/all-gifs')
    .then(res => res.json())
		.then(response => { //console.log(response);
			const { resources, next_cursor } = response;
			setData(resources);
			setToken(next_cursor);
    })
    .catch(error => {
      console.error('Error:', error);
    });
	}, []);

	const loadMore = () => {
    fetch(`/all-gifs?next_cursor=${token}`)
    .then(res => res.json())
		.then(response => { //console.log(response);
			const { resources, next_cursor } = response;
			setData([ ...data, ...resources ]);
			setToken(next_cursor);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
	
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
				{data.map(({ secure_url }, i) => <CardImg key={i} style={{ cursor: 'pointer' }} onClick={()=>download(secure_url)} src={secure_url} alt="Card image cap" />)}
				{token && <Button color="success" block className="" onClick={loadMore}>Load More</Button>}
			</StackGrid>
    </Container>
	);
};

export default ListPage;
