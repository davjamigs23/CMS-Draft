import React, { useState, useEffect } from "react";
import { 
  User, 
  ChevronRight, 
  ClipboardList, 
  CheckCircle, 
  HelpCircle, 
  FileText, 
  Grid,
  Info,
  LogOut,
  ShieldCheck,
  PlusCircle,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ShiftingApplication, ShiftingStatus, Course, Instructor } from "./types";

type Role = "Student Portal" | "Admin Review";
type TabType = "New Application" | "My Applications" | "Eligibility Checker" | "Subject Equivalency" | "Program Catalog" | "Support Center" | "Course Management";

export default function App() {
  const [role, setRole] = useState<Role>("Student Portal");
  const [activeTab, setActiveTab] = useState<TabType>("New Application");
  const [applications, setApplications] = useState<ShiftingApplication[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // User state
  const [user, setUser] = useState({ name: "Juan Dela Cruz", id: "STU-2021-08831" });

  // Form state
  const [currentProgram, setCurrentProgram] = useState("");
  const [targetProgram, setTargetProgram] = useState("");
  const [reason, setReason] = useState("");

  const fetchData = async () => {
    try {
      const [appRes, courseRes, instRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/courses"),
        fetch("/api/instructors")
      ]);
      setApplications(await appRes.json());
      setCourses(await courseRes.json());
      setInstructors(await instRes.json());
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProgram || !targetProgram || !reason) {
      setNotification({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    if (reason.length < 50) {
      setNotification({ type: "error", message: "Reason must be at least 50 characters." });
      return;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentProgram, 
          targetProgram, 
          reason,
          studentName: user.name,
          studentId: user.id
        }),
      });
      if (res.ok) {
        setNotification({ type: "success", message: "Application submitted successfully!" });
        setCurrentProgram("");
        setTargetProgram("");
        setReason("");
        fetchData();
        setTimeout(() => setNotification(null), 3000);
      } else {
        const err = await res.json();
        setNotification({ type: "error", message: err.error || "Submission failed" });
      }
    } catch (err) {
      setNotification({ type: "error", message: "Failed to submit application." });
    }
  };

  const handleUpdateStatus = async (appId: string, status: ShiftingStatus) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setNotification({ type: "success", message: `Application ${status}! ` });
        fetchData();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: "error", message: "Update failed" });
    }
  };

  const handleUpdateCourse = async (courseId: string, data: Partial<Course>) => {
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setNotification({ type: "success", message: "Course updated successfully!" });
        fetchData();
        setTimeout(() => setNotification(null), 2000);
      }
    } catch (err) {
      setNotification({ type: "error", message: "Update failed" });
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to cancel this application?")) return;
    try {
      const res = await fetch(`/api/applications/${appId}`, { method: "DELETE" });
      if (res.ok) {
        setNotification({ type: "success", message: "Application cancelled." });
        fetchData();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err) {
      setNotification({ type: "error", message: "Cancellation failed" });
    }
  };

  const handleClear = () => {
    setCurrentProgram("");
    setTargetProgram("");
    setReason("");
  };

  // Change active tab automatically when role changes to ensure UX flow
  useEffect(() => {
    if (role === "Admin Review") {
      setActiveTab("Course Management");
    } else {
      setActiveTab("New Application");
    }
  }, [role]);

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans text-[#333]">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0A1128] text-white flex flex-col shrink-0 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-lg font-bold tracking-tight">IAE System</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Course Management Module</p>
        </div>

        <div className="px-4 py-2">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">View As</p>
          <div className="space-y-1">
            <SidebarItem 
              icon={<User size={16} />} 
              label="Student Portal" 
              active={role === "Student Portal"}
              onClick={() => setRole("Student Portal")}
            />
            <SidebarItem 
              icon={<ShieldCheck size={16} />} 
              label="Admin Review" 
              active={role === "Admin Review"}
              onClick={() => setRole("Admin Review")}
            />
          </div>
        </div>

        {role === "Admin Review" && (
           <div className="px-4 py-2">
             <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Management</p>
             <div className="space-y-1">
               <SidebarItem 
                 icon={<Grid size={16} />} 
                 label="Apps Management" 
                 active={activeTab === "My Applications"}
                 onClick={() => setActiveTab("My Applications")}
               />
               <SidebarItem 
                 icon={<ClipboardList size={16} />} 
                 label="Course Catalog" 
                 active={activeTab === "Course Management"}
                 onClick={() => setActiveTab("Course Management")}
               />
             </div>
           </div>
        )}

        <div className="px-4 py-6">
          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-4 px-2">Quick Links</p>
          <div className="space-y-3 px-2">
            <QuickLink 
              icon={<CheckCircle size={14} />} 
              label="Eligibility Checker" 
              active={activeTab === "Eligibility Checker"}
              onClick={() => setActiveTab("Eligibility Checker")}
            />
            <QuickLink 
              icon={<Grid size={14} />} 
              label="Subject Equivalency" 
              active={activeTab === "Subject Equivalency"}
              onClick={() => setActiveTab("Subject Equivalency")}
            />
            <QuickLink 
              icon={<FileText size={14} />} 
              label="Program Catalog" 
              active={activeTab === "Program Catalog"}
              onClick={() => setActiveTab("Program Catalog")}
            />
            <QuickLink 
              icon={<HelpCircle size={14} />} 
              label="Support Center" 
              active={activeTab === "Support Center"}
              onClick={() => setActiveTab("Support Center")}
            />
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-white/5">
          <div 
             className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group"
             title="Switch User Identity (Simulated)"
             onClick={() => {
               const newName = prompt("Enter simulated user name:", user.name);
               const newId = prompt("Enter simulated user ID:", user.id);
               if (newName && newId) setUser({ name: newName, id: newId });
             }}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${role === 'Admin Review' ? 'bg-indigo-500' : 'bg-[#3B82F6]'}`}>
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate group-hover:text-[#3B82F6] transition-colors">{user.name}</p>
              <p className="text-[9px] text-gray-400 truncate tracking-tight">{user.id}</p>
            </div>
            {role === 'Admin Review' && <ShieldCheck size={12} className="text-indigo-400" />}
          </div>
          <button className="flex items-center gap-2 w-full mt-2 text-[10px] p-2 text-gray-500 hover:text-white transition-colors">
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="px-10 py-10 bg-white sticky top-0 z-10 border-b border-gray-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-[#0A1128]">Course Management Subsystem</h2>
              <p className="text-sm text-gray-400 mt-1">
                {role === "Admin Review" ? "Manage and review pending transfer requests" : "Submit and track your program transfer applications"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-400 hover:text-[#0A1128] transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </div>

          {/* Sub Tabs */}
          <div className="flex gap-8 mt-12 overflow-x-auto scroller-hidden">
            {(role === "Student Portal" ? ["New Application", "My Applications"] : ["Pending Reviews", "All History"]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`pb-4 px-1 text-sm font-semibold whitespace-nowrap transition-all relative ${
                  (activeTab === tab || (role === "Admin Review" && tab === "Pending Reviews" && activeTab === "My Applications")) ? "text-[#3B82F6]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {(activeTab === tab || (role === "Admin Review" && tab === "Pending Reviews" && activeTab === "My Applications")) && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3B82F6]"
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        <div className="p-10 flex-1">
          <AnimatePresence mode="wait">
            {(activeTab === "New Application" && role === "Student Portal") && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl bg-white rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-gray-100 p-10"
              >
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-[#0A1128]">New Transfer Application</h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide font-medium">
                    Ensure all information is accurate. Your application will be reviewed based on your academic standing and program requirements.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#0A1128] uppercase tracking-wider">Current Program <span className="text-red-500">*</span></label>
                      <input 
                        value={currentProgram}
                        onChange={(e) => setCurrentProgram(e.target.value)}
                        placeholder="e.g. BS Computer Science"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all text-sm placeholder:text-gray-300 bg-gray-50/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#0A1128] uppercase tracking-wider">Target Program <span className="text-red-500">*</span></label>
                      <input 
                        value={targetProgram}
                        onChange={(e) => setTargetProgram(e.target.value)}
                        placeholder="e.g. BS Information Technology"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all text-sm placeholder:text-gray-300 bg-gray-50/50"
                      />
                    </div>
                  </div>

                  {/* Eligibility Requirements Box */}
                  <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100/50">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white">
                        <Info size={14} />
                      </div>
                      <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Eligibility Check-list</h4>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                      <RequirementItem text="Minimum GWA of 2.5 required" />
                      <RequirementItem text="No failing grades in major subjects" />
                      <RequirementItem text="No outstanding financial obligations" />
                      <RequirementItem text="Consistent with program capacity" />
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#0A1128] uppercase tracking-wider">Reason for Shifting <span className="text-red-500">*</span></label>
                    <textarea 
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain why you wish to transfer to the target program. Be specific about your academic interests and career goals..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] outline-none transition-all text-sm placeholder:text-gray-300 resize-none bg-gray-50/50"
                    />
                    <div className="flex justify-between items-center px-1">
                       <p className={`text-[10px] font-bold uppercase ${reason.length < 50 ? 'text-amber-500' : 'text-green-500'}`}>
                         Minimum 50 characters required ({reason.length}/50)
                       </p>
                    </div>
                  </div>

                  {/* Before You Submit Box */}
                  <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                      <ClipboardList size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Final Verification Notice</h4>
                      <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                        Your application will be cross-referenced with your official academic transcripts. Providing false information may lead to disciplinary action and disqualification.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-50">
                    <button 
                      type="submit"
                      disabled={reason.length < 50}
                      className="flex-1 sm:flex-none px-10 py-4 bg-[#3B82F6] text-white rounded-xl text-sm font-bold shadow-[0_10px_25px_rgba(59,130,246,0.2)] hover:bg-[#2563EB] disabled:opacity-50 disabled:hover:bg-[#3B82F6] transition-all"
                    >
                      Process Application
                    </button>
                    <button 
                      type="button"
                      onClick={handleClear}
                      className="px-10 py-4 bg-white border border-gray-200 text-gray-500 rounded-xl text-sm font-bold hover:bg-gray-50 hover:text-gray-700 transition-all"
                    >
                      Reset Form
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeTab === "Eligibility Checker" && (
              <motion.div
                key="eligibility"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-[#0A1128] mb-2 text-center">Eligibility Self-Assessment</h3>
                  <p className="text-sm text-gray-400 text-center mb-8">Enter your current academic standing to verify your shifting eligibility</p>
                  
                  <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
                    <div className="space-y-2 text-center">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Current GWA</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        placeholder="e.g. 1.75"
                        className="w-full text-center text-3xl font-bold py-6 rounded-2xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all"
                      />
                    </div>
                    <button className="w-full py-4 bg-[#3B82F6] text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/20 hover:bg-blue-600 transition-all">
                      Check Status
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                    <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest mb-4">You are Eligible if:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-green-800 font-medium">
                        <CheckCircle size={16} /> GWA is 2.5 or better
                      </li>
                      <li className="flex items-center gap-3 text-sm text-green-800 font-medium">
                        <CheckCircle size={16} /> No failing or incomplete grades
                      </li>
                    </ul>
                  </div>
                  <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
                    <h4 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-4">Warning Indicators:</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm text-amber-800 font-medium">
                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-white">!</div>
                        Probationary status
                      </li>
                      <li className="flex items-center gap-3 text-sm text-amber-800 font-medium">
                        <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-white">!</div>
                        Exceeded residency limits
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "Subject Equivalency" && (
              <motion.div
                key="equivalency"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-[#0A1128]">Course Equivalency Lookup</h3>
                    <p className="text-xs text-gray-400 mt-1">Cross-check subjects between different programs</p>
                  </div>
                  <div className="relative">
                    <input 
                      placeholder="Search subject..."
                      className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-xs w-64 focus:ring-1 focus:ring-blue-500"
                    />
                    <Grid size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Source Program Subject</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Equivalent In Target</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Credit Units</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Match Confidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[
                        { src: "CS101 - Intro to Programming", target: "IT102 - Fundamentals of Programming", units: 3, conf: "95%" },
                        { src: "MATH11 - College Algebra", target: "MATH101 - Advanced Math for IT", units: 3, conf: "100%" },
                        { src: "CS201 - Data Structures", target: "IT105 - Algorithm Development", units: 3, conf: "80%" },
                        { src: "PHYS10 - University Physics", target: "GEC-SCI - General Science", units: 3, conf: "100%" },
                        { src: "ENGL1 - Communication Arts", target: "COMM101 - Purposive Communication", units: 3, conf: "100%" },
                      ].map((item, idx) => (
                        <tr key={idx} className="hover:bg-blue-50/10 group transition-colors">
                          <td className="px-8 py-6 text-sm font-bold text-[#0A1128]">{item.src}</td>
                          <td className="px-8 py-6 text-sm font-medium text-blue-600 italic bg-blue-50/30">{item.target}</td>
                          <td className="px-8 py-6 text-sm font-bold text-gray-500 text-center">{item.units}</td>
                          <td className="px-8 py-6 text-right">
                             <div className="inline-flex items-center gap-2">
                               <div className="w-12 h-1 bg-gray-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-green-500" style={{ width: item.conf }}></div>
                               </div>
                               <span className="text-[10px] font-bold text-green-600">{item.conf}</span>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "Program Catalog" && (
              <motion.div
                key="catalog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { title: "BS Computer Science", slots: 15, gwa: 2.0, tag: "Top Choice" },
                    { title: "BS Information Technology", slots: 32, gwa: 2.2, tag: "In Demand" },
                    { title: "BS Data Science", slots: 8, gwa: 1.75, tag: "Exclusive" },
                    { title: "BS Software Engineering", slots: 12, gwa: 2.0, tag: "Technical" },
                    { title: "BS Cyber Security", slots: 10, gwa: 2.1, tag: "Security" },
                    { title: "BS Game Development", slots: 20, gwa: 2.3, tag: "Creative" },
                  ].map((prog, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          {prog.title[3]}
                        </div>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[9px] font-bold rounded uppercase tracking-widest">{prog.tag}</span>
                      </div>
                      <h4 className="font-bold text-[#0A1128] mb-1 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">{prog.title}</h4>
                      <p className="text-[10px] text-gray-400 font-medium mb-6 uppercase tracking-widest">College of Computing</p>
                      
                      <div className="flex justify-between items-center py-4 border-t border-gray-50">
                        <div className="text-center">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Available Slots</p>
                          <p className="text-base font-bold text-[#0A1128]">{prog.slots}</p>
                        </div>
                        <div className="text-center border-l border-gray-100 pl-6">
                          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Min. GWA</p>
                          <p className="text-base font-bold text-blue-600">{prog.gwa}</p>
                        </div>
                      </div>
                      
                      <button className="w-full mt-4 py-3 bg-gray-50 text-[#0A1128] hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all">
                        View Curriculum
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "Support Center" && (
              <motion.div
                key="support"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold text-[#0A1128]">How can we help?</h3>
                  <p className="text-gray-400 text-sm mt-2 font-medium">Common questions and resources for shifting students</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { q: "What is the deadline for shifting applications?", a: "Applications are accepted from the 10th week of the semester up to 2 weeks before the start of the next term." },
                    { q: "Can I shift to a program in a different college?", a: "Yes, but internal college shifting is prioritized first. Inter-college shifting requires an additional interview with the Dean." },
                    { q: "Are there fees associated with shifting?", a: "A shifting fee of $50 applies to cover transcript evaluation and administrative processing." },
                    { q: "Will I repeat my first year?", a: "Not necessarily. Subjects with the same code or verified equivalency will be credited automatically." },
                    { q: "How long does the review process take?", a: "Typically 5-10 working days after the submission deadline has closed." },
                  ].map((faq, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 group cursor-pointer hover:shadow-md transition-all">
                      <div className="flex justify-between items-center">
                        <h5 className="font-bold text-[#0A1128] text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{faq.q}</h5>
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-[#0A1128] p-10 rounded-2xl text-center text-white mt-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                  <h4 className="text-lg font-bold mb-2">Still have questions?</h4>
                  <p className="text-gray-400 text-xs mb-8 max-w-sm mx-auto">Our support team is available Monday to Friday, 8:00 AM to 5:00 PM.</p>
                  <button className="px-8 py-3 bg-[#3B82F6] text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all">
                     Open Support Ticket
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "Course Management" && role === "Admin Review" && (
              <motion.div
                key="course-mgmt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                  <div>
                    <h3 className="text-xl font-bold text-[#0A1128]">CMS: Course Portfolio</h3>
                    <p className="text-xs text-gray-400 mt-1">Manage instructor assignments, pricing, and section capacities</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="p-4 bg-blue-50 rounded-xl text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Courses</p>
                      <p className="text-xl font-bold text-blue-600">{courses.length}</p>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-xl text-center">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Instructors</p>
                      <p className="text-xl font-bold text-indigo-600">{instructors.length}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all shadow-sm">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-widest">{course.code}</span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${course.type === 'Lab' ? 'bg-purple-50 text-purple-600' : course.type === 'Lecture' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                               Type: {course.type}
                             </span>
                          </div>
                          <h4 className="text-lg font-bold text-[#0A1128]">{course.title}</h4>
                          <div className="flex gap-4 mt-3">
                            <div className="text-xs">
                              <span className="text-gray-400 font-medium">Credits:</span>
                              <span className="ml-1 font-bold text-gray-700">{course.credits} Units</span>
                            </div>
                            <div className="text-xs border-l border-gray-100 pl-4">
                              <span className="text-gray-400 font-medium">Prereq:</span>
                              <span className="ml-1 font-bold text-gray-700">{course.prerequisites.length > 0 ? course.prerequisites.join(", ") : "None"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 shrink-0">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Instructor</label>
                            <select 
                              value={course.instructorId || ""}
                              onChange={(e) => handleUpdateCourse(course.id, { instructorId: e.target.value })}
                              className="w-full p-2 bg-gray-50 border-none rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Unassigned</option>
                              {instructors.map(inst => (
                                <option key={inst.id} value={inst.id}>{inst.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Capacity</label>
                            <input 
                              type="number"
                              value={course.capacity}
                              onChange={(e) => handleUpdateCourse(course.id, { capacity: parseInt(e.target.value) })}
                              className="w-full p-2 bg-gray-50 border-none rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pricing ($)</label>
                            <input 
                              type="number"
                              value={course.price}
                              onChange={(e) => handleUpdateCourse(course.id, { price: parseFloat(e.target.value) })}
                              className="w-full p-2 bg-blue-50 text-blue-600 border-none rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {((activeTab === "My Applications" || activeTab === "Pending Reviews" || activeTab === "All History") && (
              <motion.div
                key="list-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden"
              >
                <div className="p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#0A1128]">{role === "Admin Review" ? "Application Queue" : "Your Applications"}</h3>
                    <p className="text-xs text-gray-400 font-medium">Monitoring {applications.length} total entries in real-time</p>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-100">
                    {["All", "Pending", "Approved", "Rejected"].map(filter => (
                        <button key={filter} className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${filter === 'All' ? 'bg-white shadow-sm text-[#141414]' : 'text-gray-400 hover:text-gray-600'}`}>
                          {filter}
                        </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto scroller-custom">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-gray-50/50">Details</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-gray-50/50">Program Transfer</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-gray-50/50 text-center">Status</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-gray-50/50">Submission</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-gray-500 tracking-widest bg-gray-50/50 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {applications.length > 0 ? (
                        applications.map((app) => (
                          <tr key={app.id} className="group hover:bg-blue-50/20 transition-all">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${app.status === 'pending' ? 'bg-amber-100 text-amber-600' : app.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {app.id.slice(-2)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-[#0A1128]">{app.id}</p>
                                  <p className="text-[10px] text-gray-400 font-medium">{role === 'Admin Review' ? app.studentName : 'Juan Dela Cruz'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-3">
                                 <div className="text-xs">
                                   <p className="font-semibold text-gray-400 uppercase text-[9px] tracking-tight">From</p>
                                   <p className="font-bold text-[#0A1128]">{app.currentProgram}</p>
                                 </div>
                                 <ChevronRight size={14} className="text-gray-300" />
                                 <div className="text-xs">
                                   <p className="font-semibold text-gray-400 uppercase text-[9px] tracking-tight">To</p>
                                   <p className="font-bold text-blue-600">{app.targetProgram}</p>
                                 </div>
                               </div>
                            </td>
                            <td className="px-8 py-6 text-center">
                              <StatusBadge status={app.status} />
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-xs font-bold text-gray-700">{new Date(app.submittedAt).toLocaleDateString()}</p>
                              <p className="text-[10px] text-gray-400 font-medium">at {new Date(app.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </td>
                            <td className="px-8 py-6 text-right">
                              {role === "Admin Review" ? (
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {app.status === 'pending' && (
                                    <>
                                      <button 
                                        onClick={() => handleUpdateStatus(app.id, "approved")}
                                        className="p-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                                        title="Approve"
                                      >
                                        <CheckCircle size={16} />
                                      </button>
                                      <button 
                                        onClick={() => handleUpdateStatus(app.id, "rejected")}
                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                        title="Reject"
                                      >
                                        <div className="rotate-45"><PlusCircle size={16} /></div>
                                      </button>
                                    </>
                                  )}
                                  <button className="p-2 bg-gray-50 text-gray-400 hover:bg-gray-100 rounded-lg transition-all" title="View Reason">
                                    <FileText size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                   {app.status === 'pending' && (
                                      <button 
                                        onClick={() => handleDelete(app.id)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                        title="Cancel Application"
                                      >
                                        <LogOut size={16} className="rotate-180" />
                                      </button>
                                   )}
                                   <button 
                                      className="text-[10px] font-bold text-[#3B82F6] hover:underline uppercase tracking-widest"
                                      onClick={() => alert(`Reason: ${app.reason}`)}
                                   >
                                      Details
                                   </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-32">
                             <div className="flex flex-col items-center justify-center text-gray-300">
                               <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                                 <ClipboardList size={32} />
                               </div>
                               <h4 className="text-lg font-bold text-gray-400">Database is empty</h4>
                               <p className="text-sm max-w-xs text-center mt-2 font-medium">New applications will appear here once submitted via the Student Portal.</p>
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      {/* Global Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-10 right-10 z-50 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-center gap-4 border min-w-[320px] ${
              notification.type === "success" 
                ? "bg-white border-green-500/20" 
                : "bg-white border-red-500/20"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${notification.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
              {notification.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{notification.type === "success" ? 'Success' : 'Attention'}</p>
              <p className="text-sm font-bold text-gray-700 mt-0.5">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto p-1.5 hover:bg-gray-50 rounded-full text-gray-400 transition-colors"
            >
              <PlusCircle size={14} className="rotate-45" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold transition-all group ${
        active 
          ? "bg-[#3B82F6] text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)]" 
          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
      }`}
    >
      <span className={`${active ? "text-white" : "text-gray-500 group-hover:text-gray-300"}`}>{icon}</span>
      {label}
      {active && <motion.div layoutId="sidebarDot" className="ml-auto w-1 h-1 bg-white rounded-full" />}
    </button>
  );
}

function QuickLink({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 text-xs font-medium transition-colors group ${
        active ? 'text-blue-400' : 'text-gray-400 hover:text-gray-200'
      }`}
    >
      <span className={`${active ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'}`}>{icon}</span>
      {label}
      {active && <div className="ml-auto w-1 h-1 bg-blue-400 rounded-full" />}
    </button>
  );
}

function RequirementItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-xs text-[#1E40AF]">
      <div className="w-1 h-1 bg-[#3B82F6] rounded-full" />
      {text}
    </li>
  );
}

function StatusBadge({ status }: { status: ShiftingStatus }) {
  const styles = {
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    approved: "bg-green-50 text-green-600 border-green-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
}

function AlertCircle(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
