import { useState, useEffect } from "react";
import styles from "./EscolhaPlano.module.css";
import Plano from "./Plano";
import parseReal from "../ParseReal";

export default function EscolhaPlano(props) {
    const [planos, setPlanos] = useState([]);
    const [planoSelecionado, setPlanoSelecionado] = useState(null);
    const [desconto, setDesconto] = useState("");
    const [pagamento, setPagamento] = useState(false);
    const [validando, setValidando] = useState(false);

    // ===== useEffect: busca planos e valida pagamento =====
    useEffect(() => {
        buscarPlanos();
        validarPagamentoURL();
    }, []);

    // ===== Funções Auxiliares =====
    const buscarPlanos = async () => {
        try {
            const res = await fetch("https://joaofarias16.pythonanywhere.com/api/planos");
            const data = await res.json();
            setPlanos(data);
        } catch (err) {
            console.error("Erro ao buscar planos:", err);
        }
    };

    const validarPagamentoURL = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get("payment_id");
        const status = urlParams.get("status");

        if (!paymentId && status !== "approved") return;

        try {
            setValidando(true);
            let pago = false;

            if (paymentId) {
                // Valida no backend pelo payment_id
                const res = await fetch(
                    `https://joaofarias16.pythonanywhere.com/api/mercadopago/validar/${paymentId}`
                );
                const data = await res.json();
                if (data.status === "approved") pago = true;
            } else if (status === "approved") {
                // fallback caso não tenha payment_id
                pago = true;
            }

            setPagamento(pago);
            if (pago) console.log("Pagamento aprovado!");
        } catch (err) {
            console.error("Erro ao validar pagamento:", err);
            setPagamento(false);
        } finally {
            setValidando(false);
            // Limpa a URL para não validar de novo
            window.history.replaceState(null, null, window.location.pathname);
        }
    };

    const escolherPlano = (plano) => setPlanoSelecionado(plano);

    const calcularTotal = () => {
        if (!planoSelecionado) return "R$ 0,00";
        let preco = parseFloat(planoSelecionado.preco);
        if (desconto) {
            const valorDesconto = parseFloat(desconto);
            if (!isNaN(valorDesconto)) preco -= (valorDesconto / 100) * preco;
        }
        return parseReal(preco);
    };

    const iniciarPagamento = async () => {
        if (!planoSelecionado) {
            alert("Selecione um plano antes de prosseguir com o pagamento.");
            return;
        }

        try {
            const res = await fetch(
                `https://joaofarias16.pythonanywhere.com/api/mercadopago/checkout/${planoSelecionado.idPlano}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ cupom: desconto }),
                }
            );
            const data = await res.json();

            if (data?.init_point) {
                window.location.href = data.init_point;
            } else {
                console.error("Erro ao criar preferência do Mercado Pago:", data);
                alert("Erro ao iniciar pagamento. Tente novamente.");
            }
        } catch (err) {
            console.error("Erro ao iniciar pagamento:", err);
            alert("Erro ao iniciar pagamento. Tente novamente.");
        }
    };

    const concluir = () => {
        if (!pagamento) return alert("Você precisa finalizar o pagamento antes de continuar.");
        props.setEscolhaPlano("concluido");
        props.setBiometria("andamento");
    };

    // ===== JSX =====
    return (
        <div className={styles.container}>
            <div className={styles.conteudo}>
                {/* ===== Seção de Escolha do Plano ===== */}
                <div className={styles.escolhaPlanoContainer}>
                    <div className={styles.tituloContainer}>
                        <p className={styles.txtEtapa}>2° Etapa</p>
                        <p className={styles.txtTitulo}>Escolha o plano que mais combina com você!</p>
                        <p className={styles.txtDescricao}>
                            Essas informações são importantes para mantermos seu cadastro organizado e garantir sua integração
                            <br /> automática à nossa academia.
                        </p>
                    </div>

                    <p className={styles.txtPlanosDisponiveis}>PLANOS DISPONÍVEIS</p>
                    <div className={styles.planosContainer}>
                        {planos.length > 0 ? (
                            planos.map((plano) => (
                                <Plano
                                    key={plano.idPlano}
                                    plano={planoSelecionado}
                                    titulo={plano.nome}
                                    descricao={plano.descricao}
                                    preco={parseFloat(plano.preco)}
                                    escolherPlano={() => escolherPlano(plano)}
                                />
                            ))
                        ) : (
                            <p>Carregando planos...</p>
                        )}
                    </div>

                    <p className={styles.txtCupomDesconto}>CUPOM DE DESCONTO</p>
                    <input
                        type="text"
                        placeholder="Insira o cupom de desconto válido"
                        className={styles.inputCupomDesconto}
                        value={desconto}
                        onChange={(e) => setDesconto(e.target.value)}
                    />
                </div>

                {/* ===== Seção de Pagamento ===== */}
                <div className={styles.pagamentoCard}>
                    <img src="/img/mercadoPagoIcon.png" alt="Ícone Mercado Pago" className={styles.mercadoPagoIcon} />
                    <div className={styles.tituloPagamentoContainer}>
                        <p className={styles.tituloPagamento}>Informações de Pagamento</p>
                        <p className={styles.descricaoPagamento}>Pagamento somente via Mercado Pago</p>
                    </div>

                    {validando ? (
                        <p>Validando pagamento...</p>
                    ) : pagamento ? (
                        <div className={styles.sucessoContainer}>
                            <img src="/img/logo.png" alt="Logo" className={styles.logoSucesso} />
                            <p className={styles.txtSucesso}>Compra efetuada com sucesso!</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.dadosPagamentoContainer}>
                                <div className={styles.dadosLado}>
                                    <p className={styles.labelDados}>Plano:</p>
                                    <p className={styles.txtDado}>{planoSelecionado?.nome || "Nenhum escolhido"}</p>

                                    <p className={styles.labelDados}>Cupom de desconto:</p>
                                    <p className={styles.txtDado}>{desconto || "Nenhum cupom"}</p>
                                </div>

                                <div className={styles.linhaVertical}></div>

                                <div className={styles.dadosLado}>
                                    <p className={styles.labelDados}>Preço:</p>
                                    <p className={styles.txtDado}>
                                        {planoSelecionado ? parseReal(planoSelecionado.preco) : "Nenhum escolhido"}
                                    </p>

                                    <p className={styles.labelDados}>Porcentagem de desconto:</p>
                                    <p className={styles.txtDado}>{desconto ? `${desconto}%` : "0%"}</p>
                                </div>
                            </div>

                            <div className={styles.totalContainer}>
                                <p className={styles.tituloTotal}>Total:</p>
                                <p className={styles.txtTotal}>{calcularTotal()}</p>
                            </div>

                            <div className={styles.realizarPagamentoContainer}>
                                <p className={styles.labelRealizarPagamento}>Realizar pagamento</p>
                                <button className={styles.btnMercadoPago} onClick={iniciarPagamento}>
                                    <img
                                        className={styles.mercadoPagoBotaoImg}
                                        src="/img/mercadoPagoBotao.png"
                                        alt="Mercado Pago"
                                    />
                                </button>
                            </div>
                        </>
                    )}

                    <div className={styles.continuarContainer}>
                        {pagamento ? (
                            <button className={styles.btnContinuar} onClick={concluir}>
                                Continuar
                            </button>
                        ) : (
                            <>
                                <p className={styles.txtContinuar}>Realize o pagamento para continuar</p>
                                <button className={styles.btnContinuarDesativado}>Continuar</button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <p className={styles.leiDados}>
                Seus dados pessoais serão utilizados exclusivamente para fins de matrícula, em conformidade com a Lei
                Geral de Proteção de Dados (Lei nº 13.709/2018), garantindo segurança e confidencialidade das informações.
            </p>
        </div>
    );
}
