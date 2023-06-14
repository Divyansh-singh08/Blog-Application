import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";
import { Login } from "../utils/APIroutes";
export default function LoginPage() {
	const [username, setUsername] = useState("");
	const [password, SetPassword] = useState("");
	const [redirect, setRedirect] = useState(false);
	const { setUserInfo } = useContext(UserContext);
	async function loginPage(event) {
		event.preventDefault(); //not to reload again and again
		//this time you are asking data info from the server db
		const loginResponse = await fetch(Login, {
			method: "post",
			body: JSON.stringify({ username, password }),
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		});
		//server response in positive ways..
		//mean you loggedIn
		if (loginResponse.ok) {
			loginResponse.json().then((userInfo) => {
				setUserInfo(userInfo);
				setRedirect(true);
			});

			alert(`Login Successful`);
		} else {
			alert(`Login Failed`);
		}
	}

	if (redirect) {
		return <Navigate to={"/"} />;
	}
	return (
		<>
			{/* <div>Login Pages....</div> */}

			<form className="login-page" onSubmit={loginPage}>
				<h1>Login</h1>
				<input
					type="text"
					value={username}
					onChange={(event) => {
						setUsername(event.target.value);
					}}
					placeholder="username"
					required
				/>
				<input
					type="password"
					value={password}
					onChange={(event) => {
						SetPassword(event.target.value);
					}}
					placeholder="password"
					required
				/>
				<button>Login</button>
			</form>
		</>
	);
}
