import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    FileText,
    Folder,
    LockKeyhole
} from "lucide-react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:5000/api/auth/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard");

        } catch (error) {
            setMessage(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="login-brand">
                    <div className="brand-symbol">C</div>
                    <span>Credora</span>
                </div>

                <h1>Welcome back</h1>

                <p className="login-subtitle">
                    Sign in to access your document workspace.
                </p>

                <form onSubmit={handleLogin}>

                    <div className="form-group">
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            required
                        />
                    </div>

                    {message && (
                        <div className="login-error">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-submit"
                    >
                        Sign in
                        <ArrowRight size={17} />
                    </button>

                </form>

                <button
                    className="back-home"
                    onClick={() => navigate("/")}
                >
                    <ArrowLeft size={15} />
                    Back to Credora
                </button>

            </div>

            <div className="login-aside">
                <div className="login-aside-icon"><LockKeyhole size={20} /></div>
                <p className="login-aside-label">CREDORA WORKSPACE</p>
                <h2>Your documents, in order.</h2>
                <p>Keep credentials, records, and folders together in one private workspace.</p>
                <div className="login-file-preview">
                    <div><Folder size={16} /><span>Certificates</span><small>12 files</small></div>
                    <div><FileText size={16} /><span>Academic record.pdf</span><small>PDF</small></div>
                </div>
            </div>

        </div>
    );
}

export default Login;