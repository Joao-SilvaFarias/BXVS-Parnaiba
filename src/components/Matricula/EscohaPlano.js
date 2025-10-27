import { useState, useEffect } from "react";
import styles from "./EscolhaPlano.module.css";
import Plano from "./Plano";
import parseReal from "../ParseReal";
import { useLocation, useSearchParams } from "react-router-dom";
import axios from "axios";

export default function EscolhaPlano(props) {

    const [planos, setPlanos] = useState([]);
    const [planoSelecionado, setPlanoSelecionado] = useState(null);
    const [cupom, setCupom] = useState("");         // 🔹 Agora cupom é o texto digitado
    const [desconto, setDesconto] = useState(0);    // 🔹 Percentual de desconto numérico
    const [pagamento, setPagamento] = useState(false);
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const [pago, setPago] = useState(false);

    // 🔹 Buscar planos do backend
    useEffect(() => {
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

    useEffect(() => {
        if (
            props.cliente?.statusPagamento === "Pago" ||
            searchParams.get("status") === "approved"
        ) {
            setPago(true);
        }
    }, [props.cliente?.statusPagamento, searchParams]);


    // 🔹 Concluir etapa e ir para biometria
    const concluir = () => {
        props.setEscolhaPlano("concluido");
        props.setBiometria("andamento");
    };

    // 🔹 Selecionar plano
    const escolherPlano = (plano) => {
        setPlanoSelecionado(plano);
    };

    // 🔹 Calcular total com desconto
    const total = () => {
        if (!planoSelecionado) return "R$ 0,00";
        let preco = parseFloat(planoSelecionado.preco);
        if (desconto > 0) {
            preco -= (desconto / 100) * preco;
        }
        return parseReal(preco);
    };

    // 🔹 Iniciar pagamento (com salvamento do cupom e cliente)
    const iniciarPagamento = async () => {
        if (!planoSelecionado) {
            alert("Selecione um plano antes de prosseguir com o pagamento.");
            return;
        }

        if (!props.cliente.email) {
            alert("Cliente não carregado. Faça login novamente.");
            return;
        }

        try {
            const resp = await axios.get("https://joaofarias16.pythonanywhere.com/clientePorEmail/" + props.cliente.email)
            const res = await fetch(
                `https://joaofarias16.pythonanywhere.com/api/mercadopago/checkout/${planoSelecionado.idPlano}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cupom,
                        idCliente: resp.data.idCliente
                    })
                }
            );

            const data = await res.json();

            if (data && data.init_point) {
                window.location.href = data.init_point; // redireciona para o checkout
            } else {
                console.error("Erro ao criar preferência do Mercado Pago:", data);
                alert("Erro ao iniciar pagamento. Tente novamente.");
            }
        } catch (err) {
            console.error("Erro ao iniciar pagamento:", err);
            alert("Erro ao iniciar pagamento. Tente novamente.");
        }
    };

    // 🔹 Processar e verificar pagamento
    const processarEVerificarPagamento = async (payment_id, external_reference) => {
        try {
            // 1️⃣ Processa pagamento no backend
            await axios.post(
                "https://joaofarias16.pythonanywhere.com/api/mercadopago/processar_pagamento",
                { payment_id, external_reference }
            );

            // 2️⃣ Verifica se o pagamento foi aprovado
            const response = await axios.get(
                "https://joaofarias16.pythonanywhere.com/api/mercadopago/status_pagamento",
                { params: { external_reference } }
            );

            if (response.data.pago) {
                setPagamento(true);
                try {
                    const searchParams = new URLSearchParams(location.search);
                    const matricula = searchParams.get("external_reference");

                    const res = await axios.get("https://joaofarias16.pythonanywhere.com/clientePorMatricula/" + matricula);
                    const login = await axios.post("https://joaofarias16.pythonanywhere.com/login", {
                        email: res.data.email,
                        senha: res.data.senha
                    });
                    if (login.data.cliente) {
                        props.setCliente(login.data.cliente);
                        localStorage.setItem("cliente", JSON.stringify(login.data.cliente));
                        localStorage.setItem("token", login.data.token);
                    }
                } catch (err) {
                    console.error(err);
                }
            } else {
                setPagamento(false);
            }
        } catch (err) {
            console.error("Erro ao processar/verificar pagamento:", err);
            setPagamento(false);
            alert("Erro ao processar/verificar pagamento. Tente novamente.");
        }
    };

    // 🔹 Detectar retorno do checkout na URL
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const payment_id = searchParams.get("payment_id");
        const external_reference = searchParams.get("external_reference");

        if (payment_id && external_reference) {
            processarEVerificarPagamento(payment_id, external_reference);
        }
    }, [location]);

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

                    <p className={`${styles.txtPlanosDisponiveis} ${pago && styles.desativado}`}>PLANOS DISPONÍVEIS</p>
                    <div className={`${styles.planosContainer} ${pago && styles.desativado}`}>
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

                    <p className={`${styles.txtCupomDesconto} ${pago && styles.desativado}`}>CUPOM DE DESCONTO</p>
                    <input
                        type="text"
                        placeholder="Insira o cupom de desconto válido"
                        className={`${styles.inputCupomDesconto} ${pago && styles.desativado}`}
                        value={cupom}
                        onChange={event => setCupom(event.target.value)}
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