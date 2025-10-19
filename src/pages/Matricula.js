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
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);

    // 🔹 Recuperar email do localStorage caso o usuário volte do pagamento
    useEffect(() => {
        const status = searchParams.get("status");
        const email = searchParams.get("email"); // espera que a query string tenha o email do usuário

        if (status === "approved" && email) {
            setLoading(true);
            // 🔹 Recupera dados do usuário do backend via Axios
            axios.get(`/api/cliente/recuperar?email=${encodeURIComponent(email)}`)
                .then(response => {
                    const data = response.data;

                    if (data.cliente) {
                        props.setCliente(data.cliente); // atualiza cliente no estado global
                        setDadosPessoais("concluido");

                        if (data.matricula) {
                            setEscolhaPlano("concluido");

                            if (data.matricula._status === "Ativa") {
                                setBiometria("andamento"); // libera biometria
                            }
                        } else {
                            setEscolhaPlano("andamento");
                        }
                    }
                })
                .catch(error => {
                    console.error("Erro ao recuperar dados do cliente:", error);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [searchParams]);

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
                    <BiometriaFacial setBiometria={setBiometria} email={props.cliente.email}/>
                ) : null}
            </div>
        </>
    );
}
