// App.jsx o tu layout principal
import { CasosProvider } from "./componets/CasosContext";
import Sidebar from "./componets/Sidebar";
import UploadForm from "./componets/UploadForm";

export default function App() {
  return (
    <CasosProvider>
      <div className="grid grid-cols-9 gap-4 p-6 min-h-screen bg-gray-100">
        <Sidebar />
        <UploadForm />
      </div>
    </CasosProvider>
  );
}