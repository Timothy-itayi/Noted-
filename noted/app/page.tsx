import Notes from './components/Notes';

export default function Home() {
  return (
    <div className="min-h-screen p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold">Noted</h1>
        <p className="text-gray-600">Your personal note-taking app</p>
      </header>
      <Notes />
    </div>
  );
}
