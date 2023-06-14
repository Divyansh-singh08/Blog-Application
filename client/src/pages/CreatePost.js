import { useState } from "react";
// import ReactQuill from "react-quill";
// import "react-quill/dist/quill.snow.css";
import { Navigate } from "react-router-dom";
import Editor from "../components/Editor.js";
import { createNewPost } from "../utils/APIroutes.js";
// const modules = {
// 	toolbar: [
// 		[{ header: [1, 2, false] }],
// 		["bold", "italic", "underline", "strike", "blockquote"],
// 		[
// 			{ list: "ordered" },
// 			{ list: "bullet" },
// 			{ indent: "-1" },
// 			{ indent: "+1" },
// 		],
// 		["link", "image"],
// 		["clean"],
// 	],
// };

// const formats = [
// 	"header",
// 	"bold",
// 	"italic",
// 	"underline",
// 	"strike",
// 	"blockquote",
// 	"list",
// 	"bullet",
// 	"indent",
// 	"link",
// 	"image",
// ];

export default function CreatePost() {
	//we need to fix state
	//this will be form
	const [title, setTitle] = useState("");
	const [summary, setSummary] = useState("");
	const [content, setContent] = useState("");
	const [files, setFiles] = useState("");
	const [redirect, setRedirect] = useState(false);

	async function createNewPosts(event) {
		const data = new FormData();
		data.set("title", title);
		data.set("summary", summary);
		data.set("content", content);
		data.set("image", files[0]); //bcz we want to send only one file
		event.preventDefault();
		console.log(files);
		//grab all data info and send to the server-side
		// then render to the the client post page from server DB
		const response = await fetch(createNewPost, {
			method: "post",
			body: data,
			credentials: "include", //we will sending cookies too
		});

		if (response.ok) {
			setRedirect(true);
		}
	}

	//here we are rendering all HTML
	//redirect is true
	if (redirect) {
		return <Navigate to={"/"} />;
	}

	return (
		<form onSubmit={createNewPosts}>
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
			{/* <ReactQuill
				theme="snow"
				value={content}
				onChange={(newValue) => setContent(newValue)}
				modules={modules}
				formats={formats}
			/> */}
			<Editor onChange={setContent} value={content} />
			<button style={{ marginTop: "15px" }}>Create Post</button>
		</form>
	);
}
