import { useEffect, useState } from "react";
import styles from "./Header.module.css"
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Header({ cliente, setCliente }) {
    const [largura, setLargura] = useState(window.innerWidth);
    const location = useLocation();
    const navigate = useNavigate();
    useEffect(() => {
        const handleResize = () => setLargura(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const logout = () => {
        // Remove dados salvos
        localStorage.removeItem("cliente");
        localStorage.removeItem("token");

        // Reseta o estado do React
        setCliente(null);
    };


    return (
        <header>
            <Link to={"/"}>
                <div className={styles.title}>
                    <img src="/img/logo.png" alt="Logo" className={styles.logoTitle} />
                    <p className={styles.txtTitle}>BXVS PARNAÍBA</p>
                </div>
            </Link>
            {largura > 768 &&
                <nav>
                    <a href="#sobre"><p className={styles.link}>QUEM SOMOS</p></a>
                    <a href="#professores"><p className={styles.link}>PROFESSORES</p></a>
                    <a href="#planos"><p className={styles.link}>PLANOS</p></a>
                    <a href="#matricula"><p className={styles.link}>MATRÍCULA</p></a>
                </nav>
            }
            {cliente ? (
                <div className={styles.usuarioContainer} onClick={logout}>
                    <div className={styles.txtUsuarioContainer}>
                        <p className={styles.nomeUsuario}>{cliente.nome}</p>
                        <p className={`${styles.statusMatricula} ${cliente && styles.verde}`}>matriculado</p>
                    </div>
                    <img src="/img/iconUser.png" alt="Ícone de usuário" className={styles.iconUser} />
                </div>
            ) : (
                <div className={styles.usuarioContainer}>
                    <div className={styles.txtUsuarioContainer}>
                        <p className={styles.nomeUsuario}>Anônimo</p>
                        <p className={styles.statusMatricula}>não matriculado</p>
                    </div>
                    <img src="/img/iconUser.png" alt="Ícone de usuário" className={styles.iconUser} />
                </div>

            )}

        </header>
    )
}