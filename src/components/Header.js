import { useEffect, useState } from "react";
import styles from "./Header.module.css"
import { Link } from "react-router-dom";

export default function Header() {
    const [largura, setLargura] = useState(window.innerWidth);
    const [alunoMatriculado, setAlunoMatriculado] = useState(false);
    useEffect(() => {
        const handleResize = () => setLargura(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
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
            {!alunoMatriculado ? (
                <div className={styles.usuarioContainer} onClick={() => setAlunoMatriculado(!alunoMatriculado)}>
                    <div className={styles.txtUsuarioContainer}>
                        <p className={styles.nomeUsuario}>Anônimo</p>
                        <p className={styles.statusMatricula}>não matriculado</p>
                    </div>
                    <img src="/img/iconUser.png" alt="Ícone de usuário" className={styles.iconUser} />
                </div>
            ) : (
                <div className={styles.usuarioContainer} onClick={() => setAlunoMatriculado(!alunoMatriculado)}>
                <div className={styles.txtUsuarioContainer}>
                    <p className={styles.nomeUsuario}>VITOR AMORIM SPAOLONSE</p>
                    <p className={`${styles.statusMatricula} ${alunoMatriculado && styles.verde}`}>matriculado</p>
                </div>
                <img src="/img/iconUser.png" alt="Ícone de usuário" className={styles.iconUser}/>
            </div>
            )}

        </header>
    )
}