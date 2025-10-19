import Header from "../components/Header";
import BiometriaFacial from "../components/Matricula/BiometriaFacial";
import DadosPessoais from "../components/Matricula/DadosPessoais";
import EscolhaPlano from "../components/Matricula/EscohaPlano";
import ProgressoMatricula from "../components/Matricula/ProgressoMatricula"
import styles from "./Matricula.module.css"
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Matricula() {
    const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    sexo: "",
    rg: "",
    cpf: "",
    dataNascimento: "",
    estadoCivil: "",
  });
    const [dadosPessoais, setDadosPessoais] = useState("andamento");
    const [escolhaPlano, setEscolhaPlano] = useState("");
    const [biometria, setBiometria] = useState("");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const status = searchParams.get("status");
        if(status === "approved"){
            setDadosPessoais("concluido");
            setEscolhaPlano("andamento");
        }
    }, []);
    return (
        <>
            <Header />
            <div className={styles.container}>
                <ProgressoMatricula dadosPessoais={{ dadosPessoais: dadosPessoais, setDadosPessoais: setDadosPessoais }} escolhaPlano={{ escolhaPlano: escolhaPlano, setEscolhaPlano }} biometria={{ biometria: biometria, setBiometria: setBiometria }} />
                {dadosPessoais === "andamento" ?
                    <DadosPessoais setDadosPessoais={setDadosPessoais} setEscolhaPlano={setEscolhaPlano} setForm={setForm} form={form}/>
                    : escolhaPlano === "andamento" ?
                        <EscolhaPlano setEscolhaPlano={setEscolhaPlano} setBiometria={setBiometria} form={form}/>
                        : biometria === "andamento" ?
                            <BiometriaFacial setBiometria={setBiometria} email={form.email}/>
                            : null}
            </div>
        </>
    )
}