//this is edit functionality work here
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import Editor from "../components/Editor";
import { createNewPost } from "../utils/APIroutes";
export default function EditPost() {
	const { id } = useParams();
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");
	const [files, setFiles] = useState("");
	// const [cover, setCover] = useState("");
	const [redirect, setRedirect] = useState(false);

	useEffect(() => {
		//fetch information from this specific post
		fetch(`${createNewPost}/` + id).then((response) => {
			response.json().then((postInfo) => {
				setTitle(postInfo.title);
				setSummary(postInfo.summary);
				setContent(postInfo.content);
			});
		});
	}, []);

	async function updatePost(event) {
		event.preventDefault();
		//need to grab the info from the state and create a form data from it
		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		//send the postId so that it can edit
		data.set("id", id);
		if (files?.[0]) {
			data.set("image", files?.[0]);
		}

		const editResponse = await fetch(createNewPost, {
			method: "put",
			body: data,
			credentials: "include",
		});

		if (editResponse.ok) {
			setRedirect(true);
		}
	}
	//here we are rendering all HTML
	//redirect is true
	if (redirect) {
		return <Navigate to={"/create-new-post/" + id} />;
	}

	return (
		<form onSubmit={updatePost}>
			<input
				type="title"
				value={title}
				onChange={(event) => {
					setTitle(event.target.value);
				}}
				placeholder={"Title"}
			/>
			<input
				type="summary"
				value={summary}
				onChange={(event) => {
					setSummary(event.target.value);
				}}
				placeholder={"Summary"}
			/>
			<input type="file" onChange={(event) => setFiles(event.target.files)} />
			<Editor onChange={setContent} value={content} />
			<button style={{ marginTop: "15px" }}>Update Post</button>
		</form>
	);
}
