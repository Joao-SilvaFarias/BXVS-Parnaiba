import { useState } from "react";
import Footer from "../components/Footer"
import Header from "../components/Header"
import styles from "./Perfil.module.css"

export default function Perfil({ cliente, setCliente }) {

    const [soLer, setSoLer] = useState(true);
    const toggleEdit = () => setSoLer(!soLer);

    return (
        <>
            <Header cliente={cliente} setCliente={setCliente} />
            <div className={styles.container}>
                <div className={styles.cardMatricula}>
                    <div className={styles.headerCardMatricula}>
                        <p className={styles.tituloMatricula}>Minha matrícula</p>
                        {soLer ? 
                        <button onClick={toggleEdit} className={styles.btnInformacoes}>Editar informações</button> : 
                        <p onClick={toggleEdit}>x</p>}
                    </div>
                    <hr></hr>
                    <div className={styles.containerPerfil}>
                        <img className={styles.imgPerfil} alt="Perfil" src="/img/iconUser.png" />
                        <p className={styles.nomePerfil}>{cliente.nome}</p>
                    </div>
                    <div className={styles.containerDados}>
                        <div className={styles.containerInputs}>
                            <div className={styles.containerInput}>
                                <label>Nome completo</label>
                                <input type="text" className={styles.inputPerfil} value={cliente.nome} readOnly={soLer}/>
                            </div>
                            <div className={styles.containerInput}>
                                <label>CPF</label>
                                <input type="text" className={styles.inputPerfil} value={cliente.cpf} readOnly={soLer}/>
                            </div>
                            <div className={styles.containerInput}>
                                <label>Contato de emergência</label>
                                <input type="text" className={styles.inputPerfil} value={cliente.telefone} readOnly={soLer}/>
                            </div>
                        </div>
                        <div className={styles.containerInputs}>
                            <div className={styles.containerInput}>
                                <label>Data de nascimento</label>
                                <input type="date" className={styles.inputPerfil} value={cliente.dataNascimento} readOnly={soLer}/>
                            </div>
                            <div className={styles.containerInput}>
                                <label>RG</label>
                                <input type="text" className={styles.inputPerfil} value={cliente.rg} readOnly={soLer}/>
                            </div>
                            <div className={styles.containerInput}>
                                <label>Email</label>
                                <input type="text" className={styles.inputPerfil} value={cliente.email} readOnly={soLer}/>
                            </div>
                        </div>
                        <div className={styles.containerInputs}>
                            <div className={styles.containerInput}>
                                <label>Sexo</label>
                                <input type="text" className={styles.inputPerfil} value={cliente.sexo} readOnly={soLer}/>
                            </div>
                            <div className={styles.containerInput}>
                                <label>Telefone</label>
                                <input type="text" className={styles.inputPerfil} value={cliente.telefone} readOnly={soLer}/>
                            </div>
                            <div className={styles.containerInput}>
                                <label>Endereço completo</label>
                                <input type="text" className={styles.inputPerfil} readOnly={soLer}/>
                            </div>
                        </div>
                        <div className={styles.containerCardPlano}>
                            <label>Meu plano</label>
                            <div className={styles.cardPlano}>
                                <div className={styles.textPlano}>Plano PRO</div>
                                <p className={styles.textPlano}>Pensado para quem quer performance máxima. Acesso total às aulas, suporte exclusivo dos coaches e prioridade em eventos e desafios da comunidade BXVS.</p>
                                <div className={styles.vencimentoContainer}>
                                    <p className={styles.textPlano}>Vence em:</p>
                                    <p className={styles.vencimento}>10/12/2025</p>
                                </div>
                                <hr></hr>
                                <div className={styles.containerPagamento}>
                                    <div className={styles.containerValor}>
                                        <p className={styles.textPlano}>Valor:</p>
                                        <p className={styles.textPlano}>R$ 150,00</p>
                                    </div>
                                    <button className={styles.btnMercadoPago}>
                                        <img alt="Mercado pago" src="/img/mercadoPagoIcon.png" className={styles.imgMercadoPago}/>
                                        <p>Realizar pagamento</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}