import Header from "../components/Header";
import BiometriaFacial from "../components/Matricula/BiometriaFacial";
import DadosPessoais from "../components/Matricula/DadosPessoais";
import EscolhaPlano from "../components/Matricula/EscohaPlano";
import ProgressoMatricula from "../components/Matricula/ProgressoMatricula";
import styles from "./Matricula.module.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Matricula(props) {

    const [dadosPessoais, setDadosPessoais] = useState("andamento");
    const [escolhaPlano, setEscolhaPlano] = useState("");
    const [biometria, setBiometria] = useState("");
    const [searchParams] = useSearchParams();

    // 🔹 Recuperar email do localStorage caso o usuário volte do pagamento
    useEffect(() => {

        const status = searchParams.get("status");
        if (status === "approved") {
            // Se a etapa de dados pessoais já estiver concluída, passar para escolha do plano
            if (dadosPessoais !== "concluido") setDadosPessoais("concluido");
            setEscolhaPlano("andamento"); // marca plano como concluído// libera etapa de biometria
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
                    <BiometriaFacial setBiometria={setBiometria} cliente={props.cliente} setCliente={props.setCliente}/>
                ) : null}
            </div>
        </>
    );
}
