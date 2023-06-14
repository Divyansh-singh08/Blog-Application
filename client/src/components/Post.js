import { format } from "date-fns";
import { Link } from "react-router-dom";

export default function Post({
	_id,
	title,
	summary,
	cover,
	content,
	createdAt,
	author,
}) {
	return (
		<div className="post">
			<div className="post-img">
				<Link to={`/create-new-post/${_id}`}>
					<img
						// src="https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=464&q=80"
						src={"http://localhost:4080/" + cover}
						alt="Post-img"
					/>
				</Link>
			</div>

			<div className="texts">
				{/* <h2>B-B-E Jaguar Sports extended coverage</h2> */}
				<Link to={`/create-new-post/${_id}`}>
					<h2>{title}</h2>
				</Link>
				{/* <h2>{title}</h2> */}

				{/* <p className="post-text-info">
					<a to="" className="post-author">
						{author.username}
					</a>
					<time>{format(new Date(createdAt), "MMM d, yyyy HH:mm:ss")}</time>
				</p> */}

				<p className="post-text-info">
					{author && author.username && (
						<a href="" className="post-author">
							{author.username}
						</a>
					)}
					<time>{format(new Date(createdAt), "MMM d, yyyy HH:mm:ss")}</time>
				</p>
				<p className="post-summary">
					{summary}
					{/* extended sports coverage for the B-B-E community brought to you by the
					Bonanza Valley Voice newspaper in Brooten, MN. (Address: P.O. Box 250,
					Brooten){" "}
					<span>
						<a href="http://www.bonanzavalleyvoice.com.">
							http://www.bonanzavalleyvoice.com.
						</a>
					</span>{" "}
					ALL VIEWS posted are strictly and without exception the opinions of
					the newspaper owner and no one else; they're written in first hand
					format. Please submit feedback in writing to the address posted above.
					**This is Minnesota's oldest varsity high school sports blog. We hope
					to keep it going into the future! */}
				</p>
			</div>
		</div>
	);
}
