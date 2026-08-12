import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResumeForm from "./pages/ResumeForm";
import ResumePreview from "./pages/ResumePreview";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Settings from "./pages/Settings";
import MyResumes from "./pages/MyResumes";
import Feedback from "./pages/Feedback";
import DownloadHistory from "./pages/DownloadHistory";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import CoverLetter from "./pages/CoverLetter";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/resume" element={<ResumeForm />} />
        <Route path="/resume/edit/:resumeId" element={<ResumeForm />} />
        <Route path="/resume-preview/:resumeId" element={<ResumePreview />} />
        <Route path="/resume/:resumeId" element={<ResumePreview />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} /> 
        <Route path="/settings" element={<Settings />} />
        <Route path="/my-resumes" element={<MyResumes />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/download-history" element={<DownloadHistory />} />
        <Route path="/cover-letter" element={<CoverLetter />} />
        <Route path="/profile" element={<Profile />} />
           
      </Routes>
      <Footer />
    </>
  );
}

export default App;