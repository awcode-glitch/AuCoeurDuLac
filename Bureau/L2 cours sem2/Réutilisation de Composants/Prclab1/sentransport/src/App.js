import './App.css';
import Header from './Header';
import ListeLignes from './ListeLignes';
import Footer from './Footer';
import StatReseau from './StatReseau';

function App() {
  const lignes = [
    { id: 1, numero: "1", depart: "Parcelles Assainies", arrivee: "Plateau", arrets: 14, couleur: "#0a6e31" },
    { id: 2, numero: "7", depart: "Guediawaye", arrivee: "Place Obe", arrets: 18, couleur: "#e74c3c" },
    { id: 3, numero: "15", depart: "Pikine", arrivee: "Medina", arrets: 12, couleur: "#3498db" },
    { id: 4, numero: "23", depart: "Ouakam", arrivee: "Grand Dakar", arrets: 10, couleur: "#f39c12" },
    { id: 5, numero: "8", depart: "Almadies", arrivee: "Colobane", arrets: 16, couleur: "#9b59b6" },
    { id: 6, numero: "12", depart: "Yoff", arrivee: "Sandaga", arrets: 11, couleur: "#1abc9c" },
    { id: 7, numero: "3", depart: "Fann", arrivee: "HLM", arrets: 9, couleur: "#e67e22" },
    { id: 8, numero: "18", depart: "Liberté 6", arrivee: "Dieuppeul", arrets: 13, couleur: "#2980b9" },
    { id: 9, numero: "27", depart: "Sicap", arrivee: "Medina", arrets: 8, couleur: "#c0392b" },
    { id: 10, numero: "5", depart: "HLM", arrivee: "Colobane", arrets: 7, couleur: "#27ae60" },
    
  ];

  return (
    <div className="App">
      <Header />
      <main className="contenu">
        <StatReseau lignes={lignes} /> 
        <ListeLignes lignes={lignes} />
      </main>
      <Footer />
    </div>
  );
}

export default App;

