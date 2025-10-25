import styles from "./App.module.css"
import Home from "./pages/Home"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Matricula from "./pages/Matricula"
import ScrollToTop from "./components/ScrollToTop"
import { useEffect, useState } from "react"
import axios from "axios"
import Perfil from "./pages/Perfil"

export default function App() {

  const [cliente, setCliente] = useState(null);
  useEffect(() => {
    const storedCliente = localStorage.getItem("cliente");
    const storedToken = localStorage.getItem("token");

    if (storedCliente && storedToken) {
        setCliente(JSON.parse(storedCliente));
        // opcional: você pode setar o token em algum estado global ou axios defaults
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
}, []);


  return (
    <div className={styles.container}>
      <BrowserRouter>
      <ScrollToTop/>
        <Routes>
          <Route path="/" element={<Home cliente={cliente} setCliente={setCliente}/>} />
          <Route path="/matricula" element={<Matricula cliente={cliente} setCliente={setCliente} />} />
          <Route path="/perfil" element={<Perfil cliente={cliente} setCliente={setCliente} />} />
        </Routes>
      </BrowserRouter>
    </div>






  )
}