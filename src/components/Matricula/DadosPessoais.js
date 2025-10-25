import { useState } from "react";
import axios from "axios";
import styles from "./DadosPessoais.module.css";

export default function DadosPessoais(props) {
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    props.setForm({ ...props.form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dadosCliente = {
      ...props.form,
      dataCadastro: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    try {
      const res = await axios.post("https://joaofarias16.pythonanywhere.com/cliente", dadosCliente);
      console.log("Cliente cadastrado:", res.data);
      // Atualiza o fluxo de etapas (caso esteja em um fluxo de cadastro)
      if (props.setDadosPessoais && props.setEscolhaPlano) {
        props.setDadosPessoais("concluido");
        props.setEscolhaPlano("andamento");
      }
    } catch (err) {
      console.error("Erro ao cadastrar cliente:", err);
      alert("Erro ao cadastrar cliente. Verifique as informações e tente novamente.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.conteudo}>
        <div className={styles.tituloContainer}>
          <p className={styles.txtEtapa}>1° Etapa</p>
          <p className={styles.txtTitulo}>Preencha seus dados iniciais</p>
          <p className={styles.txtDescricao}>
            Essas informações são importantes para mantermos seu cadastro organizado e garantir sua integração <br />
            automática à nossa academia.
          </p>
        </div>

        <form className={styles.formContainer} onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            <p className={styles.labelInput}>Nome completo</p>
            <input
              type="text"
              name="nome"
              placeholder="Digite seu nome"
              className={styles.inputDados}
              required
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputContainer}>
            <p className={styles.labelInput}>E-mail</p>
            <input
              type="email"
              name="email"
              placeholder="Ex: aluno@bxvs.com"
              className={styles.inputDados}
              required
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputContainer}>
            <p className={styles.labelInput}>Senha</p>
            <input
              type="password"
              name="senha"
              placeholder="Crie uma senha segura"
              className={styles.inputDados}
              required
              onChange={handleChange}
            />
          </div>

          <div className={styles.contatoContainer}>
            <div className={styles.inputContainer}>
              <p className={styles.labelInput}>Telefone</p>
              <input
                type="tel"
                name="telefone"
                placeholder="(00) 00000-0000"
                className={styles.inputDados}
                required
                onChange={handleChange}
              />
            </div>

            <div className={styles.inputContainer}>
              <p className={styles.labelInput}>Sexo</p>
              <select
                name="sexo"
                className={styles.inputDados}
                onChange={handleChange}
                required
              >
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
          </div>

          <div className={styles.inputContainer}>
            <p className={styles.labelInput}>RG</p>
            <input
              type="text"
              name="rg"
              placeholder="000.000.000-0"
              className={styles.inputDados}
              required
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputContainer}>
            <p className={styles.labelInput}>CPF</p>
            <input
              type="text"
              name="cpf"
              placeholder="000.000.000-00"
              className={styles.inputDados}
              required
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputContainer}>
            <p className={styles.labelInput}>Data de nascimento</p>
            <input
              type="date"
              name="dataNascimento"
              className={styles.inputDados}
              required
              onChange={handleChange}
            />
          </div>

          <div className={styles.inputContainer}>
            <p className={styles.labelInput}>Estado civil</p>
            <select
              name="estadoCivil"
              className={styles.inputDados}
              onChange={handleChange}
              required
            >
              <option value="">Selecione...</option>
              <option value="Solteiro(a)">Solteiro(a)</option>
              <option value="Casado(a)">Casado(a)</option>
              <option value="Divorciado(a)">Divorciado(a)</option>
              <option value="Viúvo(a)">Viúvo(a)</option>
            </select>
          </div>

          <div className={styles.inputContainer}>
            <p className={styles.labelInput}>Endereço completo</p>
            <input
              type="text"
              name="endereco"
              className={styles.inputDados}
              required
              onChange={handleChange}
              placeholder="Cidade, bairro e rua"
            />
          </div>

          <button className={styles.btnContinuar} type="submit">
            Continuar
          </button>
        </form>

        <img src="/img/logo.png" alt="Logo" className={styles.logoFundo} />
      </div>

      <p className={styles.leiDados}>
        Seus dados pessoais serão utilizados exclusivamente para fins de matrícula, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018),
        garantindo segurança e confidencialidade das informações.
      </p>
    </div>
  );
}
