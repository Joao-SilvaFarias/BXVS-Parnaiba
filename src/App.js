import styles from "./App.module.css"
import Home from "./pages/Home"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Matricula from "./pages/Matricula"
import ScrollToTop from "./components/ScrollToTop"
import { useEffect, useState } from "react"
import axios from "axios"

export default function App() {

  const [cliente, setCliente] = useState(() => {
    const storedCliente = localStorage.getItem("cliente");
    return storedCliente ? JSON.parse(storedCliente) : null;
});



  return (
    <div className={styles.container}>
      <BrowserRouter>
      <ScrollToTop/>
        <Routes>
          <Route path="/" element={<Home cliente={cliente} setCliente={setCliente}/>} />
          <Route path="/matricula" element={<Matricula cliente={cliente} setCliente={setCliente} />} />
        </Routes>
      </BrowserRouter>
    </div>






  )
}