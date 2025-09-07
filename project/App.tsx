import { Header } from "./components/Header";
import { TradingCard } from "./components/TradingCard";

export default function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#A8D5D0' }}>
      <Header />
      <main className="flex-1 flex items-center justify-center p-8">
        <TradingCard />
      </main>
    </div>
  );
}