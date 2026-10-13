import Navbar from './components/Navbar';
import Hero from './components/Hero';
import IrbWizard from './components/IrbWizard';
import ApplicationForm from './components/ApplicationForm';
import StatusTracker from './components/StatusTracker';
import DocumentsList from './components/DocumentsList';
import AboutSection from './components/AboutSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />
      <main className="px-4 space-y-6 pb-12">
        <Hero />
        <section id="wizard">
          <IrbWizard />
        </section>
        <section id="apply">
          <ApplicationForm />
        </section>
        <section id="status">
          <StatusTracker />
        </section>
        <section id="documents">
          <DocumentsList />
        </section>
        <section id="about">
          <AboutSection />
        </section>
      </main>
    </div>
  );
}
