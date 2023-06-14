import { useEffect, useState } from "react";
import Post from "../components/Post";
import { createNewPost } from "../utils/APIroutes";
export default function IndexPage() {
	const [posts, setPosts] = useState([]);
	useEffect(() => {
		//HERE we mount our HomePage-components
		//then run this function
		//get request is by default
		fetch(createNewPost).then((response) => {
			response.json().then((posts) => {
				setPosts(posts);
				// console.log(posts);
			});
		});
	}, []);
	return (
		<>
			{/* <Post />
			<Post />
			<Post /> */}
			{posts.length > 0 && posts.map((post) => <Post {...post} />)}
		</>
	);
}
