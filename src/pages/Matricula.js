import Header from "../components/Header";
import BiometriaFacial from "../components/Matricula/BiometriaFacial";
import DadosPessoais from "../components/Matricula/DadosPessoais";
import EscolhaPlano from "../components/Matricula/EscohaPlano";
import ProgressoMatricula from "../components/Matricula/ProgressoMatricula";
import styles from "./Matricula.module.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function Matricula(props) {
    const [dadosPessoais, setDadosPessoais] = useState("andamento");
    const [escolhaPlano, setEscolhaPlano] = useState("");
    const [biometria, setBiometria] = useState("");
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();

    // 🔹 Buscar dados do cliente no backend
    useEffect(() => {
        const fetchCliente = async () => {
            try {
                const email = props.cliente?.email || searchParams.get("email");
                if (!email) return;

                const res = await axios.get(
                    `https://joaofarias16.pythonanywhere.com/api/cliente/por_email?email=${email}`
                );

                const data = res.data;

                // Atualiza cliente global
                props.setCliente(data.cliente);

                // Atualiza etapas com base no status do cliente
                if (data.statusEtapas.dadosPessoaisConcluidos) setDadosPessoais("concluido");
                else setDadosPessoais("andamento");

                if (data.statusEtapas.planoSelecionado && !data.statusEtapas.pagamentoConcluido) {
                    setEscolhaPlano("andamento"); // usuário precisa pagar
                } else if (data.statusEtapas.planoSelecionado && data.statusEtapas.pagamentoConcluido) {
                    setEscolhaPlano("concluido");
                } else {
                    setEscolhaPlano(""); // ainda não selecionou plano
                }

                if (data.statusEtapas.biometriaConcluida) setBiometria("concluido");
                else setBiometria(""); // ainda não fez biometria
            } catch (err) {
                console.error("Erro ao buscar cliente:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCliente();
    }, [props.cliente, searchParams, props.setCliente]);

    // 🔹 Atualizar etapas ao voltar do pagamento via query param
    useEffect(() => {
        const status = searchParams.get("status");
        if (status === "approved") {
            if (dadosPessoais !== "concluido") setDadosPessoais("concluido");
            setEscolhaPlano("andamento"); // libera etapa de pagamento
        }
    }, [searchParams]);

    if (loading) return <div className={styles.container}>Carregando...</div>;

    return (
        <>
            <Header />
            <div className={styles.container}>
                <ProgressoMatricula
                    dadosPessoais={{ dadosPessoais, setDadosPessoais }}
                    escolhaPlano={{ escolhaPlano, setEscolhaPlano }}
                    biometria={{ biometria, setBiometria }}
                />

                {dadosPessoais === "andamento" ? (
                    <DadosPessoais
                        setDadosPessoais={setDadosPessoais}
                        setEscolhaPlano={setEscolhaPlano}
                        setCliente={props.setCliente}
                        cliente={props.cliente}
                    />
                ) : escolhaPlano === "andamento" ? (
                    <EscolhaPlano
                        setEscolhaPlano={setEscolhaPlano}
                        setBiometria={setBiometria}
                        cliente={props.cliente}
                    />
                ) : biometria === "andamento" ? (
                    <BiometriaFacial setBiometria={setBiometria} email={props.cliente.email} />
                ) : null}
            </div>
        </>
    );
}
