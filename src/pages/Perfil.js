import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer"
import Header from "../components/Header"
import styles from "./Perfil.module.css"
import axios from "axios";

export default function Perfil({ cliente, setCliente }) {

    const [soLer, setSoLer] = useState(true);
    const nomeRef = useRef(null);
    const [clienteOriginal, setClienteOriginal] = useState(cliente);
    const toggleEdit = () => {
        setSoLer(prev => {
            const novoEstado = !prev;
            if (novoEstado === false) {
                // Espera o input liberar o readOnly e então foca
                setTimeout(() => nomeRef.current?.focus(), 0);
            }
            return novoEstado;
        });
    };

    const handleChange = e => {
        setCliente(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!cliente || !clienteOriginal) {
            console.warn("Cliente ou clienteOriginal está null, cancelando envio");
            return;
        }

        if (cliente.nome === clienteOriginal.nome &&
            cliente.cpf === clienteOriginal.cpf &&
            cliente.dataNascimento === clienteOriginal.dataNascimento &&
            cliente.rg === clienteOriginal.rg &&
            cliente.sexo === clienteOriginal.sexo &&
            cliente.telefone === clienteOriginal.telefone &&
            cliente.endereco === clienteOriginal.endereco
        ) {
            setSoLer(true);
            return;
        }

        try {
            await axios.put("https://joaofarias16.pythonanywhere.com/cliente/" + cliente.idCliente, cliente);
            setSoLer(true);
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar dados!");
        }
    };

    useEffect(() => {
        const res = axios.get("https://joaofarias16.pythonanywhere.com/cliente/"+JSON.parse(localStorage.getItem("cliente")).idCliente); 
        setCliente(res.data);
        setClienteOriginal(res.data);
    }, []);


    return (
        <>
            <Header cliente={cliente} setCliente={setCliente} />
            {cliente &&
                <div className={styles.container}>
                    <form onSubmit={handleSubmit} className={styles.cardMatricula}>
                        <div className={styles.headerCardMatricula}>
                            <p className={styles.tituloMatricula}>Minha matrícula</p>
                            {soLer ?
                                <div onClick={toggleEdit} className={styles.btnInformacoes}>Editar informações</div> :
                                <button type="submit" className={styles.btnSalvar}>Confirmar</button>
                            }
                        </div>
                        <hr className={styles.hr}></hr>
                        <div className={styles.containerPerfil}>
                            <img className={styles.imgPerfil} alt="Perfil" src="/img/iconUser.png" />
                            <p className={styles.nomePerfil}>{cliente.nome}</p>
                        </div>
                        <div className={styles.containerDados}>
                            <div className={styles.containerInputs}>
                                <div className={styles.containerInput}>
                                    <label>Nome completo</label>
                                    <input type="text" name="nome" ref={nomeRef} className={styles.inputPerfil} value={cliente.nome} readOnly={soLer} onChange={handleChange} />
                                </div>
                                <div className={styles.containerInput}>
                                    <label>CPF</label>
                                    <input type="text" name="cpf" className={styles.inputPerfil} value={cliente.cpf} readOnly={soLer} onChange={handleChange} />
                                </div>
                                <div className={styles.containerInput}>
                                    <label>Contato de emergência</label>
                                    <input type="text" name="telefone" className={styles.inputPerfil} value={cliente.telefone} readOnly={soLer} onChange={handleChange} />
                                </div>
                            </div>
                            <div className={styles.containerInputs}>
                                <div className={styles.containerInput}>
                                    <label>Data de nascimento</label>
                                    <input type="date" name="dataNascimento" className={styles.inputPerfil} value={cliente.dataNascimento} readOnly={soLer} onChange={handleChange} />
                                </div>
                                <div className={styles.containerInput}>
                                    <label>RG</label>
                                    <input type="text" name="rg" className={styles.inputPerfil} value={cliente.rg} readOnly={soLer} onChange={handleChange} />
                                </div>
                                <div className={styles.containerInput}>
                                    <label>Email</label>
                                    <input type="text" name="email" className={styles.inputPerfil} value={cliente.email} readOnly={soLer} onChange={handleChange} />
                                </div>
                            </div>
                            <div className={styles.containerInputs}>
                                <div className={styles.containerInput}>
                                    <label>Sexo</label>
                                    <input type="text" name="sexo" className={styles.inputPerfil} value={cliente.sexo} readOnly={soLer} onChange={handleChange} />
                                </div>
                                <div className={styles.containerInput}>
                                    <label>Telefone</label>
                                    <input type="text" name="telefone" className={styles.inputPerfil} value={cliente.telefone} readOnly={soLer} onChange={handleChange} />
                                </div>
                                <div className={styles.containerInput}>
                                    <label>Endereço completo</label>
                                    <input type="text" name="endereco" className={styles.inputPerfil} value={cliente.endereco} readOnly={soLer} onChange={handleChange} />
                                </div>
                            </div>
                            <div className={styles.containerCardPlano}>
                                <label>Meu plano</label>
                                <div className={styles.cardPlano}>
                                    <div className={styles.textPlano}>{cliente.nomePlano}</div>
                                    <p className={styles.textPlano}>{cliente.descricaoPlano}</p>
                                    <div className={styles.vencimentoContainer}>
                                        <p className={styles.textPlano}>Vence em:</p>
                                        <p className={styles.vencimento}>{cliente.dataPagamento}</p>
                                    </div>
                                    <hr className={styles.hr}></hr>
                                    <div className={styles.containerPagamento}>
                                        <div className={styles.containerValor}>
                                            <p className={styles.textPlano}>Valor:</p>
                                            <p className={styles.textPlano}>R$ {cliente.valorPlano}</p>
                                        </div>
                                        {cliente.statusPagamento === "Pago" ? (
                                            <button className={styles.btnMercadoPagoDesativado}>
                                                <img alt="Mercado pago" src="/img/mercadoPagoIcon.png" className={styles.imgMercadoPago} />
                                                <p>Realizar pagamento</p>
                                            </button>
                                        ) : (
                                            <button className={styles.btnMercadoPago}>
                                                <img alt="Mercado pago" src="/img/mercadoPagoIcon.png" className={styles.imgMercadoPago} />
                                                <p>Realizar pagamento</p>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>}
            <Footer />
        </>
    )
}