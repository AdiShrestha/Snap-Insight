// "use client";
// import React, { useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import AppLayout from "../../components/Layout/AppLayout";
// import ChatAI from "../../components/ChatAI";
// import Image from "next/image";
// const categories = [
//   { name: "Cooking", icon: "🍳", path: "../module/cooking" },
//   { name: "Shopping", icon: "🛍️", path: "../module/shopping" },
// ];

// const stats = [
//   { label: "Snaps Taken", value: 123, icon: "📸", color: "bg-blue-500" },
//   { label: "Sources Webscrapped", value: 45, icon: "🌐", color: "bg-yellow-400" },
//   { label: "Insights Analyzed", value: 78, icon: "🔍", color: "bg-purple-500" },
// ];

// export default function Dashboard() {
//   const [dragActive, setDragActive] = useState(false);
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const inputRef = useRef();
//   const router = useRouter();

//   // D and D
//   const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
//   const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
//   const handleDrop = (e) => {
//     e.preventDefault(); setDragActive(false);
//     const files = Array.from(e.dataTransfer.files).filter((file) => file.type.startsWith("image/"));
//     setUploadedFiles((prev) => [...prev, ...files]);
//   };
//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files).filter((file) => file.type.startsWith("image/"));
//     setUploadedFiles((prev) => [...prev, ...files]);
//   };
//   const handleRemoveFile = (idx) => {
//     setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
//   };

//   return (
//     <AppLayout>
//       <div className="w-full min-h-[calc(100vh-56px)] bg-gray-100 flex items-center justify-center py-10 px-2">
      
//         <div className="w-full max-w-7xl min-h-[80vh] rounded-3xl shadow-2xl bg-white px-10 py-10 mx-4 flex items-start justify-center">
      
//           <div className="flex flex-row w-full h-full gap-10">
         
//             <div className="flex flex-col flex-1 gap-10">
        
//               <div className="flex flex-col gap-6">
//                 {categories.map((cat) => (
//                   <button
//                     key={cat.name}
//                     type="button"
//                     onClick={() => router.push(cat.path)}
//                     className="flex items-center gap-4 px-8 py-6 rounded-3xl bg-gradient-to-r from-gray-200 to-gray-100 text-black text-xl font-semibold shadow-lg hover:scale-105 transition-transform duration-200 w-full"
//                   >
//                     <span className="text-2xl">{cat.icon}</span>
//                     {cat.name}
//                   </button>
//                 ))}
//               </div>

//               <div className="flex flex-col gap-3">
//                 <div
//                   className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-white transition-all duration-200
//                   ${dragActive ? "border-blue-600 bg-blue-50" : "border-gray-300"}
//                   h-[180px] py-4 px-3 w-full`}
//                   onDragOver={handleDragOver}
//                   onDragLeave={handleDragLeave}
//                   onDrop={handleDrop}
//                   onClick={() => inputRef.current.click()}
//                   style={{ cursor: "pointer" }}
//                 >
//                   <input
//                     ref={inputRef}
//                     type="file"
//                     multiple
//                     accept="image/*"
//                     className="hidden"
//                     onChange={handleFileChange}
//                   />
//                   <div className="flex flex-col items-center gap-4">
//                     <span className="text-2xl mb-1 animate-bounce">📤</span>
//                     <span className="font-semibold text-gray-800 text-sm text-center">
//                       Drag and drop photos here, or{" "}
//                       <span className="underline text-blue-600">click to browse</span>
//                     </span>
//                     <span className="text-xs text-gray-500">Only image files are accepted</span>
//                   </div>
//                   {dragActive && (
//                     <div className="absolute inset-0 bg-blue-100 opacity-30 rounded-xl pointer-events-none animate-pulse" />
//                   )}
//                 </div>
                
//                 {uploadedFiles.length > 0 && (
//                   <div className="mt-2 grid grid-cols-2 gap-2">
//                     {uploadedFiles.map((file, idx) => (
//                       <div key={idx} className="relative group">
//                         <Image
//                           src={URL.createObjectURL(file)}
//                           alt={file.name}
//                           className="w-full h-12 object-cover rounded-lg border border-gray-200 group-hover:brightness-90 transition"
//                         />
//                         <button
//                           type="button"
//                           onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }}
//                           className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-1 opacity-70 hover:opacity-100 shadow"
//                           aria-label="Remove file"
//                         >
//                           ×
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>
       
//             <div className="flex flex-col flex-1 gap-10">
            
//               <div className="flex flex-row gap-6 justify-center">
//                 {stats.map((stat) => (
//                   <div
//                     key={stat.label}
//                     className={`rounded-3xl flex flex-col items-center justify-center h-28 w-40 shadow-lg ${stat.color} text-white transition-all duration-200`}
//                   >
//                     <span className="text-2xl mb-2 drop-shadow">{stat.icon}</span>
//                     <span className="font-bold text-2xl">{stat.value}</span>
//                     <span className="text-sm font-bold text-center">{stat.label}</span>
//                   </div>
//                 ))}
//               </div>
          
//               <div className="rounded-2xl bg-white shadow-md overflow-hidden p-0 flex flex-col w-full h-[280px] justify-between">
//                 <ChatAI />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </AppLayout>
//   );
// }
"use client";
import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "../../components/Layout/AppLayout";
import ChatAI from "../../components/ChatAI";
import Image from "next/image";

const categories = [
  { 
    name: "Cooking", 
    icon: "🍳", 
    path: "../module/cooking", 
    description: "Find recipes & cooking tips",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
    hoverGradient: "linear-gradient(135deg, #FF5722 0%, #FF7043 100%)",
    bgGradient: "linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 142, 83, 0.1) 100%)"
  },
  { 
    name: "Shopping", 
    icon: "🛍️", 
    path: "../module/shopping", 
    description: "Compare prices & products",
    gradient: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
    hoverGradient: "linear-gradient(135deg, #26A69A 0%, #00695C 100%)",
    bgGradient: "linear-gradient(135deg, rgba(78, 205, 196, 0.1) 0%, rgba(68, 160, 141, 0.1) 100%)"
  },
  { 
    name: "Travel", 
    icon: "✈️", 
    path: "../module/travel", 
    description: "Plan your perfect trip",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    hoverGradient: "linear-gradient(135deg, #5A67D8 0%, #553C9A 100%)",
    bgGradient: "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)"
  },
];

const stats = [
  { 
    label: "Snaps Analyzed", 
    value: 342, 
    icon: "📸", 
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)",
    description: "Images processed this month"
  },
  { 
    label: "AI Insights", 
    value: 1247, 
    icon: "🧠", 
    gradient: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)",
    description: "Intelligence discoveries"
  },
  { 
    label: "Time Saved", 
    value: "18h", 
    icon: "⏱️", 
    gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
    description: "Hours saved this week"
  },
  { 
    label: "Accuracy Rate", 
    value: "94%", 
    icon: "🎯", 
    gradient: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
    description: "AI prediction accuracy"
  },
];

export default function Dashboard() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const inputRef = useRef();
  const router = useRouter();

  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith("image/"));
    setUploadedFiles(prev => [...prev, ...files]);
  };
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith("image/"));
    setUploadedFiles(prev => [...prev, ...files]);
  };
  const handleRemoveFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <AppLayout>
      <div style={{ 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        minHeight: '100vh',
        padding: '32px 24px'
      }}>
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '24px'
            }}>
              <h1 style={{ 
                fontSize: '4rem',
                fontWeight: '700',
                margin: 0,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ✨ SnapInsight AI
              </h1>
            </div>
            
            <p style={{
              fontSize: '20px',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto 32px auto',
              lineHeight: '1.6',
              fontWeight: '400'
            }}>
              Capture, analyze, and discover insights from your world with AI-powered intelligence
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.2) 100%)',
                color: '#15803d',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
              </div>
              {/* <div style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.2) 100%)',
                color: '#1d4ed8',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                Version 2.0
              </div> */}
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ 
                fontSize: '2.5rem',
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '8px'
              }}>
                📊 Analytics Dashboard
              </h2>
              <p style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>
                Real-time insights into your AI-powered activities
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  style={{
                    background: stat.gradient,
                    borderRadius: '20px',
                    padding: '32px 24px',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="hover-card"
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-8px) scale(1.02)';
                    e.target.style.boxShadow = '0 20px 60px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0) scale(1)';
                    e.target.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }} className="hover-overlay"></div>
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      fontSize: '3rem', 
                      marginBottom: '16px',
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                      transition: 'transform 0.3s ease'
                    }} className="stat-icon">
                      {stat.icon}
                    </div>
                    <div style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: '700', 
                      marginBottom: '8px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: '600',
                      opacity: 0.9,
                      marginBottom: '4px'
                    }}>
                      {stat.label}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: 0.8,
                      fontWeight: '400'
                    }}>
                      {stat.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* Left Side - AI Modules */}
            <div className="flex-1">
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.5)'
              }}>
                
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <h2 style={{ 
                    fontSize: '2.25rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    marginBottom: '8px'
                  }}>
                    🚀 AI Modules
                  </h2>
                  <p style={{ fontSize: '16px', color: '#64748b', fontWeight: '500' }}>
                    Choose a module to start your AI-powered analysis
                  </p>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {categories.map((cat, index) => (
                    <button
                      key={cat.name}
                      onClick={() => router.push(cat.path)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '24px 32px',
                        borderRadius: '16px',
                        background: cat.gradient,
                        color: 'white',
                        border: 'none',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px) scale(1.02)';
                        e.target.style.boxShadow = '0 16px 48px rgba(0,0,0,0.25)';
                        e.target.style.background = cat.hoverGradient;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0) scale(1)';
                        e.target.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
                        e.target.style.background = cat.gradient;
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      }} className="module-overlay"></div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 1 }}>
                        <span style={{ 
                          fontSize: '2.5rem',
                          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                          transition: 'transform 0.3s ease'
                        }} className="module-icon">
                          {cat.icon}
                        </span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
                            {cat.name} Module
                          </div>
                          <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '500' }}>
                            {cat.description}
                          </div>
                        </div>
                      </div>
                      <span style={{ 
                        fontSize: '24px',
                        transition: 'transform 0.3s ease',
                        position: 'relative',
                        zIndex: 1,
                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }} className="module-arrow">
                        →
                      </span>
                    </button>
                  ))}
                </div>

                {/* Quick Upload Section */}
                <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '2px solid #e2e8f0' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1e293b',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}>
                    📤 Quick Analysis Upload
                  </h3>
                  
                  <div
                    style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: dragActive ? '3px dashed #8B5CF6' : '3px dashed #cbd5e1',
                      borderRadius: '16px',
                      background: dragActive 
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)' 
                        : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                      height: '120px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: dragActive ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: dragActive ? '0 8px 32px rgba(139, 92, 246, 0.2)' : '0 4px 16px rgba(0,0,0,0.1)'
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current.click()}
                    onMouseEnter={(e) => {
                      if (!dragActive) {
                        e.target.style.borderColor = '#8B5CF6';
                        e.target.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!dragActive) {
                        e.target.style.borderColor = '#cbd5e1';
                        e.target.style.background = 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)';
                      }
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        fontSize: '2.5rem', 
                        marginBottom: '8px',
                        animation: dragActive ? 'bounce 1s infinite' : 'none'
                      }}>
                        📤
                      </div>
                      <div style={{ 
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        Drop images here or{" "}
                        <span style={{ color: '#8B5CF6', textDecoration: 'underline' }}>
                          click to browse
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Support for JPG, PNG, GIF files
                      </div>
                    </div>
                    {dragActive && (
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(139, 92, 246, 0.1)',
                        borderRadius: '16px',
                        animation: 'pulse 1s infinite'
                      }} />
                    )}
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div style={{ 
                      marginTop: '16px', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                      gap: '8px' 
                    }}>
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            width={80}
                            height={60}
                            style={{
                              width: '100%',
                              height: '60px',
                              objectFit: 'cover',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.borderColor = '#8B5CF6';
                              e.target.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.borderColor = '#e5e7eb';
                              e.target.style.transform = 'scale(1)';
                            }}
                          />
                          <button
                            onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }}
                            style={{
                              position: 'absolute',
                              top: '-4px',
                              right: '-4px',
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: 'white',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              border: 'none',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.transform = 'scale(1.1)';
                              e.target.style.background = 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)';
                              e.target.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - AI Chat Assistant */}
            <div className="xl:max-w-md w-full">
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                height: '100%',
                minHeight: '600px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: 'white',
                  padding: '24px 32px',
                  borderRadius: '24px 24px 0 0'
                }}>
                  <h3 style={{ 
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    margin: 0
                  }}>
                    <span style={{ fontSize: '2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}>
                      🤖
                    </span>
                    <div>
                      <div>AI Assistant</div>
                      <div style={{ 
                        fontSize: '14px', 
                        opacity: 0.9, 
                        fontWeight: '500',
                        marginTop: '4px'
                      }}>
                        Ask me anything about your data!
                      </div>
                    </div>
                  </h3>
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <ChatAI />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { 
              opacity: 1; 
            }
            50% { 
              opacity: 0.5; 
            }
          }
          
          @keyframes bounce {
            0%, 100% { 
              transform: translateY(0); 
            }
            50% { 
              transform: translateY(-10px); 
            }
          }
          
          .hover-card:hover .hover-overlay {
            opacity: 1 !important;
          }
          
          .hover-card:hover .stat-icon {
            transform: scale(1.1) rotate(5deg) !important;
          }
          
          button:hover .module-overlay {
            opacity: 1 !important;
          }
          
          button:hover .module-icon {
            transform: scale(1.1) rotate(10deg) !important;
          }
          
          button:hover .module-arrow {
            transform: translateX(8px) !important;
          }
        `}</style>
      </div>
    </AppLayout>
  );
}
