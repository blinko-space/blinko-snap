import { Button } from "./components/ui/button";

function App() {
  return (
    <div data-tauri-drag-region className="h-screen w-screen flex items-center justify-center">
      <div className="p-4 flex flex-col gap-4">
        <Button variant="default">Default Button</Button>
        <Button variant="destructive">Destructive Button</Button>
        <Button variant="outline">Outline Button</Button>
      </div>
    </div>
  );
}

export default App;
