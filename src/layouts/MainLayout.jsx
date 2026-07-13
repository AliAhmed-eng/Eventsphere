import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden">
      <Navbar />

      <main className="pt-24 px-4 sm:px-6 md:px-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;