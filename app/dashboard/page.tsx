'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toast, useToast, LoadingSpinner } from '../components/Toast';

// ── Interfaces ───────────────────────────────────────────────────────────────
interface User {
  id: string;
  nama: string;
  email: string;
  rumpun: string;
  bio: string;
  skills: string[];
  projectIds: string[];
}

interface Project {
  id: string;
  judul: string;
  deskripsi: string;
  owner_id: string;
  owner_nama: string;
  bidang: string;
  kategori: string;
  rumpun: string;
  status: string;
  skills_needed: string[];
  member_count: number;
  applicant_count: number;
  created_at: string;
}

interface Contact {
  id: string | number;
  icon: string;
  label: string;
  value: string;
}

const PRESET_SKILLS = ["JavaScript", "Go", "Rust", "Flutter", "Swift", "PostgreSQL", "Docker", "Kubernetes", "Machine Learning", "UI/UX", "Tailwind", "GraphQL"];

// ── Helpers ──────────────────────────────────────────────────────────────────
const Avatar = ({ name, size = 36, color = "#1967d2" }: { name: string; size?: number; color?: string }) => {
  const initials = name
    .split(" ")
    .map(w => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color + "18",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.36,
      fontWeight: 600,
      color,
      flexShrink: 0,
      border: `1px solid ${color}20`
    }}>
      {initials || "?"}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "#e6f4ea", color: "#137333" },
    open: { bg: "#e6f4ea", color: "#137333" },
    Draft: { bg: "#fef7e0", color: "#b06000" },
    Closed: { bg: "#fce8e6", color: "#a50e0e" }
  };
  const s = map[status] || { bg: "#fef7e0", color: "#b06000" };
  const displayText = status === 'Closed' ? 'Closed (Selesai)' : 'Active';
  return (
    <span style={{
      background: s.bg,
      color: s.color,
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 100,
      textTransform: "capitalize"
    }}>
      {displayText}
    </span>
  );
};

const Tag = ({ label }: { label: string }) => (
  <span style={{ background: "#e8f0fe", color: "#1967d2", fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 100 }}>
    {label}
  </span>
);

const getProjectColor = (name: string) => {
  const colors = ["#1967d2", "#137333", "#b06000", "#a50e0e", "#7627bb", "#0d652d"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function DashboardPage() {
  const router = useRouter();
  const { toast, showToast, hideToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"dashboard" | "find" | "create" | "edit">("dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Dynamic time-based greeting state
  const [greeting, setGreeting] = useState("Selamat datang kembali");

  // Profile contacts & skills state
  const [bioText, setBioText] = useState("Full Stack Developer");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editVal, setEditVal] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ icon: "📎", label: "", value: "" });

  // Cari Project filters
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [joiningMap, setJoiningMap] = useState<Record<string, boolean>>({});

  // Buat Project state
  const [creating, setCreating] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [projForm, setProjForm] = useState({ title: "", desc: "", skills: [] as string[], slots: 2, rumpun: "", category: "" });
  const [skillInput, setSkillInput] = useState("");
  const [createDone, setCreateDone] = useState(false);

  // Edit Project state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editStep, setEditStep] = useState(1);
  const [editForm, setEditForm] = useState({ id: "", title: "", desc: "", skills: [] as string[], slots: 2, rumpun: "", category: "", status: "open" });
  const [editSkillInput, setEditSkillInput] = useState("");
  const [updating, setUpdating] = useState(false);

  // Load Google Font: Neuton dynamically
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Neuton:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Time greeting initializer
  useEffect(() => {
    const hr = new Date().getHours();
    if (hr >= 5 && hr < 11) {
      setGreeting("Selamat pagi");
    } else if (hr >= 11 && hr < 15) {
      setGreeting("Selamat siang");
    } else if (hr >= 15 && hr < 18) {
      setGreeting("Selamat sore");
    } else {
      setGreeting("Selamat malam");
    }
  }, []);

  // Fetch real User and Projects
  const fetchAllData = async () => {
    try {
      const [meRes, projRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/projects'),
      ]);
      if (meRes.ok) {
        const d = await meRes.json();
        if (d.user) {
          setUser(d.user);
          setSkills(d.user.skills || []);
          
          // Parse bio & contacts
          let bioDesc = "Full Stack Developer";
          let parsedContacts: Contact[] = [];
          
          try {
            if (d.user.bio && d.user.bio.startsWith('{')) {
              const parsed = JSON.parse(d.user.bio);
              bioDesc = parsed.bio || "";
              parsedContacts = parsed.contacts || [];
            } else {
              bioDesc = d.user.bio || "Full Stack Developer";
            }
          } catch {
            bioDesc = d.user.bio || "Full Stack Developer";
          }

          setBioText(bioDesc);
          
          if (parsedContacts.length === 0) {
            parsedContacts = [
              { id: 1, icon: "💬", label: "WhatsApp", value: "+62 812-3456-7890" },
              { id: 2, icon: "📞", label: "Telepon", value: "+62 812-3456-7890" },
              { id: 3, icon: "✉️", label: "Email", value: d.user.email || "john@wecollab.dev" },
            ];
          }
          setContacts(parsedContacts);
        }
      }
      if (projRes.ok) {
        const d = await projRes.json();
        if (d.projects) setProjects(d.projects);
      }
    } catch {
      showToast('Gagal memuat data dari database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'DELETE' });
    router.push('/login');
  };

  // Sync profile details to Redis
  const syncProfile = async (updatedSkills: string[], updatedContacts: Contact[], updatedBio: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: user.nama,
          rumpun: user.rumpun,
          skills: updatedSkills,
          bio: JSON.stringify({ bio: updatedBio, contacts: updatedContacts }),
        }),
      });
      if (!res.ok) {
        showToast('Gagal menyimpan perubahan ke server', 'error');
      }
    } catch {
      showToast('Koneksi internet bermasalah', 'error');
    }
  };

  const handleAddSkill = (s: string) => {
    const trimmed = s.trim();
    if (!trimmed || skills.length >= 10) return;
    if (!skills.some(x => x.toLowerCase() === trimmed.toLowerCase())) {
      const nextSkills = [...skills, trimmed];
      setSkills(nextSkills);
      syncProfile(nextSkills, contacts, bioText);
      showToast('Skill berhasil ditambahkan', 'success');
    }
    setNewSkill("");
  };

  const handleRemoveSkill = (s: string) => {
    const nextSkills = skills.filter(x => x !== s);
    setSkills(nextSkills);
    syncProfile(nextSkills, contacts, bioText);
    showToast('Skill dihapus', 'success');
  };

  const handleUpdateContact = (id: string | number, nextVal: string) => {
    const nextContacts = contacts.map(c => c.id === id ? { ...c, value: nextVal } : c);
    setContacts(nextContacts);
    syncProfile(skills, nextContacts, bioText);
    setEditingId(null);
    showToast('Kontak diperbarui', 'success');
  };

  const handleAddContact = () => {
    if (newContact.label && newContact.value) {
      const nextContacts = [...contacts, { id: Date.now(), ...newContact }];
      setContacts(nextContacts);
      syncProfile(skills, nextContacts, bioText);
      setNewContact({ icon: "📎", label: "", value: "" });
      setShowAddContact(false);
      showToast('Kontak ditambahkan', 'success');
    }
  };

  // Join Project
  const handleJoinProject = async (projId: string) => {
    setJoiningMap(prev => ({ ...prev, [projId]: true }));
    try {
      const res = await fetch(`/api/projects/${projId}/join`, { method: 'POST' });
      const d = await res.json();
      if (res.ok) {
        showToast('Berhasil bergabung dengan project! 🎉', 'success');
        await fetchAllData();
      } else {
        showToast(d.error || 'Gagal bergabung dengan project', 'error');
      }
    } catch {
      showToast('Kesalahan koneksi', 'error');
    } finally {
      setJoiningMap(prev => ({ ...prev, [projId]: false }));
    }
  };

  // Create Project
  const handleCreateProjectSubmit = async () => {
    if (!projForm.title || !projForm.desc || !projForm.category) {
      showToast('Nama, kategori, dan deskripsi wajib diisi', 'error');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: projForm.title,
          deskripsi: projForm.desc,
          bidang: projForm.category,
          kategori: projForm.category,
          rumpun: projForm.rumpun,
          skills_needed: projForm.skills,
          cari_langsung: false
        })
      });
      if (res.ok) {
        setCreateDone(true);
        showToast('Project berhasil dipublikasikan! 🚀', 'success');
        await fetchAllData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Gagal mempublikasikan project', 'error');
      }
    } catch {
      showToast('Koneksi server gagal', 'error');
    } finally {
      setCreating(false);
    }
  };

  // Start Edit Project Flow
  const handleStartEdit = (p: Project) => {
    setEditingProject(p);
    setEditStep(1);
    setEditForm({
      id: p.id,
      title: p.judul,
      desc: p.deskripsi,
      skills: p.skills_needed || [],
      slots: p.applicant_count || 2,
      rumpun: p.rumpun || "",
      category: p.kategori || p.bidang || "",
      status: p.status || "open"
    });
    setTab("edit");
  };

  // Update Project details
  const handleUpdateProjectSubmit = async () => {
    if (!editForm.title || !editForm.desc || !editForm.category) {
      showToast('Nama, kategori, dan deskripsi wajib diisi', 'error');
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch(`/api/projects/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: editForm.title,
          deskripsi: editForm.desc,
          bidang: editForm.category,
          kategori: editForm.category,
          rumpun: editForm.rumpun,
          skills_needed: editForm.skills,
          status: editForm.status
        })
      });
      if (res.ok) {
        showToast('Project berhasil diperbarui! 🎉', 'success');
        setEditingProject(null);
        setTab("dashboard");
        await fetchAllData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Gagal memperbarui project', 'error');
      }
    } catch {
      showToast('Koneksi server gagal', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus project ini secara permanen?')) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/projects/${editForm.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('Project berhasil dihapus', 'success');
        setEditingProject(null);
        setTab("dashboard");
        await fetchAllData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Gagal menghapus project', 'error');
      }
    } catch {
      showToast('Koneksi server gagal', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Toggle Pendaftaran (Tutup Project / Buka Project)
  const handleToggleProjectStatus = async () => {
    const nextStatus = editForm.status === 'Closed' ? 'open' : 'Closed';
    const msg = nextStatus === 'Closed'
      ? 'Apakah Anda yakin ingin menutup pendaftaran project ini (Selesai mencari kolaborator)?'
      : 'Apakah Anda yakin ingin membuka kembali pendaftaran project ini?';
    if (!window.confirm(msg)) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/projects/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus
        })
      });
      if (res.ok) {
        setEditForm(prev => ({ ...prev, status: nextStatus }));
        showToast(nextStatus === 'Closed' ? 'Pendaftaran project ditutup' : 'Pendaftaran dibuka kembali', 'success');
        await fetchAllData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Gagal memperbarui status', 'error');
      }
    } catch {
      showToast('Koneksi server gagal', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Projects categorization
  const myOwnedProjects = projects.filter(p => p.owner_id === user?.id);
  const myJoinedProjects = projects.filter(p => user?.projectIds?.includes(p.id) && p.owner_id !== user?.id);

  // Search filter
  const filteredBrowseProjects = projects.filter(p =>
    p.judul.toLowerCase().includes(search.toLowerCase()) ||
    p.skills_needed.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const userInitials = user ? user.nama.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() : "JD";

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#FFF7EE' }}>
        <LoadingSpinner size={48} />
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      background: "#FFF7EE",
      minHeight: "100vh",
      color: "#202124",
      position: "relative",
      overflowX: "hidden"
    }}>
      
      {/* ── Dynamic Decorative concentric circles (di belakang navbar dan semua elemen) ── */}
      
      {/* 1. Dashboard & Edit: bottom-right, smallest circle deleted */}
      {(tab === "dashboard" || tab === "edit") && (
        <div style={{
          position: "fixed",
          right: -60,
          bottom: -60,
          width: 380,
          height: 380,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.12
        }}>
          <svg
            viewBox="0 0 320 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%" }}
          >
            <circle cx="320" cy="320" r="280" stroke="#1a1a1a" strokeWidth="0.8" />
            <circle cx="320" cy="320" r="220" stroke="#1a1a1a" strokeWidth="0.8" />
            <circle cx="320" cy="320" r="160" stroke="#1a1a1a" strokeWidth="0.8" />
          </svg>
        </div>
      )}
  
      {/* ── Dashboard Art Image (dashboard_1.png) on the bottom-left, scrolling with page ── */}
      {tab === "dashboard" && (
        <img
          src="/images/dashboard_1.png"
          alt="Dashboard Art"
          style={{
            position: "absolute",
            left: 5,
            bottom: 0,
            height: 750,
            objectFit: "contain",
            zIndex: 0,
            pointerEvents: "none"
          }}
        />
      )}

      {/* 2. Cari Project: top-left, behind navbar & elements, smallest circle deleted */}
      {tab === "find" && (
        <div style={{
          position: "fixed",
          left: -60,
          top: -60,
          width: 380,
          height: 380,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.12
        }}>
          <svg
            viewBox="0 0 320 320"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%" }}
          >
            <circle cx="0" cy="0" r="280" stroke="#1a1a1a" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="220" stroke="#1a1a1a" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="160" stroke="#1a1a1a" strokeWidth="0.8" />
          </svg>
        </div>
      )}

      {/* ── Cari Project Art Image (cari_1.png) on the bottom-right, scrolling with page ── */}
      {tab === "find" && (
        <img
          src="/images/cari_1.png"
          alt="Cari Project Art"
          style={{
            position: "absolute",
            right: 40,
            bottom: 40,
            width: 500,
            objectFit: "contain",
            zIndex: 0,
            pointerEvents: "none"
          }}
        />
      )}

      {/* 3. Buat Project: Larger bottom-center arches rising from the bottom, right-center circles deleted */}
      {tab === "create" && (
        <div style={{
          position: "fixed",
          bottom: -320,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1200,
          height: 600,
          zIndex: 0,
          pointerEvents: "none",
          opacity: 0.12
        }}>
          <svg
            viewBox="0 0 1200 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ width: "100%", height: "100%" }}
          >
            <circle cx="600" cy="600" r="580" stroke="#1a1a1a" strokeWidth="1.8" />
            <circle cx="600" cy="600" r="480" stroke="#1a1a1a" strokeWidth="1.8" />
            <circle cx="600" cy="600" r="380" stroke="#1a1a1a" strokeWidth="1.8" />
            <circle cx="600" cy="600" r="280" stroke="#1a1a1a" strokeWidth="1.8" />
          </svg>
        </div>
      )}
      
      {/* ── Top Navigation ── */}
      <header style={{
        background: "#1a1a1a",
        borderBottom: "none",
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        {/* Logo and WeCollab text on the far left (di kiri saja seperti semula) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, position: "absolute", left: 24, top: 0, bottom: 0 }}>
          <img src="/images/Logo.png" alt="WC Logo" style={{ height: 32, objectFit: "contain" }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span style={{
            fontFamily: "'Neuton', Georgia, serif",
            fontWeight: 400,
            fontSize: 22,
            color: "#ffffff",
            letterSpacing: "-0.3px"
          }}>
            WeCollab
          </span>
        </div>

        {/* Centered navigation container (tabs sejajar dengan grid dashboard) */}
        <div style={{
          width: "100%",
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          height: "100%"
        }}>
          <nav style={{ display: "flex", alignItems: "center", height: "100%", gap: 8 }}>
            {[
              { key: "dashboard", label: "Dashboard" },
              { key: "find", label: "Cari Project" },
              { key: "create", label: "Buat Project" },
            ].map(t => {
              const isActive = tab === t.key || (t.key === "dashboard" && tab === "edit");
              return (
                <button key={t.key} onClick={() => { setTab(t.key as any); setSelectedProject(null); setEditingProject(null); }}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 8,
                    background: isActive ? "#ffffff" : "transparent",
                    border: "none",
                    color: isActive ? "#1a1a1a" : "rgba(255, 255, 255, 0.8)",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 34
                  }}>
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: user initials avatar dropdown on the far right (di kanan saja seperti semula) */}
        <div style={{ position: "absolute", right: 24, top: 0, bottom: 0, display: "flex", alignItems: "center" }} ref={dropdownRef}>
          <div style={{ position: "relative" }}>
            <div onClick={() => setDropdownOpen(!dropdownOpen)} style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              color: "#1967d2",
              cursor: "pointer",
              border: "1px solid rgba(255, 255, 255, 0.4)"
            }}>
              {userInitials}
            </div>

            {/* Dropdown Options */}
            {dropdownOpen && (
              <div style={{
                position: "absolute",
                top: calcDropdownTop(),
                right: 0,
                background: "#FFF7EE",
                border: "1px solid #e8eaed",
                borderRadius: 8,
                minWidth: 160,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}>
                <button onClick={() => { setTab("dashboard"); setEditingProject(null); setDropdownOpen(false); }} style={dropdownItemStyle}>
                  Dashboard
                </button>
                <button onClick={handleLogout} style={{ ...dropdownItemStyle, color: "#c0392b", borderBottom: "none" }}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Main Content Area (Z-Index 1 to overlap background circles) */}
      <main style={{ position: "relative", zIndex: 1 }}>
        {/* ── Dashboard Tab ── */}
        {tab === "dashboard" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: 28 }}>
            
            {/* Hero Greeting */}
            <div style={{
              background: "linear-gradient(135deg,#e8f0fe 0%,#f0faf5 100%)",
              border: "1px solid rgba(25, 103, 210, 0.15)",
              borderRadius: 16,
              padding: "28px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div>
                <p style={{ fontSize: 13, color: "#5f6368", margin: "0 0 4px", fontWeight: 500 }}>{greeting}</p>
                <h1 style={{ fontSize: 26, fontWeight: 600, color: "#202124", margin: "0 0 6px", letterSpacing: "-0.5px" }}>
                  {user?.nama}
                </h1>
                <p style={{ fontSize: 14, color: "#5f6368", margin: 0 }}>
                  {bioText} {user?.rumpun ? `· ${user.rumpun}` : ""}
                </p>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { n: myOwnedProjects.length, label: "Project saya" },
                  { n: myJoinedProjects.length, label: "Diikuti" },
                  { n: skills.length, label: "Skills" }
                ].map(s => (
                  <div key={s.label} style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e8eaed",
                    padding: "14px 20px",
                    textAlign: "center",
                    minWidth: 80,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                  }}>
                    <div style={{ fontSize: 26, fontWeight: 700, color: "#1967d2", lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: 11, color: "#80868b", marginTop: 4, textTransform: "uppercase", fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main 2-column Layout Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
              
              {/* Left: Projects list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                
                {/* My Projects */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8eaed", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fcfbfa" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: "#202124", margin: 0 }}>Project Saya</h2>
                    <span style={{ fontSize: 12, color: "#80868b", fontWeight: 400 }}>Klik untuk mengedit</span>
                  </div>
                  <div>
                    {myOwnedProjects.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center", color: "#80868b", fontSize: 13 }}>
                        Anda belum membuat project apa pun.
                      </div>
                    ) : (
                      myOwnedProjects.map((p, i) => {
                        const color = getProjectColor(p.judul);
                        return (
                          <div key={p.id} onClick={() => handleStartEdit(p)} style={{
                            padding: "14px 20px",
                            borderBottom: i < myOwnedProjects.length - 1 ? "1px solid #f1f3f4" : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            cursor: "pointer",
                            transition: "background 0.15s"
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fcfaf7")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                          >
                            <Avatar name={p.judul} color={color} size={38} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, color: "#202124", display: "flex", alignItems: "center", gap: 8 }}>
                                {p.judul}
                                <span style={{ fontSize: 11, color: "#1967d2", fontWeight: 400 }}>✏️ Edit</span>
                              </div>
                              <div style={{ fontSize: 12, color: "#80868b", marginTop: 2 }}>Owner · {p.member_count} anggota</div>
                            </div>
                            <StatusBadge status={p.status} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Joined Projects */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #e8eaed", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fcfbfa" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 600, color: "#202124", margin: 0 }}>Project Diikuti</h2>
                    <span onClick={() => setTab("find")} style={{ fontSize: 12, color: "#1967d2", cursor: "pointer", fontWeight: 500 }}>Lihat semua</span>
                  </div>
                  <div>
                    {myJoinedProjects.length === 0 ? (
                      <div style={{ padding: "30px", textAlign: "center", color: "#80868b", fontSize: 13 }}>
                        Anda belum bergabung di project kolaborasi.
                      </div>
                    ) : (
                      myJoinedProjects.map((p, i) => {
                        const color = getProjectColor(p.judul);
                        return (
                          <div key={p.id} style={{
                            padding: "14px 20px",
                            borderBottom: i < myJoinedProjects.length - 1 ? "1px solid #f1f3f4" : "none",
                            display: "flex",
                            alignItems: "center",
                            gap: 12
                          }}>
                            <Avatar name={p.judul} color={color} size={38} />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, color: "#202124" }}>{p.judul}</div>
                              <div style={{ fontSize: 12, color: "#80868b", marginTop: 2 }}>Member · {p.member_count} anggota</div>
                            </div>
                            <StatusBadge status={p.status} />
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Skills section */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: "#202124", margin: "0 0 14px" }}>Skills Saya</h2>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                    {skills.map(s => (
                      <span key={s} style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: "#e8f0fe",
                        color: "#1967d2",
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "5px 10px",
                        borderRadius: 100,
                        border: "1px solid rgba(25, 103, 210, 0.15)"
                      }}>
                        {s}
                        <button onClick={() => handleRemoveSkill(s)} style={{
                          background: "none",
                          border: "none",
                          color: "#1967d2",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: 0,
                          lineHeight: 1,
                          opacity: 0.6
                        }}>×</button>
                      </span>
                    ))}
                    {PRESET_SKILLS.filter(s => !skills.includes(s)).slice(0, 5).map(s => (
                      <button key={s} onClick={() => handleAddSkill(s)} style={{
                        background: "#f1f3f4",
                        border: "1px dashed #dadce0",
                        color: "#5f6368",
                        fontSize: 12,
                        padding: "5px 10px",
                        borderRadius: 100,
                        cursor: "pointer",
                        fontFamily: "inherit"
                      }}>
                        + {s}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleAddSkill(newSkill); }}
                      placeholder="Tambah skill..."
                      style={{
                        flex: 1,
                        border: "1px solid #dadce0",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 13,
                        fontFamily: "inherit",
                        outline: "none",
                        color: "#202124"
                      }} />
                    <button onClick={() => handleAddSkill(newSkill)} style={{
                      background: "#1967d2",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "8px 16px",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "inherit"
                    }}>
                      Tambah
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Side: Profile Contact details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  
                  {/* Profile header initials-based background */}
                  <div style={{ background: "#1967d2", padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                      border: "2px solid rgba(255,255,255,0.4)"
                    }}>
                      {userInitials}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: 16 }}>{user?.nama}</div>
                      <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 }}>{bioText}</div>
                    </div>
                  </div>

                  {/* Contacts editing list */}
                  <div style={{ padding: "16px 0" }}>
                    <div style={{ padding: "0 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#5f6368", textTransform: "uppercase", letterSpacing: "0.05em" }}>Kontak</span>
                      <button onClick={() => setShowAddContact(!showAddContact)} style={{
                        background: "none",
                        border: "1px solid #dadce0",
                        borderRadius: 6,
                        padding: "4px 10px",
                        fontSize: 12,
                        color: "#1967d2",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontWeight: 500
                      }}>
                        + Tambah
                      </button>
                    </div>

                    {contacts.map(c => (
                      <div key={c.id} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{c.icon}</span>
                        {editingId === c.id ? (
                          <div style={{ flex: 1, display: "flex", gap: 6 }}>
                            <input value={editVal} onChange={e => setEditVal(e.target.value)}
                              onKeyDown={e => { if (e.key === "Enter") handleUpdateContact(c.id, editVal); }}
                              style={{ flex: 1, border: "1px solid #1967d2", borderRadius: 6, padding: "5px 8px", fontSize: 12, fontFamily: "inherit", outline: "none" }} />
                            <button onClick={() => handleUpdateContact(c.id, editVal)} style={{
                              background: "#1967d2",
                              color: "#fff",
                              border: "none",
                              borderRadius: 6,
                              padding: "5px 10px",
                              fontSize: 12,
                              cursor: "pointer",
                              fontFamily: "inherit"
                            }}>
                              OK
                            </button>
                          </div>
                        ) : (
                          <>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 9, color: "#80868b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{c.label}</div>
                              <div style={{ fontSize: 13, color: "#202124", marginTop: 1, wordBreak: "break-all" }}>{c.value}</div>
                            </div>
                            <button onClick={() => { setEditingId(c.id); setEditVal(c.value); }} style={{ background: "none", border: "none", color: "#80868b", cursor: "pointer", fontSize: 13, padding: 4 }}>✏️</button>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Add contact form */}
                    {showAddContact && (
                      <div style={{ margin: "8px 16px", padding: 12, background: "#f8f9fa", borderRadius: 8, display: "flex", flexDirection: "column", gap: 8, border: "1px solid #dadce0" }}>
                        <input value={newContact.icon} onChange={e => setNewContact({ ...newContact, icon: e.target.value })} placeholder="Ikon (emoji)" style={contactInputStyle} />
                        <input value={newContact.label} onChange={e => setNewContact({ ...newContact, label: e.target.value })} placeholder="Label (misal: WhatsApp)" style={contactInputStyle} />
                        <input value={newContact.value} onChange={e => setNewContact({ ...newContact, value: e.target.value })} placeholder="Nilai (misal: +62 ...)" style={contactInputStyle} />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={handleAddContact} style={{ flex: 1, background: "#1967d2", color: "#fff", border: "none", borderRadius: 6, padding: "8px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>Simpan</button>
                          <button onClick={() => setShowAddContact(false)} style={{ flex: 1, background: "#fff", color: "#5f6368", border: "1px solid #dadce0", borderRadius: 6, padding: "8px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Batal</button>
                        </div>
                      </div>
                    )}

                    {/* Edit bio inline */}
                    <div style={{ borderTop: "1px solid #e8eaed", marginTop: "16px", padding: "16px 16px 0" }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#5f6368", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>Bio Ringkas</div>
                      <textarea value={bioText} onChange={e => setBioText(e.target.value)}
                        onBlur={() => syncProfile(skills, contacts, bioText)}
                        placeholder="Ubah bio anda..."
                        style={{
                          width: "100%",
                          border: "1px solid #dadce0",
                          borderRadius: 6,
                          padding: "8px",
                          fontSize: 13,
                          fontFamily: "inherit",
                          resize: "vertical",
                          outline: "none",
                          color: "#202124"
                        }}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                {/* Activity Card */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#5f6368", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>Aktivitas</div>
                  {[
                    { label: "Project aktif", val: myOwnedProjects.length, color: "#137333" },
                    { label: "Project diikuti", val: myJoinedProjects.length, color: "#1967d2" },
                    { label: "Total kolaborasi", val: myOwnedProjects.length + myJoinedProjects.length, color: "#7627bb" }
                  ].map(s => (
                    <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f1f3f4" }}>
                      <span style={{ fontSize: 13, color: "#5f6368" }}>{s.label}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* ── Find Project Tab ── */}
        {tab === "find" && (
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
            
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: "#202124", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Cari Project</h1>
              <p style={{ fontSize: 14, color: "#5f6368", margin: "0 0 20px" }}>Temukan project yang sesuai dengan skill dan minat kamu.</p>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 0,
                background: "#fff",
                border: "1px solid #dadce0",
                borderRadius: 24,
                padding: "0 16px",
                maxWidth: 520,
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
              }}>
                <span style={{ color: "#80868b", fontSize: 18 }}>🔍</span>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Cari judul atau skill..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    padding: "12px 10px",
                    fontSize: 14,
                    fontFamily: "inherit",
                    background: "transparent",
                    color: "#202124"
                  }} />
                {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#80868b", cursor: "pointer", fontSize: 16 }}>×</button>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: selectedProject ? "1fr 380px" : "1fr", gap: 20 }}>
              {/* Grid list of cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, alignContent: "start" }}>
                {filteredBrowseProjects.map(p => {
                  const color = getProjectColor(p.judul);
                  const hasJoined = user?.projectIds?.includes(p.id) || p.owner_id === user?.id;
                  return (
                    <div key={p.id} onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}
                      style={{
                        background: "#fff",
                        borderRadius: 12,
                        border: selectedProject?.id === p.id ? "1.5px solid #1967d2" : "1px solid #e8eaed",
                        padding: 20,
                        cursor: "pointer",
                        transition: "box-shadow 0.15s,border 0.15s",
                        boxShadow: selectedProject?.id === p.id ? "0 4px 12px rgba(25, 103, 210, 0.08)" : "0 1px 3px rgba(0,0,0,0.05)"
                      }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 10 }}>
                        <Avatar name={p.judul} color={color} size={36} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#202124", lineHeight: 1.3 }}>{p.judul}</div>
                          <div style={{ fontSize: 12, color: "#80868b", marginTop: 2 }}>oleh {p.owner_nama}</div>
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: "#5f6368", margin: "0 0 12px", lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.deskripsi}
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 12 }}>
                        {p.skills_needed.map(t => <Tag key={t} label={t} />)}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 12, color: "#137333", fontWeight: 500 }}>🟢 {p.applicant_count || 1} slot terbuka</span>
                        {hasJoined ? (
                          <span style={{ fontSize: 12, color: "#137333", fontWeight: 600 }}>✓ Bergabung</span>
                        ) : (
                          <button onClick={e => { e.stopPropagation(); handleJoinProject(p.id); }}
                            disabled={joiningMap[p.id]}
                            style={{
                              background: "#1967d2",
                              color: "#fff",
                              border: "none",
                              borderRadius: 8,
                              padding: "6px 14px",
                              fontSize: 12,
                              fontWeight: 500,
                              cursor: "pointer",
                              fontFamily: "inherit"
                            }}>
                            {joiningMap[p.id] ? "Processing" : "Gabung"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {filteredBrowseProjects.length === 0 && (
                  <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#80868b", fontSize: 14 }}>
                    Tidak ada project ditemukan untuk "<strong>{search}</strong>"
                  </div>
                )}
              </div>

              {/* Detail panel */}
              {selectedProject && (
                <div style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e8eaed",
                  overflow: "hidden",
                  alignSelf: "start",
                  position: "sticky",
                  top: 72,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)"
                }}>
                  <div style={{ background: "#1967d2", padding: "24px 20px" }}>
                    <Avatar name={selectedProject.judul} color="#fff" size={44} />
                    <h2 style={{ color: "#fff", fontWeight: 600, fontSize: 18, margin: "12px 0 4px", letterSpacing: "-0.3px" }}>{selectedProject.judul}</h2>
                    <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: 0 }}>oleh {selectedProject.owner_nama}</p>
                  </div>
                  <div style={{ padding: 20 }}>
                    <p style={{ fontSize: 14, color: "#5f6368", lineHeight: 1.6, marginBottom: 16 }}>{selectedProject.deskripsi}</p>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#80868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Skills dibutuhkan</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {selectedProject.skills_needed.map(t => <Tag key={t} label={t} />)}
                      </div>
                    </div>
                    <div style={{ background: "#f8f9fa", borderRadius: 8, padding: "12px 14px", marginBottom: 20, display: "flex", justifyContent: "space-between", border: "1px solid #e8eaed" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#137333" }}>{selectedProject.applicant_count || 2}</div>
                        <div style={{ fontSize: 10, color: "#80868b" }}>slot terbuka</div>
                      </div>
                      <div style={{ width: 1, background: "#e8eaed" }} />
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#1967d2" }}>{selectedProject.member_count}</div>
                        <div style={{ fontSize: 10, color: "#80868b" }}>anggota</div>
                      </div>
                    </div>
                    
                    {user?.projectIds?.includes(selectedProject.id) || selectedProject.owner_id === user?.id ? (
                      <div style={{ background: "#e6f4ea", color: "#137333", borderRadius: 8, padding: "12px", textAlign: "center", fontWeight: 600, fontSize: 14 }}>
                        ✓ Kamu sudah bergabung
                      </div>
                    ) : (
                      <button onClick={() => handleJoinProject(selectedProject.id)}
                        disabled={joiningMap[selectedProject.id]}
                        style={{
                          width: "100%",
                          background: "#1967d2",
                          color: "#fff",
                          border: "none",
                          borderRadius: 8,
                          padding: "12px",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit"
                        }}>
                        {joiningMap[selectedProject.id] ? "Processing" : "Gabung Project"}
                      </button>
                    )}
                    <button onClick={() => setSelectedProject(null)} style={{ width: "100%", background: "none", border: "none", color: "#5f6368", fontSize: 13, cursor: "pointer", padding: "10px", fontFamily: "inherit", marginTop: 4 }}>
                      Tutup
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Buat Project Tab ── */}
        {tab === "create" && (
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: "#202124", margin: "0 0 6px", letterSpacing: "-0.5px" }}>Buat Project</h1>
            <p style={{ fontSize: 14, color: "#5f6368", margin: "0 0 28px" }}>Cari kolaborator yang tepat untuk projectmu.</p>

            {/* Success screen */}
            {createDone ? (
              <div style={{ maxWidth: 500, margin: "40px auto", padding: 24, textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e6f4ea", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px", border: "1px solid #e8eaed" }}>✓</div>
                <h2 style={{ fontSize: 22, fontWeight: 600, color: "#202124", marginBottom: 8 }}>Project berhasil dibuat!</h2>
                <p style={{ color: "#5f6368", fontSize: 14, marginBottom: 24 }}><strong>{projForm.title}</strong> sudah dipublikasikan dan siap menerima kolaborator.</p>
                <button onClick={() => { setCreateDone(false); setCreateStep(1); setProjForm({ title: "", desc: "", skills: [], slots: 2, rumpun: "", category: "" }); }}
                  style={{ background: "#1967d2", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                  Buat project baru
                </button>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
                  {[1, 2].map((s, i) => (
                    <div key={s} style={{ display: "flex", alignItems: "center" }}>
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: createStep >= s ? "#1967d2" : "#e8eaed",
                        color: createStep >= s ? "#fff" : "#80868b",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 600,
                        transition: "all 0.2s",
                        border: createStep >= s ? "1px solid rgba(25, 103, 210, 0.25)" : "1px solid #dadce0"
                      }}>{s}</div>
                      <span style={{ marginLeft: 8, fontSize: 13, fontWeight: createStep === s ? 600 : 400, color: createStep >= s ? "#202124" : "#80868b" }}>
                        {["Informasi Project", "Skills & Detail"][i]}
                      </span>
                      {i < 1 && <div style={{ width: 40, height: 1.5, background: createStep > 1 ? "#1967d2" : "#e8eaed", margin: "0 12px" }} />}
                    </div>
                  ))}
                </div>

                {/* Form structure card */}
                <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 28, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                  {createStep === 1 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Nama Project *</label>
                        <input value={projForm.title} onChange={e => setProjForm({ ...projForm, title: e.target.value })}
                          placeholder="Misal: AI Resume Builder"
                          style={{ width: "100%", boxSizing: "border-box", border: "1px solid #dadce0", borderRadius: 8, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#202124" }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Kategori</label>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {["Web App", "Mobile App", "AI / ML", "Design", "Open Source", "IoT", "Blockchain"].map(c => (
                            <button key={c} type="button" onClick={() => setProjForm({ ...projForm, category: c })}
                              style={{
                                padding: "7px 14px",
                                borderRadius: 100,
                                border: projForm.category === c ? "2px solid #1967d2" : "1px solid #dadce0",
                                background: projForm.category === c ? "#e8f0fe" : "#fff",
                                color: projForm.category === c ? "#1967d2" : "#5f6368",
                                fontSize: 13,
                                cursor: "pointer",
                                fontFamily: "inherit",
                                fontWeight: projForm.category === c ? 600 : 400
                              }}>
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Deskripsi Project *</label>
                        <textarea value={projForm.desc} onChange={e => setProjForm({ ...projForm, desc: e.target.value })}
                          placeholder="Ceritakan projectmu kepada calon kolaborator..." rows={4}
                          style={{ width: "100%", boxSizing: "border-box", border: "1px solid #dadce0", borderRadius: 8, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#202124", resize: "vertical" }} />
                      </div>
                      <button type="button" onClick={() => { if (projForm.title && projForm.desc) setCreateStep(2); }}
                        style={{ alignSelf: "flex-end", background: "#1967d2", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                        Lanjut →
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Rumpun Ilmu</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {["Saintek", "Soshum", "Bahasa"].map(r => (
                            <button key={r} type="button" onClick={() => setProjForm({ ...projForm, rumpun: r })}
                              style={{ flex: 1, padding: "9px", borderRadius: 8, border: projForm.rumpun === r ? "2px solid #1967d2" : "1px solid #dadce0", background: projForm.rumpun === r ? "#e8f0fe" : "#fff", color: projForm.rumpun === r ? "#1967d2" : "#5f6368", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: projForm.rumpun === r ? 600 : 400 }}>
                              {projForm.rumpun === r ? "✓ " : ""}{r}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Skills Dibutuhkan ({projForm.skills.length}/10)</label>
                        {projForm.skills.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                            {projForm.skills.map(s => (
                              <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e8f0fe", color: "#1967d2", fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 100 }}>
                                {s}
                                <button type="button" onClick={() => setProjForm({ ...projForm, skills: projForm.skills.filter(x => x !== s) })}
                                  style={{ background: "none", border: "none", color: "#1967d2", cursor: "pointer", fontSize: 13, padding: 0, opacity: 0.7 }}>×</button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 8 }}>
                          <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                if (skillInput.trim() && !projForm.skills.includes(skillInput.trim())) {
                                  setProjForm({ ...projForm, skills: [...projForm.skills, skillInput.trim()] });
                                  setSkillInput("");
                                }
                              }
                            }}
                            placeholder="Tekan Enter untuk menambah..."
                            style={{ flex: 1, border: "1px solid #dadce0", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#202124" }}
                            disabled={projForm.skills.length >= 10} />
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                          {PRESET_SKILLS.filter(s => !projForm.skills.includes(s)).slice(0, 8).map(s => (
                            <button key={s} type="button" onClick={() => {
                              if (projForm.skills.length < 10) setProjForm({ ...projForm, skills: [...projForm.skills, s] });
                            }}
                              style={{ background: "#f1f3f4", border: "none", borderRadius: 100, padding: "4px 10px", fontSize: 12, color: "#5f6368", cursor: "pointer", fontFamily: "inherit" }}
                              disabled={projForm.skills.length >= 10}>+ {s}</button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 8 }}>Jumlah Slot Terbuka</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} type="button" onClick={() => setProjForm({ ...projForm, slots: n })}
                              style={{ width: 44, height: 44, borderRadius: 8, border: projForm.slots === n ? "2px solid #1967d2" : "1px solid #dadce0", background: projForm.slots === n ? "#e8f0fe" : "#fff", color: projForm.slots === n ? "#1967d2" : "#5f6368", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <button type="button" onClick={() => setCreateStep(1)}
                          style={{ background: "#fff", color: "#5f6368", border: "1px solid #dadce0", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                          ← Kembali
                        </button>
                        <button type="button" onClick={handleCreateProjectSubmit} disabled={creating}
                          style={{ background: "#1967d2", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                          {creating ? "Publikasi..." : "Publikasikan Project"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live preview */}
                {projForm.title && (
                  <div style={{ marginTop: 20, background: "#f8f9fa", borderRadius: 12, border: "1px solid #e8eaed", padding: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#80868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Preview Card</div>
                    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e8eaed", padding: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: "#202124", marginBottom: 4 }}>{projForm.title}</div>
                      {projForm.category && <span style={{ background: "#e8f0fe", color: "#1967d2", fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 100 }}>{projForm.category}</span>}
                      {projForm.desc && <p style={{ fontSize: 13, color: "#5f6368", margin: "8px 0", lineHeight: 1.5 }}>{projForm.desc}</p>}
                      {projForm.skills.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                          {projForm.skills.map(s => <Tag key={s} label={s} />)}
                        </div>
                      )}
                      <div style={{ marginTop: 10, fontSize: 12, color: "#137333", fontWeight: 500 }}>🟢 {projForm.slots} slot terbuka</div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        )}

        {/* ── Edit Project Tab ── */}
        {tab === "edit" && editingProject && (
          <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: "#202124", margin: 0, letterSpacing: "-0.5px" }}>Edit Project</h1>
              <button onClick={() => { setEditingProject(null); setTab("dashboard"); }}
                style={{ background: "#fff", border: "1px solid #dadce0", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#5f6368", cursor: "pointer", fontFamily: "inherit" }}>
                Kembali
              </button>
            </div>
            <p style={{ fontSize: 14, color: "#5f6368", margin: "0 0 28px" }}>Perbarui informasi project atau sesuaikan status pendaftaran kolaborasi.</p>

            {/* Step indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
              {[1, 2].map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: editStep >= s ? "#1967d2" : "#e8eaed",
                    color: editStep >= s ? "#fff" : "#80868b",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    transition: "all 0.2s",
                    border: editStep >= s ? "1px solid rgba(25, 103, 210, 0.25)" : "1px solid #dadce0"
                  }}>{s}</div>
                  <span style={{ marginLeft: 8, fontSize: 13, fontWeight: editStep === s ? 600 : 400, color: editStep >= s ? "#202124" : "#80868b" }}>
                    {["Informasi Project", "Skills & Detail"][i]}
                  </span>
                  {i < 1 && <div style={{ width: 40, height: 1.5, background: editStep > 1 ? "#1967d2" : "#e8eaed", margin: "0 12px" }} />}
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e8eaed", padding: 28, boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              {editStep === 1 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Nama Project *</label>
                    <input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Misal: AI Resume Builder"
                      style={{ width: "100%", boxSizing: "border-box", border: "1px solid #dadce0", borderRadius: 8, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#202124" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Kategori</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {["Web App", "Mobile App", "AI / ML", "Design", "Open Source", "IoT", "Blockchain"].map(c => (
                        <button key={c} type="button" onClick={() => setEditForm({ ...editForm, category: c })}
                          style={{
                            padding: "7px 14px",
                            borderRadius: 100,
                            border: editForm.category === c ? "2px solid #1967d2" : "1px solid #dadce0",
                            background: editForm.category === c ? "#e8f0fe" : "#fff",
                            color: editForm.category === c ? "#1967d2" : "#5f6368",
                            fontSize: 13,
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontWeight: editForm.category === c ? 600 : 400
                          }}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Deskripsi Project *</label>
                    <textarea value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })}
                      placeholder="Ceritakan projectmu kepada calon kolaborator..." rows={4}
                      style={{ width: "100%", boxSizing: "border-box", border: "1px solid #dadce0", borderRadius: 8, padding: "10px 14px", fontSize: 14, fontFamily: "inherit", outline: "none", color: "#202124", resize: "vertical" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <button type="button" onClick={handleDeleteProject} disabled={updating}
                      style={{ background: "#fce8e6", color: "#a50e0e", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      🗑️ Hapus Project
                    </button>
                    <button type="button" onClick={() => { if (editForm.title && editForm.desc) setEditStep(2); }}
                      style={{ background: "#1967d2", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                      Lanjut →
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Rumpun Ilmu</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["Saintek", "Soshum", "Bahasa"].map(r => (
                        <button key={r} type="button" onClick={() => setEditForm({ ...editForm, rumpun: r })}
                          style={{ flex: 1, padding: "9px", borderRadius: 8, border: editForm.rumpun === r ? "2px solid #1967d2" : "1px solid #dadce0", background: editForm.rumpun === r ? "#e8f0fe" : "#fff", color: editForm.rumpun === r ? "#1967d2" : "#5f6368", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: editForm.rumpun === r ? 600 : 400 }}>
                          {editForm.rumpun === r ? "✓ " : ""}{r}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 6 }}>Skills Dibutuhkan ({editForm.skills.length}/10)</label>
                    {editForm.skills.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                        {editForm.skills.map(s => (
                          <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#e8f0fe", color: "#1967d2", fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 100 }}>
                            {s}
                            <button type="button" onClick={() => setEditForm({ ...editForm, skills: editForm.skills.filter(x => x !== s) })}
                              style={{ background: "none", border: "none", color: "#1967d2", cursor: "pointer", fontSize: 13, padding: 0, opacity: 0.7 }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8 }}>
                      <input value={editSkillInput} onChange={e => setEditSkillInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (editSkillInput.trim() && !editForm.skills.includes(editSkillInput.trim())) {
                              setEditForm({ ...editForm, skills: [...editForm.skills, editSkillInput.trim()] });
                              setEditSkillInput("");
                            }
                          }
                        }}
                        placeholder="Tekan Enter untuk menambah..."
                        style={{ flex: 1, border: "1px solid #dadce0", borderRadius: 8, padding: "9px 12px", fontSize: 13, fontFamily: "inherit", outline: "none", color: "#202124" }}
                        disabled={editForm.skills.length >= 10} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                      {PRESET_SKILLS.filter(s => !editForm.skills.includes(s)).slice(0, 8).map(s => (
                        <button key={s} type="button" onClick={() => {
                          if (editForm.skills.length < 10) setEditForm({ ...editForm, skills: [...editForm.skills, s] });
                        }}
                          style={{ background: "#f1f3f4", border: "none", borderRadius: 100, padding: "4px 10px", fontSize: 12, color: "#5f6368", cursor: "pointer", fontFamily: "inherit" }}
                          disabled={editForm.skills.length >= 10}>+ {s}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#202124", marginBottom: 8 }}>Status Kolaborasi</label>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <StatusBadge status={editForm.status} />
                      <button type="button" onClick={handleToggleProjectStatus} disabled={updating}
                        style={{
                          background: editForm.status === 'Closed' ? "#e6f4ea" : "#fce8e6",
                          color: editForm.status === 'Closed' ? "#137333" : "#a50e0e",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "inherit"
                        }}>
                        {editForm.status === 'Closed' ? "🔓 Buka Kembali Pendaftaran" : "🔒 Tutup Project (Selesai mencari)"}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <button type="button" onClick={() => setEditStep(1)}
                      style={{ background: "#fff", color: "#5f6368", border: "1px solid #dadce0", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                      ← Kembali
                    </button>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" onClick={() => { setEditingProject(null); setTab("dashboard"); }}
                        style={{ background: "#fff", color: "#5f6368", border: "1px solid #dadce0", borderRadius: 8, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                        Batal
                      </button>
                      <button type="button" onClick={handleUpdateProjectSubmit} disabled={updating}
                        style={{ background: "#1967d2", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                        {updating ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview card */}
            {editForm.title && (
              <div style={{ marginTop: 20, background: "#f8f9fa", borderRadius: 12, border: "1px solid #e8eaed", padding: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#80868b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Preview Card (Real-time)</div>
                <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #e8eaed", padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: "#202124" }}>{editForm.title}</div>
                    <StatusBadge status={editForm.status} />
                  </div>
                  {editForm.category && <span style={{ background: "#e8f0fe", color: "#1967d2", fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 100 }}>{editForm.category}</span>}
                  {editForm.desc && <p style={{ fontSize: 13, color: "#5f6368", margin: "8px 0", lineHeight: 1.5 }}>{editForm.desc}</p>}
                  {editForm.skills.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                      {editForm.skills.map(s => <Tag key={s} label={s} />)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}

// ── Dropdown Position Helper ──────────────────────────────────────────────────
function calcDropdownTop(): string | number {
  return "calc(100% + 8px)";
}

// ── Inline Styles ─────────────────────────────────────────────────────────────
const dropdownItemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "11px 16px",
  fontSize: 13,
  fontWeight: 500,
  color: "#1a1a1a",
  background: "none",
  border: "none",
  borderBottom: "1px solid #e8eaed",
  textAlign: "left",
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "background 0.12s"
};

const contactInputStyle: React.CSSProperties = {
  border: "1px solid #dadce0",
  borderRadius: 6,
  padding: "7px 10px",
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  background: "#ffffff",
  color: "#202124"
};