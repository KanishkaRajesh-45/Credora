import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Archive, ArrowUpFromLine, CheckCircle2, ChevronRight,
    Download, FileText, Folder, FolderPlus, LayoutGrid, LogOut, Menu,
    Search, ShieldCheck, Star, Trash2, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const starterFolders = [
    { id: "certificates", name: "Certificates", files: [] },
    { id: "projects", name: "Projects", files: [] },
    { id: "resume", name: "Resume", files: [] },
    { id: "ieee", name: "IEEE", files: [] }
];

const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

function Dashboard() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const storageKey = `credora-documents-${user?.id || user?.email || "user"}`;
    const displayName = user?.name || "Workspace owner";
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [folders, setFolders] = useState(() => {
        try { return JSON.parse(localStorage.getItem(storageKey)) || starterFolders; }
        catch { return starterFolders; }
    });
    const [selectedFolder, setSelectedFolder] = useState("certificates");
    const [viewMode, setViewMode] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

    useEffect(() => {
        if (!token) { navigate("/login", { replace: true }); return; }
        const fetchAchievements = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/achievements/my", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAchievements(response.data.achievements || []);
            } catch (error) {
                if (error.response?.status === 401) navigate("/login", { replace: true });
            } finally { setLoading(false); }
        };
        fetchAchievements();
    }, [navigate, token]);

    useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(folders)); }, [folders, storageKey]);

    const currentFolder = folders.find((folder) => folder.id === selectedFolder) || folders[0];
    const allFiles = useMemo(() => folders.flatMap((folder) => folder.files.map((file) => ({ ...file, folderId: folder.id, folderName: folder.name }))), [folders]);
    const visibleFiles = useMemo(() => {
        const source = viewMode === "all"
            ? allFiles
            : viewMode === "starred"
                ? allFiles.filter((file) => file.starred)
                : currentFolder?.files.map((file) => ({ ...file, folderId: currentFolder.id, folderName: currentFolder.name })) || [];
        return source.filter((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allFiles, currentFolder, searchTerm, viewMode]);
    const fileCount = folders.reduce((total, folder) => total + folder.files.length, 0);

    const requireAuth = () => {
        if (!localStorage.getItem("token")) { navigate("/login", { replace: true }); return false; }
        return true;
    };

    const readFile = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const handleFiles = async (fileList) => {
        if (!requireAuth() || !currentFolder) return;
        const newFiles = await Promise.all(Array.from(fileList).map(async (file) => ({
            id: `${Date.now()}-${Math.random()}`, name: file.name, size: file.size,
            type: file.type, dataUrl: await readFile(file), starred: false
        })));
        setFolders((previous) => previous.map((folder) => folder.id === currentFolder.id
            ? { ...folder, files: [...folder.files, ...newFiles] } : folder));
    };

    const createFolder = () => {
        if (!requireAuth()) return;
        const name = window.prompt("Enter a folder name:");
        if (!name?.trim()) return;
        const id = `${Date.now()}`;
        setFolders((previous) => [...previous, { id, name: name.trim(), files: [] }]);
        setSelectedFolder(id);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    };

    const openFile = (file) => {
        if (!requireAuth()) return;
        const fileUrl = file.dataUrl || file.url;
        if (!fileUrl) return;
        window.open(fileUrl, "_blank", "noopener,noreferrer");
    };

    const downloadFile = (file) => {
        if (!requireAuth()) return;
        const fileUrl = file.dataUrl || file.url;
        if (!fileUrl) return;
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
    };

    const toggleStar = (file) => {
        if (!requireAuth()) return;
        setFolders((previous) => previous.map((folder) => folder.id === file.folderId
            ? { ...folder, files: folder.files.map((item) => item.id === file.id ? { ...item, starred: !item.starred } : item) }
            : folder));
    };

    const deleteFile = () => {
        if (!fileToDelete || !requireAuth()) return;
        setFolders((previous) => previous.map((folder) => folder.id === fileToDelete.folderId
            ? { ...folder, files: folder.files.filter((file) => file.id !== fileToDelete.id) }
            : folder));
        setFileToDelete(null);
    };

    const selectView = (mode) => {
        setViewMode(mode);
        setSidebarOpen(false);
    };

    return (
        <div className="dashboard-page">
            <aside className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
                <div className="sidebar-brand"><span className="brand-mark">C</span><strong>Credora</strong><button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
                <div className="workspace-label">Workspace</div>
                <button className={`sidebar-link ${viewMode === "overview" ? "active" : ""}`} onClick={() => selectView("overview")}><LayoutGrid size={18} /> Overview</button>
                <button className={`sidebar-link ${viewMode === "all" ? "active" : ""}`} onClick={() => selectView("all")}><FileText size={18} /> All documents <span>{fileCount}</span></button>
                <button className={`sidebar-link ${viewMode === "starred" ? "active" : ""}`} onClick={() => selectView("starred")}><Star size={18} /> Starred <span>{allFiles.filter((file) => file.starred).length}</span></button>
                <div className="sidebar-section-title">Folders <button onClick={createFolder} aria-label="Create folder"><FolderPlus size={15} /></button></div>
                <div className="sidebar-folders">{folders.map((folder) => <button key={folder.id} className={`sidebar-folder ${selectedFolder === folder.id && viewMode === "overview" ? "active-folder" : ""}`} onClick={() => { setSelectedFolder(folder.id); setViewMode("overview"); setSidebarOpen(false); }}><Folder size={16} /><span>{folder.name}</span><small>{folder.files.length}</small></button>)}</div>
                <div className="sidebar-footer"><div className="security-note"><ShieldCheck size={17} /><span><strong>Private workspace</strong><small>Only you can access these files</small></span></div><button className="sidebar-link logout-link" onClick={handleLogout}><LogOut size={17} /> Sign out</button></div>
            </aside>
            <div className="dashboard-main">
                <header className="dashboard-header"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div className="header-search"><Search size={18} /><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search documents" /></div><div className="header-profile"><div className="avatar">{displayName.charAt(0).toUpperCase()}</div><div><strong>{displayName}</strong><span>{user?.email || "Personal account"}</span></div></div></header>
                <main className="dashboard-content">
                    <section className="dashboard-intro"><div><p className="eyebrow">PERSONAL DOCUMENT HUB</p><h1>Good to see you, {displayName.split(" ")[0]}.</h1><p>Keep your credentials, records, and important files organized in one secure place.</p></div><div className="intro-stat"><Archive size={20} /><span><strong>{fileCount}</strong> documents stored</span></div></section>
                    <section className="dashboard-grid">
                        <div className="documents-panel panel"><div className="panel-heading"><div><h2>{viewMode === "all" ? "All documents" : viewMode === "starred" ? "Starred documents" : "My documents"}</h2><p>{viewMode === "overview" ? currentFolder?.name || "Your workspace" : "Your workspace"} <ChevronRight size={14} /> {visibleFiles.length} files</p></div><button className="outline-button" onClick={createFolder}><FolderPlus size={16} /> New folder</button></div>
                            <div className={`upload-area ${dragOver ? "drag-active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(event) => { event.preventDefault(); setDragOver(false); handleFiles(event.dataTransfer.files); }}><div className="upload-icon"><ArrowUpFromLine size={22} /></div><div><h3>Drop files here to upload</h3><p>Files stay in this browser and you can add as many as you need.</p></div><label className="upload-button">Browse files<input type="file" multiple hidden onChange={(event) => { handleFiles(event.target.files); event.target.value = ""; }} /></label></div>
                            <div className="folder-strip"><div className="subheading"><h3>Folders</h3><span>{folders.length} folders</span></div><div className="folder-grid">{folders.map((folder) => <button key={folder.id} className={`folder-card ${selectedFolder === folder.id ? "selected-folder" : ""}`} onClick={() => setSelectedFolder(folder.id)}><Folder size={22} /><span><strong>{folder.name}</strong><small>{folder.files.length} {folder.files.length === 1 ? "file" : "files"}</small></span></button>)}</div></div>
                            <div className="file-list"><div className="file-list-heading"><h3>{viewMode === "overview" ? currentFolder?.name || "Documents" : viewMode === "starred" ? "Starred" : "All documents"}</h3><span>Most recent first</span></div>{visibleFiles.length === 0 ? <div className="file-empty"><FileText size={28} /><p>{viewMode === "starred" ? "No starred documents yet." : "No documents in this folder yet."}</p></div> : visibleFiles.map((file) => <div className="file-row" key={file.id}><button className="file-open" onClick={() => openFile(file)}><span className="file-type"><FileText size={18} /></span><span className="file-name"><strong>{file.name}</strong><small>{formatSize(file.size)} · {file.type || "Document"}{viewMode !== "overview" ? ` · ${file.folderName}` : ""}</small></span></button><div className="file-actions"><button className="open-file-action" onClick={() => openFile(file)}>Open</button><button title="Download" onClick={() => downloadFile(file)}><Download size={16} /></button><button className={file.starred ? "starred" : ""} title={file.starred ? "Unstar" : "Star"} onClick={() => toggleStar(file)}><Star size={16} /></button><button className="delete-action" title="Delete" onClick={() => setFileToDelete(file)}><Trash2 size={16} /></button></div></div>)}</div>
                        </div>
                        <aside className="side-panels"><div className="panel summary-panel"><div className="panel-heading compact"><div><h2>Workspace health</h2><p>Your documents at a glance</p></div><CheckCircle2 size={22} className="success-icon" /></div><div className="health-number">{fileCount}<span>total files</span></div><div className="health-bar"><span style={{ width: `${Math.min(fileCount * 5, 100)}%` }} /></div><p className="health-caption">Unlimited browser storage for your personal workspace.</p></div><div className="panel achievement-panel"><div className="panel-heading compact"><div><h2>Achievements</h2><p>Credential activity</p></div><span className="count-badge">{achievements.length}</span></div>{loading ? <p className="muted">Loading activity...</p> : achievements.length === 0 ? <p className="muted">No achievements submitted yet.</p> : achievements.slice(0, 3).map((achievement) => <div className="achievement-row" key={achievement._id}><span className="achievement-dot"><CheckCircle2 size={15} /></span><span><strong>{achievement.title}</strong><small>{achievement.status || "Pending review"}</small></span></div>)}</div></aside>
                    </section>
                </main>
            </div>
            {fileToDelete && <div className="delete-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-title"><div className="delete-dialog"><div className="delete-dialog-icon"><Trash2 size={19} /></div><h2 id="delete-title">Delete document?</h2><p>“{fileToDelete.name}” will be removed from your workspace.</p><div className="delete-dialog-actions"><button onClick={() => setFileToDelete(null)}>Cancel</button><button className="confirm-delete" onClick={deleteFile}>Delete</button></div></div></div>}
        </div>
    );
}

export default Dashboard;
