import Header from "../components/Header";
import BiometriaFacial from "../components/Matricula/BiometriaFacial";
import Concluido from "../components/Matricula/Concluido";
import DadosPessoais from "../components/Matricula/DadosPessoais";
import EscolhaPlano from "../components/Matricula/EscolhaPlano"; // corrigido!
import ProgressoMatricula from "../components/Matricula/ProgressoMatricula";
import styles from "./Matricula.module.css";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Matricula(props) {

  const [dadosPessoais, setDadosPessoais] = useState("andamento");
  const [escolhaPlano, setEscolhaPlano] = useState("");
  const [biometria, setBiometria] = useState("");
  const [searchParams] = useSearchParams();
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
    endereco: ""
  });

  // 🔹 1. Quando vem via query string (Mercado Pago)
  useEffect(() => {
    const matricula = searchParams.get("external_reference");
    if (matricula) {
      setDadosPessoais("concluido");
      setEscolhaPlano("andamento");
    }
  }, [searchParams]);

  // 🔹 2. Quando o cliente é carregado
  useEffect(() => {
    if (!props.cliente) return; // evita rodar antes do carregamento

    if (props.cliente.statusPagamento === "Pago") {
      // Cliente já pagou → vai pra biometria
      setDadosPessoais("concluido");
      setEscolhaPlano("concluido");
      setBiometria("andamento");
    } else {
      // Cliente logado, mas não pagou → vai pra escolha do plano
      setDadosPessoais("concluido");
      setEscolhaPlano("andamento");
    }
  }, [props.cliente]);

  return (
    <>
      <Header cliente={props.cliente} setCliente={props.setCliente} />
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
            form={form}
            setForm={setForm}
          />
        ) : escolhaPlano === "andamento" ? (
          <EscolhaPlano
            setEscolhaPlano={setEscolhaPlano}
            setBiometria={setBiometria}
            cliente={props.cliente}
            setCliente={props.setCliente}
            form={form}
          />
        ) : biometria === "andamento" ? (
          <BiometriaFacial
            setBiometria={setBiometria}
            cliente={props.cliente}
            setCliente={props.setCliente}
          />
        ) : (
          <Concluido nome={props.cliente?.nome} />
        )}
      </div>
    </>
  );
}
