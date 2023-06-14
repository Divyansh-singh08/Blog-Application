import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";
import { profileFetch, logoutFetch } from "../utils/APIroutes";
export default function Header() {
	//useState is not using bcz loggedIn user information did not store in HeaderComponents
	//bcz it  wo'nt update the profile page after loggedIn
	// const [username, setUsername] = useState(null);
	const { setUserInfo, userInfo } = useContext(UserContext);
	useEffect(() => {
		fetch(profileFetch, {
			credentials: "include",
		})
			.then((response) => {
				response.json().then((userInfo) => {
					// setUsername(userInfo.username);
					setUserInfo(userInfo);
				});
			})
			.catch((error) => {
				console.log(`Error fetching user Profile ${error}`);
			});
	}, []);

	//logout function will make logout from the blog
	//this will fetch the cookie info from backed and make cookie empty
	// function logout() {
	// 	//with this function we have to invalidate cookies
	// 	//let do it with backend
	// 	fetch("http://localhost:4080/logout", {
	// 		credentials: "include",
	// 		method: "post",

	// 	});
	// }

	function logout() {
		// Send a request to the server to invalidate the session and clear cookies
		fetch(logoutFetch, {
			method: "post",
			credentials: "include",
		})
			.then((response) => {
				// Handle the response from the server
				if (response.ok) {
					// Redirect or perform any necessary action after successful logout
					window.location.to = "/login"; // Redirect to the login page
				} else {
					console.error("Logout request failed");
				}
			})
			.catch((error) => {
				console.error("Logout request failed", error);
			});
		// setUsername(null);
		setUserInfo(null);
	}

	const username = userInfo?.username;

	return (
		<header>
			<Link to="/" className="logo">
				MyBlog
			</Link>
			<nav>
				{username ? (
					<>
						<span>Hello, {username}</span>
						<Link to="/create"> Write It </Link>
						<a onClick={logout}>Logout</a>
					</>
				) : (
					<>
						<Link to="/login">Sing In</Link>
						<Link to="/register">Sign Up</Link>
					</>
				)}
			</nav>
		</header>
	);
}
