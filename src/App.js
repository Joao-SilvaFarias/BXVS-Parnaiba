import styles from "./App.module.css"
import Home from "./pages/Home"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Matricula from "./pages/Matricula"
import ScrollToTop from "./components/ScrollToTop"

export default function App() {
  return (
    <div className={styles.container}>
      <BrowserRouter>
      <ScrollToTop/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matricula" element={<Matricula />} />
        </Routes>
      </BrowserRouter>
    </div>






  )
}