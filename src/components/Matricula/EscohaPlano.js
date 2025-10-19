import { useState, useEffect } from "react";
import styles from "./EscolhaPlano.module.css"
import Plano from "./Plano";
import parseReal from "../ParseReal";
import { useSearchParams } from "react-router-dom";

export default function EscolhaPlano(props) {
    const [planos, setPlanos] = useState([]);
    const [planoSelecionado, setPlanoSelecionado] = useState(null);
    const [cupom, setCupom] = useState("");
    const [pagamento, setPagamento] = useState(false);
    const [desconto, setDesconto] = useState("");
    const searchParams = useSearchParams();
    const status = searchParams.get("status");

    useEffect(() => {
        if (status === "approved") {
            setPagamento(true);
        }
    }, [status]);

    useEffect(() => {
        // Buscar planos do backend
        const fetchPlanos = async () => {
            try {
                const res = await fetch("https://joaofarias16.pythonanywhere.com/api/planos");
                const data = await res.json();
                setPlanos(data);
            } catch (err) {
                console.error("Erro ao buscar planos:", err);
            }
        };
        fetchPlanos();
    }, []);

    const concluir = () => {
        props.setEscolhaPlano("concluido");
        props.setBiometria("andamento");
    }

    const escolherPlano = (plano) => {
        setPlanoSelecionado(plano);
    }

    const total = () => {
        if (!planoSelecionado) return "R$ 0,00";
        let preco = parseFloat(planoSelecionado.preco);
        if (desconto) {
            preco -= (parseFloat(desconto) / 100) * preco;
        }
        return parseReal(preco);
    }

    const iniciarPagamento = async () => {
        if (!planoSelecionado) {
            alert("Selecione um plano antes de prosseguir com o pagamento.");
            return;
        }

        try {
            const email = localStorage.getItem("email"); // supondo que você guarda isso no login
            const res = await fetch(`https://joaofarias16.pythonanywhere.com/api/mercadopago/checkout/${planoSelecionado.idPlano}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cupom: desconto, email })
            });

            const data = await res.json();
            if (data && data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert("Erro ao iniciar pagamento.");
            }
        } catch (err) {
            console.error("Erro:", err);
        }
    };


    return (
        <div className={styles.container}>
            <div className={styles.conteudo}>
                <div className={styles.escolhaPlanoContainer}>
                    <div className={styles.tituloContainer}>
                        <p className={styles.txtEtapa}>2° Etapa</p>
                        <p className={styles.txtTitulo}>Escolha o plano que mais combina com você!</p>
                        <p className={styles.txtDescricao}>
                            Essas informações são importantes para mantermos seu cadastro organizado e garantir sua integração<br /> automática à nossa academia.
                        </p>
                    </div>

                    <p className={styles.txtPlanosDisponiveis}>PLANOS DISPONÍVEIS</p>
                    <div className={styles.planosContainer}>
                        {planos.length > 0 ? planos.map(plano => (
                            <Plano
                                key={plano.idPlano}
                                plano={planoSelecionado}
                                titulo={plano.nome}
                                descricao={plano.descricao}
                                preco={parseFloat(plano.preco)}
                                escolherPlano={() => escolherPlano(plano)}
                            />
                        )) : (
                            <p>Carregando planos...</p>
                        )}
                    </div>

                    <p className={styles.txtCupomDesconto}>CUPOM DE DESCONTO</p>
                    <input
                        type="text"
                        placeholder="Insira o cupom de desconto válido"
                        className={styles.inputCupomDesconto}
                        value={desconto}
                        onChange={event => setDesconto(event.target.value)}
                    />
                </div>

                <div className={styles.pagamentoCard}>
                    <img src="/img/mercadoPagoIcon.png" alt="Icone do mercado pago" className={styles.mercadoPagoIcon} />
                    <div className={styles.tituloPagamentoContainer}>
                        <p className={styles.tituloPagamento}>informações de Pagamento</p>
                        <p className={styles.descricaoPagamento}>Pagamento somente via mercado pago</p>
                    </div>

                    {pagamento ? (
                        <div className={styles.sucessoContainer}>
                            <img src="/img/logo.png" alt="Logo" className={styles.logoSucesso} />
                            <p className={styles.txtSucesso}>Compra efetuada com sucesso!</p>
                        </div>
                    ) : (
                        <>
                            <div className={styles.dadosPagamentoContainer}>
                                <div className={styles.dadosLado}>
                                    <div>
                                        <p className={styles.labelDados}>Plano:</p>
                                        <p className={styles.txtDado}>{planoSelecionado ? planoSelecionado.nome : "Nenhum escolhido"}</p>
                                    </div>
                                    <div>
                                        <p className={styles.labelDados}>Cupom de desconto:</p>
                                        <p className={styles.txtDado}>{cupom ? cupom : "Nenhum cupom"}</p>
                                    </div>
                                </div>
                                <div className={styles.linhaVertical}></div>
                                <div className={styles.dadosLado}>
                                    <div>
                                        <p className={styles.labelDados}>Preço:</p>
                                        <p className={styles.txtDado}>{planoSelecionado ? parseReal(planoSelecionado.preco) : "Nenhum escolhido"}</p>
                                    </div>
                                    <div>
                                        <p className={styles.labelDados}>Porcentagem de desconto:</p>
                                        <p className={styles.txtDado}>{desconto ? `${desconto}%` : "0%"}</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.totalContainer}>
                                <p className={styles.tituloTotal}>Total:</p>
                                <p className={styles.txtTotal}>{total()}</p>
                            </div>

                            <div className={styles.realizarPagamentoContainer}>
                                <p className={styles.labelRealizarPagamento}>Realizar pagamento</p>
                                <button className={styles.btnMercadoPago} onClick={iniciarPagamento}>
                                    <img className={styles.mercadoPagoBotaoImg} src="/img/mercadoPagoBotao.png" alt="Mercado pago" />
                                </button>
                            </div>
                        </>
                    )}

                    <div className={styles.continuarContainer}>
                        {pagamento ? (
                            <button className={styles.btnContinuar} onClick={concluir}>Continuar</button>
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
                Seus dados pessoais serão utilizados exclusivamente para fins de matrícula, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), garantindo segurança e confidencialidade das informações.
            </p>
        </div>
    );
}
