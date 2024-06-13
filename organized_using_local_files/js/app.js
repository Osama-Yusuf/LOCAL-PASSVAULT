const { useState, useEffect } = React;

function App() {
    const [isLoggedIn, setLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [passwords, setPasswords] = useState(JSON.parse(localStorage.getItem('passwords')) || []);
    const [newSite, setNewSite] = useState('');
    const [newUser, setNewUser] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newURL, setNewURL] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
    const [showPassword, setShowPassword] = useState({});
    const [editIndex, setEditIndex] = useState(-1);
    const [users, setUsers] = useState(JSON.parse(localStorage.getItem('users')) || {});
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isRegistering, setRegistering] = useState(false);

    const handleRegister = (event) => {
        event.preventDefault();
        if (users[username]) {
            showToast("Username already exists!", "#DC3545");
            return;
        }
        const newUser = { password: password, data: {} }; // Data can hold user specific passwords
        const updatedUsers = { ...users, [username]: newUser };
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        showToast("Registration successful!", "#00b09b");
    };

    const toggleRegister = () => {
        setRegistering(!isRegistering);
        setUsername('');
        setPassword('');
    };

    useEffect(() => {
        localStorage.setItem('isLoggedIn', isLoggedIn);
        const username = localStorage.getItem('userName', username);
        setUserName(username);
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowModal(false);
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isLoggedIn, username]);

    const showToast = (text, colora, colorb) => {
        Toastify({
            text: text,
            duration: 3000,
            newWindow: true,
            gravity: "top",
            position: "right",
            stopOnFocus: true,
            style: { background: "linear-gradient(to right, " + colora + ", " + colorb + ")" },
        }).showToast();
    };

    const handleLogin = (event) => {
        event.preventDefault();
        const user = users[username];
        if (user && user.password === password) {
            setLoggedIn(true);
            setPassword('');
            setUsername('');
            localStorage.setItem('userName', username);
            showToast(`Welcome back ${username}!`, "#00b09b", "#96c93d");
        } else {
            showToast("Incorrect PIN!", "#DC3545", "#DC3547");
            setPassword('');
        }
    };

    const addOrEditPassword = (event) => {
        const user = localStorage.getItem('userName', userName);
        console.log("user", user)
        event.preventDefault();
        const newPasswordData = { site: newSite, user: newUser, password: newPassword, url: newURL };
        const updatedPasswords = [...passwords];
        if (editIndex >= 0) {
            updatedPasswords[editIndex] = newPasswordData;
        } else {
            updatedPasswords.push(newPasswordData);
        }
        localStorage.setItem('passwords', JSON.stringify(updatedPasswords));
        setPassword('');
        setNewSite('');
        setNewUser('');
        setNewPassword('');
        setNewURL('');
        showToast(`${newPasswordData.site} Password saved!`, "#00b09b", "#96c93d");
        setPasswords(updatedPasswords);
        setShowModal(false);
    };

    const editPassword = (index) => {
        setEditIndex(index);
        setNewSite(passwords[index].site);
        setNewUser(passwords[index].user);
        setNewPassword(passwords[index].password);
        setNewURL(passwords[index].url);
        setShowModal(true);
        showToast(`Editing ${passwords[index].site} Password...`, "#00b09b", "#96c93d");
    };

    const togglePasswordVisibility = index => {
        setShowPassword(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const copyToClipboard = text => {
        navigator.clipboard.writeText(text).then(() => {
            showToast("Password copied to clipboard!", "#00b09b", "#96c93d");
        }, () => {
            showToast("Failed to copy!", "#DC3545", "#DC3547");
        });
    };

    const deletePassword = index => {
        const newPasswords = passwords.filter((_, i) => i !== index);
        localStorage.setItem('passwords', JSON.stringify(newPasswords));
        setPasswords(newPasswords);
        showToast(`${passwords[index].site} Password deleted!`, "#00b09b", "#96c93d");
    };
    return (
        <div className="container mx-auto">
            {!isLoggedIn ? (
                <div className="max-w-sm mx-auto mt-20">
                    <div className="w-full h-20 flex justify-center items-center mb-10">
                        <div className="text-5xl">PASS VAULT 🛡️</div>
                    </div>

                    <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                        <h1 className="text-lg font-bold">{isRegistering ? "Register" : "Login"}</h1>
                        <input style={{ color: "black" }} className="border p-2 w-full mt-2 text-black" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        <input style={{ color: "black" }} className="border p-2 w-full mt-2 text-black" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button className="bg-blue-500 text-white p-2 w-full mt-2" type="submit">{isRegistering ? "Register" : "Login"}</button>
                        <button className="text-white underline p-2 w-full mt-2" type="button" onClick={toggleRegister}>
                            {isRegistering ? "Already have an account? Login" : "New around here? Create account"}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="mx-auto">
                    <div className="flex justify-between items-center p-1 mt-2">
                        <h1 className="text-lg font-bold">Hello, {userName || "User"}!</h1>
                        <button className="text-white underline" onClick={() => setLoggedIn(false)}>Logout</button>
                    </div>

                    <div className="w-full h-20 flex justify-center items-center mt-20">
                        <div className="text-5xl">PASS VAULT 🛡️</div>
                        <div className="p-1 text-lg" id="addPassword" onClick={() => setShowModal(true)}>Add Password</div>
                    </div>

                    <div className="w-full text-center text-teal-500">Click on a link to go to website or on a password to copy it to clipboard!</div>
                    <table id="passwordTable">
                        <thead>
                            <tr>
                                <th>Website Name</th>
                                <th>Website Link</th>
                                <th>Username</th>
                                <th>Password</th>
                            </tr>
                        </thead>
                        <tbody id="passwordTableBody">
                            {passwords.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.site}</td>
                                    <td><a href={`https://${entry.url}`} target="_blank" className="underline">{entry.url}</a></td>
                                    <td>{entry.user}</td>
                                    <td>
                                        <span onClick={() => copyToClipboard(entry.password)} className="cursor-pointer">
                                            {showPassword[index] ? entry.password : '••••••'}
                                        </span>
                                        <i className={`fas ${showPassword[index] ? "fa-eye-slash" : "fa-eye"} cursor-pointer ml-2`} onClick={() => togglePasswordVisibility(index)}></i>                                            </td>
                                    <td><i className="fas fa-edit text-green-500 cursor-pointer" onClick={() => editPassword(index)}></i></td>
                                    <td><i className="fas fa-trash text-red-500 cursor-pointer" onClick={() => deletePassword(index)}></i></td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            )}
            {showModal && (
                <div className="modal show">
                    <div className="modal-content">
                        <form onSubmit={addOrEditPassword}>
                            <input className="rounded-lg p-2 w-full mt-2 shadow-lg shadow-indigo-500/50 shadow-md" placeholder="Site Name" value={newSite} onChange={(e) => setNewSite(e.target.value)} />
                            <input className="rounded-lg p-2 w-full mt-2 shadow-lg shadow-indigo-500/50 shadow-md" placeholder="Username" value={newUser} onChange={(e) => setNewUser(e.target.value)} />
                            <div className="flex items-center align-middle justify-center">
                                <input
                                    className="rounded-lg p-2 w-full mt-2 shadow-lg shadow-indigo-500/50 shadow-md"
                                    type={showPassword ? "password" : "text"}
                                    placeholder="Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <i
                                    className={`fas ${showPassword ? "fa-eye" : "fa-eye-slash"} cursor-pointer ml-2`}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            </div>
                            <input className="rounded-lg p-2 w-full mt-2 shadow-lg shadow-indigo-500/50 shadow-md" placeholder="Site URL" value={newURL} onChange={(e) => setNewURL(e.target.value)} />
                            <button className="rounded-lg bg-green-500 text-white p-2 w-full mt-2 shadow-md" type="submit">Save</button>
                            <button className="rounded-lg bg-red-500 text-white p-2 w-full mt-2 shadow-md" type="button" onClick={() => { setShowModal(false); setNewSite(''); setNewUser(''); setNewPassword(''); setNewURL(''); }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('app'));
