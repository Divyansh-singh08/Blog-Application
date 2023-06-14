import { useState } from "react";
import { registerPage } from "../utils/APIroutes";

export default function RegisterPage() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	async function register(event) {
		event.preventDefault(); //this will help in not reloading the page and show the changes
		//we want to send some post request
		//here port 3000 client fetching the address from port 4000 that is server side
		//so that data can be store
		const response = await fetch(registerPage, {
			method: "post",
			body: JSON.stringify({ username, password }),
			headers: { "Content-Type": "application/json" },
		});
		// console.log(response);
		if (response.status === 200) {
			alert("Registered done");
		} else {
			alert("Failed to register");
		}
	}
	return (
		<>
			{/* <div>Register Page......</div> */}

			<form className="register-page" onSubmit={register}>
				<h1>Register</h1>
				<input
					type="text"
					value={username}
					onChange={(ev) => {
						setUsername(ev.target.value);
					}}
					placeholder="username"
					required
				/>
				<input
					type="password"
					value={password}
					onChange={(ev) => {
						setPassword(ev.target.value);
					}}
					placeholder="password"
					required
				/>
				<button>Register</button>
			</form>
		</>
	);
}
