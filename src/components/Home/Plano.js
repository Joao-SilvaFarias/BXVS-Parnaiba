import styles from "./Plano.module.css"

export default function Plano({plano}) {
    return (
        <div className={`${styles.cardPlano}`} id={`${plano.idPlano === 2 && styles.planoDestaque}`}>
            <img src="/img/logo.png" alt="Plano 1" className={styles.logoPlano} />
            <p className={styles.nomePlano}>{plano.nome}</p>
            <p className={styles.descricaoPlano}>{plano.descricao}</p>
            <p className={styles.precoPlano}>R$ {plano.preco}<span>/mês</span></p>
            <p className={styles.tituloBeneficios}>BENEFÍCIOS</p>
            <ul className={styles.listaBeneficios}>
                <div className={styles.beneficioItem}>
                    <img src="/img/check.svg" alt="Check" className={styles.iconCheck} />
                    <p className={styles.txtBeneficioItem}>EXEMPLO DE BENEFÍCIO</p>
                </div>
                <div className={styles.beneficioItem}>
                    <img src="/img/check.svg" alt="Check" className={styles.iconCheck} />
                    <p className={styles.txtBeneficioItem}>EXEMPLO DE BENEFÍCIO</p>
                </div>
                <div className={styles.beneficioItem}>
                    <img src="/img/check.svg" alt="Check" className={styles.iconCheck} />
                    <p className={styles.txtBeneficioItem}>EXEMPLO DE BENEFÍCIO</p>
                </div>
                <div className={styles.beneficioItem}>
                    <img src="/img/check.svg" alt="Check" className={styles.iconCheck} />
                    <p className={styles.txtBeneficioItem}>EXEMPLO DE BENEFÍCIO</p>
                </div>
                <div className={styles.beneficioItem}>
                    <img src="/img/check.svg" alt="Check" className={styles.iconCheck} />
                    <p className={styles.txtBeneficioItem}>EXEMPLO DE BENEFÍCIO</p>
                </div>
            </ul>
            <button className={styles.btnAssinarPlano}>ASSINAR</button>
        </div>
    )
}