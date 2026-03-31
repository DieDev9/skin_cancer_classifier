import React from "react";
import Navbar from "../componets/Navbar";
import Sidebar from "../componets/Sidebar";
import UploadForm from "../componets/UploadForm";
import DiagnosisPanel from "../componets/DiagnosisPanel";
const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
  
  {/* Navbar arriba */}
  <Navbar />

  {/* Grid principal debajo */}
  <div className="flex-1 grid grid-cols-12 gap-6 p-6">
    <Sidebar />
    <UploadForm />
    <DiagnosisPanel />
  </div>

</div>

  );
};

export default HomePage;