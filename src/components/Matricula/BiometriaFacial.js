import { useRef, useState, useEffect } from "react";
import * as faceapi from "face-api.js";
import styles from "./BiometriaFacial.module.css";
import { useLocation } from "react-router-dom";
import axios from "axios";

const instrucoes = [
    "Olhar frontal, rosto neutro",
    "Olhar para a esquerda",
    "Olhar para a direita",
    "Sorrindo, frontal",
    "Olhar para cima",
];

export default function BiometriaFacial({ cliente, setCliente, setBiometria }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [cameraAtiva, setCameraAtiva] = useState(false);
    const [mensagem, setMensagem] = useState("Aguardando modelos de segurança...");
    const [erro, setErro] = useState(null);
    const [instrucoesIndex, setInstrucoesIndex] = useState(0);
    const [faceEmbedding, setFaceEmbedding] = useState(null);
    const [finalizado, setFinalizado] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const location = useLocation();

    const detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.6 });

    // 🔹 Carregar modelos
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = "/models";
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                ]);
                setModelsLoaded(true);
                setMensagem("Modelos de biometria carregados. Clique em Continuar.");
            } catch (err) {
                console.error("Erro ao carregar modelos:", err);
                setErro("Erro ao carregar modelos. Verifique a pasta /models.");
            }
        };
        loadModels();
    }, []);

    // 🔹 Ativar câmera
    useEffect(() => {
        if (!cameraAtiva || !modelsLoaded) return;
        const iniciarCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 480 } });
                videoRef.current.srcObject = stream;
                await videoRef.current.play();

                if (canvasRef.current && videoRef.current) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                }
                setMensagem(`Centralize seu rosto. Inicie com: ${instrucoes[0]}`);
            } catch (err) {
                console.error(err);
                setErro("Permissão negada ou câmera não disponível. Verifique as configurações.");
                setCameraAtiva(false);
            }
        };
        iniciarCamera();

        return () => {
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraAtiva, modelsLoaded]);

    const centro = (pts) => {
        const sum = pts.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        return { x: sum.x / pts.length, y: sum.y / pts.length };
    };

    const drawDetections = (detection) => {
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const { detection: box, landmarks } = detection;

        ctx.strokeStyle = detection.detection.score > 0.8 ? "lime" : "yellow";
        ctx.lineWidth = 2;
        ctx.strokeRect(box.box.x, box.box.y, box.box.width, box.box.height);

        const left = centro(landmarks.getLeftEye());
        const right = centro(landmarks.getRightEye());
        const nose = centro(landmarks.getNose());

        ctx.fillStyle = "red";
        [left, right, nose].forEach((pt) => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            ctx.fill();
        });
    };

    const gerarEmbedding = async (videoElement) => {
        const detection = await faceapi.detectSingleFace(videoElement, detectorOptions)
            .withFaceLandmarks()
            .withFaceDescriptor();
        if (detection) return Array.from(detection.descriptor);
        return null;
    };

    // 🔹 Envio seguro da biometria
    const enviarBiometria = async (embedding) => {
        if (!cliente || !cliente.email) {
            console.error("❌ Cliente ainda não carregado. Abortando envio.");
            setErro("Erro: cliente ainda não carregado. Tente novamente.");
            return;
        }

        setMensagem("⌛ Enviando Embedding Biométrico...");
        try {
            const response = await fetch('https://joaofarias16.pythonanywhere.com/api/biometria/upload_embedding_email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: cliente.email,
                    embedding: embedding,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                console.log("Resposta da API:", data);
                setMensagem("✅ Cadastro facial concluído e enviado com sucesso!");
                setFinalizado(true);
            } else {
                console.error("Erro no envio da biometria:", data);
                setErro(`Falha ao enviar dados: ${data.message || response.statusText}`);
                setFinalizado(false);
            }
        } catch (error) {
            console.error("Erro na comunicação de rede:", error);
            setErro("Erro de rede ao tentar enviar os dados. Verifique sua conexão.");
        }
    };

    // 🔹 Validação de rosto
    const validarRosto = async () => {
        if (!cameraAtiva || finalizado || !videoRef.current) return;

        const detection = await faceapi.detectSingleFace(videoRef.current, detectorOptions)
            .withFaceLandmarks()
            .withFaceExpressions();

        if (!detection) {
            setMensagem("Rosto não detectado. Centralize seu rosto.");
            canvasRef.current?.getContext("2d")?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            return;
        }

        drawDetections(detection);

        const box = detection.detection.box;
        const boxScore = detection.detection.score;
        const landmarks = detection.landmarks;
        const expressions = detection.expressions;

        if (boxScore < 0.8) {
            setMensagem("Detecção de baixa qualidade. Tente novamente.");
            return;
        }

        const boxH = box.height;
        const minFaceHeight = videoRef.current.videoHeight * 0.25;
        if (boxH < minFaceHeight) {
            setMensagem("Aproxime-se da câmera.");
            return;
        }

        const videoCenterX = videoRef.current.videoWidth / 2;
        const faceCenterX = box.x + box.width / 2;
        if (Math.abs(faceCenterX - videoCenterX) > videoRef.current.videoWidth * 0.15) {
            setMensagem("Centralize o rosto.");
            return;
        }

        const nose = centro(landmarks.getNose());
        const noseRelX = (nose.x - (box.x + box.width / 2)) / box.width;
        const noseRelY = (nose.y - (box.y + box.height / 2)) / box.height;

        const instrucaoAtual = instrucoes[instrucoesIndex];
        let posicaoCorreta = false;

        switch (instrucaoAtual) {
            case "Olhar frontal, rosto neutro":
                posicaoCorreta = Math.abs(noseRelX) < 0.05 && expressions.neutral > 0.65;
                break;
            case "Olhar para a esquerda":
                posicaoCorreta = noseRelX > 0.06;
                break;
            case "Olhar para a direita":
                posicaoCorreta = noseRelX < -0.06;
                break;
            case "Sorrindo, frontal":
                posicaoCorreta = expressions.happy > 0.65 && Math.abs(noseRelX) < 0.08;
                break;
            case "Olhar para cima":
                posicaoCorreta = noseRelY < -0.06;
                break;
            default:
                break;
        }

        if (posicaoCorreta) {
            let embeddingParaSalvar = null;

            if (instrucoesIndex === 0) {
                embeddingParaSalvar = await gerarEmbedding(videoRef.current);
                if (embeddingParaSalvar) {
                    setFaceEmbedding(embeddingParaSalvar);
                    console.log("Embedding gerado com sucesso!");
                } else {
                    setMensagem("Falha ao gerar o código biométrico. Reposicione o rosto.");
                    return;
                }
            }

            const proximoIndex = instrucoesIndex + 1;

            if (proximoIndex === instrucoes.length) {
                setFinalizado(true);
                setCameraAtiva(false);
                if (faceEmbedding || embeddingParaSalvar) {
                    enviarBiometria(embeddingParaSalvar || faceEmbedding);
                } else {
                    setErro("Erro: embedding não gerado.");
                }
            } else {
                setInstrucoesIndex(proximoIndex);
                setMensagem(`✅ Capturado! Próxima instrução: ${instrucoes[proximoIndex]}`);
            }
        } else {
            setMensagem(`❌ Posição incorreta. ${instrucaoAtual}.`);
        }
    };

    useEffect(() => {
        if (!cameraAtiva || finalizado) return;
        const interval = setInterval(validarRosto, 1000);
        return () => clearInterval(interval);
    }, [cameraAtiva, instrucoesIndex, finalizado, faceEmbedding]);

    useEffect(() => {
        if (finalizado) setBiometria("concluido");
    }, [finalizado]);

    // 🔹 Buscar cliente automaticamente
    useEffect(() => {
        const buscarCliente = async () => {
            try {
                const searchParams = new URLSearchParams(location.search);
                const matricula = searchParams.get("external_reference");
                const res = await axios.get("https://joaofarias16.pythonanywhere.com/cliente", {
                    params: { matricula },
                });
                console.log("✅ Cliente carregado:", res.data.cliente);
                setCliente(res.data.cliente);
            } catch (error) {
                console.error("Erro ao buscar cliente:", error);
            }
        };
        buscarCliente();
    }, [location.search]);

    // 🔹 Layout (não alterado)
    return (
  <div className={styles.container}>
    <div className={styles.conteudo}>
      {cameraAtiva ? (
        <>
          <div className={styles.tituloContainer}>
            <p className={styles.txtEtapa}>3° Etapa de Verificação</p>
            <h2 className={styles.txtBiometriaFacial}>
              Biometria Facial <span className={styles.txtFoto}>{"<"} Liveness</span>
            </h2>
          </div>

          <div className={styles.containerVideo}>
            <div className={styles.boxVideo} style={{ position: "relative" }}>
              <video ref={videoRef} autoPlay playsInline muted className={styles.video} />
              <canvas
                ref={canvasRef}
                style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
              />
              <div className={styles.moldura}></div>
              <p className={styles.mensagemRosto}>{mensagem}</p>
            </div>

            <div className={styles.containerBoasPraticas}>
              <p className={styles.tituloBoasPraticas}>Requisitos de Segurança para Bancos Digitais:</p>
              <div className={styles.listaBoasPraticas}>
                <p className={styles.boaPratica}>1. Limpe a câmera do seu aparelho</p>
                <p className={styles.boaPratica}>2. Mantenha o rosto centralizado e totalmente visível na área indicada.</p>
                <p className={styles.boaPratica}>3. Esteja em um ambiente bem iluminado, evitando sombras no rosto.</p>
                <p className={styles.boaPratica}>4. Não use óculos escuros, bonés ou acessórios que cubram o rosto.</p>
                <p className={styles.boaPratica}>5. Olhe diretamente para a câmera e evite movimentos durante a captura.</p>
                <p className={styles.boaPratica}>6. Apenas uma pessoa por foto.</p>
              </div>

              <div className={styles.tirarFotoContainer}>
                <p className={styles.txtImagem}>
                  Sua biometria será tratada como **dado sensível** e usada exclusivamente para validação de identidade e controle de acesso, em total conformidade com a **LGPD**.
                </p>
                <hr className={styles.linhaImagem} />
                <p className={styles.txtInstrucaoAtual}>
                  **Instrução Atual ({instrucoesIndex + 1} de {instrucoes.length}):** **{instrucoes[instrucoesIndex]}**
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.tituloContainer}>
            <p className={styles.txtEtapa}>3° Etapa de Verificação</p>
            <h2 className={styles.txtTitulo}>Cadastro de Biometria Facial</h2>
            <p className={styles.txtDescricao}>
              Para completar sua assinatura, realize as etapas necessárias para cadastrar sua biometria facial para o ingresso em nossa academia!
            </p>
          </div>

          {/* 🔒 Botão atualizado — só habilita quando o cliente e modelos estiverem prontos */}
          <button
            className={styles.btnContinuar}
            onClick={() => modelsLoaded && cliente && setCameraAtiva(true)}
            disabled={!modelsLoaded || !cliente || finalizado}
          >
            {!modelsLoaded
              ? "Carregando Modelos..."
              : !cliente
                ? "Carregando Cliente..."
                : "Iniciar Captura Facial"}
          </button>
        </>
      )}

      {erro && (
        <p style={{ color: "red", marginTop: "10px" }}>
          ⚠️ <strong>Erro de Sistema:</strong> {erro}
        </p>
      )}
    </div>

    <p className={styles.leiDados}>
      Seus dados biométricos são classificados como dados sensíveis e serão utilizados exclusivamente para **autenticação e segurança** da sua conta, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), garantindo criptografia e confidencialidade.
    </p>
  </div>
);

}
