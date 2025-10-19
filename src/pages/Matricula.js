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
    const [escolhaPlano, setEscolhaPlano] = useState("andamento");
    const [biometria, setBiometria] = useState("andamento");
    const [loading, setLoading] = useState(true);

    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchCliente = async () => {
            try {
                const email = props.cliente?.email || searchParams.get("email");
                if (!email) return;

                const res = await axios.get(`https://joaofarias16.pythonanywhere.com/api/cliente/por_email?email=${email}`);
                const data = res.data;

                props.setCliente(data.cliente);

                // Atualiza etapas
                if (data.statusEtapas.dadosPessoaisConcluidos) setDadosPessoais("concluido");
                if (data.statusEtapas.planoSelecionado) setEscolhaPlano("concluido");
                if (data.statusEtapas.biometriaConcluida) setBiometria("concluido");

            } catch (err) {
                console.error("Erro ao buscar cliente:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCliente();
    }, [props.cliente, searchParams]);

    if (loading) {
        return <p className={styles.loading}>Carregando dados do cliente...</p>;
    }

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
                    <BiometriaFacial
                        setBiometria={setBiometria}
                        email={props.cliente?.email}
                    />
                ) : (
                    <p>✅ Matrícula concluída!</p>
                )}
            </div>
        </>
    );
}
