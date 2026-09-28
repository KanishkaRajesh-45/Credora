import { ArrowRight, FileText, Folder, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <header className="home-navbar">
                <button className="home-logo" onClick={() => navigate("/")}>
                    <span className="logo-box">C</span>
                    <span>Credora</span>
                </button>
                <div className="home-actions">
                    <button className="login-link" onClick={() => navigate("/login")}>Login</button>
                    <button className="navbar-cta" onClick={() => navigate("/login")}>Get Started <ArrowRight size={16} /></button>
                </div>
            </header>

            <main className="home-content">
                <section className="home-copy">
                    <p className="home-eyebrow">DOCUMENT WORKSPACE</p>
                    <h1>Credora</h1>
                    <p className="home-tagline">A clear, secure place for your credentials and important documents.</p>
                    <div className="home-buttons">
                        <button className="home-primary" onClick={() => navigate("/login")}>Get Started <ArrowRight size={17} /></button>
                        <button className="home-secondary" onClick={() => navigate("/login")}>Login</button>
                    </div>
                </section>

                <section className="home-preview" aria-label="Credora document workspace preview">
                    <div className="preview-topbar"><span className="preview-brand"><span className="preview-mark">C</span> Credora</span><span className="preview-status"><LockKeyhole size={13} /> Private</span></div>
                    <div className="preview-body">
                        <div className="preview-sidebar"><span className="preview-sidebar-title">WORKSPACE</span><span className="preview-nav-active">Overview</span><span>Documents</span><span>Folders</span></div>
                        <div className="preview-documents">
                            <div className="preview-heading"><span>My documents</span><small>Organized and ready</small></div>
                            <div className="preview-folder"><Folder size={18} /><span>Certificates</span><small>12 files</small></div>
                            <div className="preview-file"><FileText size={17} /><span>Academic record.pdf</span><small>PDF</small></div>
                            <div className="preview-file"><FileText size={17} /><span>Course certificate.pdf</span><small>PDF</small></div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
