// ===== 1. DADOS =====
// Valores permitidos (usados na validação e na troca de status).
const CATEGORIAS = ["Estudo", "Projeto", "Reunião"];
const PRIORIDADES = ["Baixa", "Média", "Alta"];
const STATUS = ["A fazer", "Fazendo", "Feito"];

// Dados que a "API simulada" devolve no carregamento inicial.
const registrosIniciais = [
  {
    id: 1,
    titulo: "Montar o layout da página inicial",
    descricao: "Criar o HTML e o CSS base do projeto.",
    categoria: "Projeto",
    prioridade: "Alta",
    responsavel: "Ana",
    status: "Fazendo",
    prazo: "2026-10-08"
  },
  {
    id: 2,
    titulo: "Estudar eventos do DOM",
    descricao: "Revisar addEventListener e delegação de eventos.",
    categoria: "Estudo",
    prioridade: "Média",
    responsavel: "Bruno",
    status: "A fazer",
    prazo: "2026-10-10"
  },
  {
    id: 3,
    titulo: "Reunião de alinhamento",
    descricao: "Definir quem faz cada parte do projeto.",
    categoria: "Reunião",
    prioridade: "Baixa",
    responsavel: "Ana",
    status: "Feito",
    prazo: "2026-10-05"
  }
];

// Estado da aplicação (em memória): começa vazio e é preenchido pelo carregamento assíncrono.
let tarefas = [];
let proximoId = 1;

// ===== 2. REFERÊNCIAS AO DOM =====
const listaTarefas = document.getElementById("lista-tarefas");
const mensagemLista = document.getElementById("mensagem-lista");
const formulario = document.getElementById("form-tarefa");
const mensagemForm = document.getElementById("mensagem-form");
const botaoCadastrar = formulario.querySelector("button[type='submit']");
const campoBusca = document.getElementById("busca");
const filtroStatus = document.getElementById("filtro-status");
const filtroPrioridade = document.getElementById("filtro-prioridade");
const botaoLimpar = document.getElementById("limpar-filtros");
const modal = document.getElementById("modal-detalhes");

// ===== 3. FUNÇÕES AUXILIARES =====

// "2026-10-08" -> "08/10/2026" (sem usar Date, evita problema de fuso horário).
function formatarData(dataIso) {
  const [ano, mes, dia] = dataIso.split("-");
  return `${dia}/${mes}/${ano}`;
}

// "A fazer" -> "a-fazer" (usado em classes CSS e ids).
function classeDoStatus(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

// Tira acentos e maiúsculas para a busca ("reuniao" encontra "Reunião").
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Data de hoje no formato "AAAA-MM-DD" (horário local), para comparar com o prazo.
function hojeIso() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

// Uma tarefa está atrasada se o prazo já passou e ela ainda não foi concluída.
// Datas ISO podem ser comparadas como texto, pois a ordem alfabética = ordem cronológica.
function estaAtrasada(tarefa) {
  return tarefa.status !== "Feito" && tarefa.prazo < hojeIso();
}

// ===== 4. PROGRAMAÇÃO ASSÍNCRONA =====

// Simula uma chamada a um servidor: devolve uma Promise que resolve após 1 segundo.
// Se algo der errado ao copiar os dados, a Promise é rejeitada e o catch de
// iniciarAplicacao() mostra a mensagem de erro na tela.
function carregarRegistros() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(registrosIniciais.map((t) => ({ ...t })));
      } catch (erro) {
        reject(erro);
      }
    }, 1000);
  });
}

// Mostra "carregando", espera os dados com await e só então desenha a tela.
async function iniciarAplicacao() {
  mensagemLista.textContent = "Carregando tarefas...";
  mensagemLista.hidden = false;
  botaoCadastrar.disabled = true;
  renderizarDashboard([]); // mostra zeros enquanto os dados não chegam

  try {
    tarefas = await carregarRegistros();
    proximoId = Math.max(0, ...tarefas.map((t) => t.id)) + 1;
    atualizarTela();
  } catch (erro) {
    mensagemLista.textContent = "Não foi possível carregar as tarefas.";
  } finally {
    botaoCadastrar.disabled = false;
  }
}

// ===== 5. RENDERIZAÇÃO =====

// Cria um <p> com rótulo em negrito e o valor como texto (seguro contra HTML digitado).
function criarLinha(rotulo, valor) {
  const p = document.createElement("p");
  const negrito = document.createElement("strong");
  negrito.textContent = `${rotulo}: `;
  p.append(negrito, valor);
  return p;
}

// Cria o <li> (card) de uma tarefa.
function criarCard(tarefa) {
  const item = document.createElement("li");
  item.className = "card";
  const atrasada = estaAtrasada(tarefa);
  if (atrasada) item.classList.add("atrasada");

  const selo = document.createElement("span");
  selo.className = `selo ${classeDoStatus(tarefa.status)}`;
  selo.textContent = tarefa.status;

  const titulo = document.createElement("h3");
  titulo.textContent = tarefa.titulo;

  // Botão de detalhes
  const botaoDetalhes = document.createElement("button");
  botaoDetalhes.type = "button";
  botaoDetalhes.className = "botao botao-secundario botao-pequeno";
  botaoDetalhes.textContent = "Ver detalhes";
  botaoDetalhes.addEventListener("click", () => abrirDetalhes(tarefa));

  // Seletor para mudar o status
  const rotulo = document.createElement("label");
  rotulo.className = "troca-status";
  rotulo.textContent = "Mudar status: ";

  const seletor = document.createElement("select");
  seletor.dataset.id = tarefa.id; // permite devolver o foco a este select depois de redesenhar
  STATUS.forEach((opcao) => {
    const option = document.createElement("option");
    option.value = opcao;
    option.textContent = opcao;
    option.selected = opcao === tarefa.status;
    seletor.appendChild(option);
  });
  seletor.addEventListener("change", () => atualizarStatus(tarefa.id, seletor.value));
  rotulo.appendChild(seletor);

  const acoes = document.createElement("div");
  acoes.className = "card-acoes";
  acoes.append(botaoDetalhes, rotulo);

  item.append(
    selo,
    titulo,
    criarLinha("Responsável", tarefa.responsavel),
    criarLinha("Categoria", tarefa.categoria),
    criarLinha("Prioridade", tarefa.prioridade),
    criarLinha("Prazo", formatarData(tarefa.prazo)),
    acoes
  );

  // O aviso também é texto (não depende só da cor) para ser acessível.
  if (atrasada) {
    const aviso = document.createElement("p");
    aviso.className = "aviso-atraso";
    aviso.textContent = "Prazo vencido";
    item.insertBefore(aviso, acoes);
  }
  return item;
}

// Desenha a lista (já filtrada). Sempre limpa antes para não duplicar cards.
function renderizarLista(lista) {
  listaTarefas.innerHTML = "";

  if (lista.length === 0) {
    mensagemLista.textContent = tarefas.length === 0
      ? "Nenhuma tarefa cadastrada."
      : "Nenhuma tarefa encontrada com esses filtros.";
    mensagemLista.hidden = false;
    return;
  }

  mensagemLista.hidden = true;
  lista.forEach((tarefa) => listaTarefas.appendChild(criarCard(tarefa)));
}

// Dashboard: calculado sobre TODAS as tarefas (não só as filtradas).
function renderizarDashboard(lista) {
  document.getElementById("total-tarefas").textContent = lista.length;

  STATUS.forEach((status) => {
    const quantidade = lista.filter((tarefa) => tarefa.status === status).length;
    document.getElementById(`contagem-${classeDoStatus(status)}`).textContent = quantidade;
  });
}

// Redesenha tudo: lista com filtros aplicados + dashboard.
function atualizarTela() {
  renderizarLista(obterTarefasFiltradas());
  renderizarDashboard(tarefas);
}

// ===== 6. BUSCA E FILTROS =====

function obterTarefasFiltradas() {
  const termo = normalizar(campoBusca.value.trim());

  return tarefas.filter((tarefa) => {
    const bateTexto =
      normalizar(tarefa.titulo).includes(termo) ||
      normalizar(tarefa.responsavel).includes(termo);
    const bateStatus = filtroStatus.value === "" || tarefa.status === filtroStatus.value;
    const batePrioridade = filtroPrioridade.value === "" || tarefa.prioridade === filtroPrioridade.value;
    return bateTexto && bateStatus && batePrioridade;
  });
}

campoBusca.addEventListener("input", atualizarTela);
filtroStatus.addEventListener("change", atualizarTela);
filtroPrioridade.addEventListener("change", atualizarTela);
botaoLimpar.addEventListener("click", () => {
  campoBusca.value = "";
  filtroStatus.value = "";
  filtroPrioridade.value = "";
  atualizarTela();
});

// ===== 7. ALTERAÇÃO DE STATUS =====

function atualizarStatus(id, novoStatus) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa || !STATUS.includes(novoStatus)) return;

  tarefa.status = novoStatus;
  atualizarTela();

  // Os cards foram recriados: devolve o foco ao select da mesma tarefa (teclado).
  const seletor = listaTarefas.querySelector(`select[data-id="${id}"]`);
  if (seletor) seletor.focus();
}

// ===== 8. DETALHES (modal) =====

function abrirDetalhes(tarefa) {
  document.getElementById("detalhes-titulo").textContent = tarefa.titulo;

  const lista = document.getElementById("detalhes-lista");
  lista.innerHTML = "";

  const campos = [
    ["ID", tarefa.id],
    ["Descrição", tarefa.descricao],
    ["Categoria", tarefa.categoria],
    ["Prioridade", tarefa.prioridade],
    ["Responsável", tarefa.responsavel],
    ["Status", tarefa.status],
    ["Prazo", formatarData(tarefa.prazo)]
  ];

  campos.forEach(([nome, valor]) => {
    const dt = document.createElement("dt");
    dt.textContent = nome;
    const dd = document.createElement("dd");
    dd.textContent = valor;
    lista.append(dt, dd);
  });

  modal.showModal();
}

document.getElementById("fechar-detalhes").addEventListener("click", () => modal.close());
// Clicar fora da caixa (no fundo escuro) também fecha.
modal.addEventListener("click", (evento) => {
  if (evento.target === modal) modal.close();
});

// ===== 9. FORMULÁRIO E VALIDAÇÃO =====

// Regras de cada campo: obrigatório, tamanho mínimo, valores válidos, data válida.
const REGRAS = [
  { id: "titulo", vazio: "Informe o título.", min: 3, curto: "O título deve ter pelo menos 3 caracteres." },
  { id: "responsavel", vazio: "Informe o responsável.", min: 2, curto: "O nome do responsável deve ter pelo menos 2 caracteres." },
  { id: "descricao", vazio: "Informe a descrição.", min: 10, curto: "A descrição deve ter pelo menos 10 caracteres." },
  { id: "categoria", vazio: "Selecione a categoria.", validos: CATEGORIAS },
  { id: "prioridade", vazio: "Selecione a prioridade.", validos: PRIORIDADES },
  { id: "status", vazio: "Selecione o status.", validos: STATUS },
  { id: "prazo", vazio: "Informe o prazo.", data: true }
];

function mostrarErro(id, texto) {
  const campo = document.getElementById(id);
  document.getElementById(`erro-${id}`).textContent = texto;
  campo.classList.toggle("invalido", texto !== "");
  campo.setAttribute("aria-invalid", texto !== "" ? "true" : "false");
  campo.setAttribute("aria-describedby", `erro-${id}`);
}

// Devolve a mensagem de erro do campo ("" se estiver válido).
function validarCampo(regra) {
  const valor = document.getElementById(regra.id).value.trim();

  if (valor === "") return regra.vazio;
  if (regra.min && valor.length < regra.min) return regra.curto;
  if (regra.validos && !regra.validos.includes(valor)) return "Selecione uma opção válida.";
  if (regra.data && (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || Number.isNaN(Date.parse(valor)))) {
    return "Informe uma data válida.";
  }
  return "";
}

function validarFormulario() {
  let valido = true;
  REGRAS.forEach((regra) => {
    const erro = validarCampo(regra);
    mostrarErro(regra.id, erro);
    if (erro !== "") valido = false;
  });
  return valido;
}

// Ao digitar/alterar um campo: esconde a mensagem de sucesso e, se o campo estava
// com erro, revalida na hora (o erro some assim que o valor ficar correto).
function aoAlterarCampo(evento) {
  mensagemForm.hidden = true;

  const regra = REGRAS.find((r) => r.id === evento.target.id);
  if (regra && evento.target.classList.contains("invalido")) {
    mostrarErro(regra.id, validarCampo(regra));
  }
}
formulario.addEventListener("input", aoAlterarCampo);
formulario.addEventListener("change", aoAlterarCampo);

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault(); // impede o recarregamento da página

  if (!validarFormulario()) {
    mensagemForm.hidden = true;
    return;
  }

  tarefas.push({
    id: proximoId++,
    titulo: document.getElementById("titulo").value.trim(),
    responsavel: document.getElementById("responsavel").value.trim(),
    descricao: document.getElementById("descricao").value.trim(),
    categoria: document.getElementById("categoria").value,
    prioridade: document.getElementById("prioridade").value,
    status: document.getElementById("status").value,
    prazo: document.getElementById("prazo").value
  });

  atualizarTela();
  formulario.reset();
  mensagemForm.textContent = "Tarefa cadastrada com sucesso!";
  mensagemForm.hidden = false;
});

// ===== 10. INICIALIZAÇÃO =====
iniciarAplicacao();