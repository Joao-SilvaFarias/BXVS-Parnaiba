import { Link } from "react-router-dom"
import styles from "./Concluido.module.css"

export default function Concluido() {
    return (
        <div className={styles.container}>
            <img src="/img/logo.png" alt="Logo" className={styles.logo} />
            <p className={styles.titulo}>matrícula concluída</p>
            <p className={styles.descricao}>Seja bem-vindo ao BXVS – Box Vida Saudável
                Vitor.</p>
            <button className={styles.btnPaginaInicial}>voltar à pagina inicial</button>
            <Link to={"/perfil"} className={styles.linkMatricula}>Ver minha matrícula</Link>
        </div>
    )
}