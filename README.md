# Quadro de Tarefas da Equipe

## 1. Identificação

- **Projeto:** Quadro de Tarefas da Equipe (Tema 5)
- **Integrantes:** Samyr Farias
- **Disciplina:** Programação Web
- **Unidade:** I (front-end) - Projeto AV1
- **Turma:** CCO, 6º período

## 2. Descrição

Aplicação web para distribuir e acompanhar as tarefas de uma equipe. O usuário
(um membro ou coordenador da equipe) cadastra tarefas, vê quantas estão a fazer,
em andamento ou concluídas e atualiza o andamento de cada uma sem recarregar a
página. A finalidade é dar à equipe uma visão rápida do que precisa ser feito e
de quem é responsável por cada item.

## 3. Funcionalidades

- **Dashboard** com total de tarefas e contagem por status, calculados pelo JavaScript.
- **Listagem** em cards (status, título, responsável, categoria, prioridade e prazo).
- **Cadastro com validação em JavaScript:** campos obrigatórios, tamanho mínimo
  (título 3, responsável 2, descrição 10 caracteres), valores válidos para
  categoria, prioridade e status, data válida e mensagens de erro por campo.
- **Atualização via DOM:** a nova tarefa entra na lista e o dashboard é recalculado.
- **Alteração de status** por um `select` em cada card.
- **Busca textual** por título ou responsável (ignora acentos e maiúsculas) e
  **filtros** por status e prioridade, com botão "Limpar filtros".
- **Detalhes completos** da tarefa em uma janela modal (`<dialog>`).
- **Destaque de tarefa atrasada:** prazo vencido e status diferente de "Feito"
  ganha borda vermelha e o aviso "Prazo vencido".
- **Carregamento assíncrono simulado** dos dados iniciais.
- **Layout responsivo** para computador e telas menores.

## 4. Tecnologias

- HTML5 (elementos semânticos, `dialog`, formulários com `label`)
- CSS3 (Grid, Flexbox, variáveis CSS, media query)
- JavaScript puro (DOM, eventos, `Promise`, `async/await`)
- Git e GitHub

Nenhuma biblioteca ou framework externo foi usado.

## 5. Estrutura do projeto

```
/
├── index.html      # estrutura da página (resumo, formulário, filtros, lista, modal)
├── css/
│   └── style.css   # apresentação, responsividade e estados visuais
├── js/
│   └── app.js      # dados, renderização, filtros, validação e assíncrono
└── README.md
```

## 6. Como executar

1. Baixe ou clone o repositório: `git clone https://github.com/SamyrFarias/quadro-de-tarefas.git`
2. Abra o arquivo `index.html` em qualquer navegador moderno (duplo clique).

Não é preciso instalar nada nem iniciar servidor. Ao abrir, aguarde cerca de 1
segundo: as tarefas iniciais aparecem após o carregamento simulado.

## 7. Histórico de desenvolvimento

O projeto foi desenvolvido individualmente e enviado ao GitHub com todas as
funcionalidades já prontas, em um commit inicial na `main`. A ordem em que as
partes foram construídas foi:

1. HTML e CSS base, dados em memória e listagem em cards.
2. Dashboard com contadores calculados a partir do array.
3. Formulário de cadastro com validação em JavaScript.
4. Alteração de status no card.
5. Busca textual e filtros por status e prioridade.
6. Modal com os detalhes da tarefa.
7. Carregamento simulado com `Promise` e `async/await`.

Como o desenvolvimento aconteceu localmente, sem versionar etapa por etapa, o
histórico de branches não reflete essa ordem. Ajustes posteriores ao envio
foram feitos em branches separadas.

**Dificuldades e soluções:** ao publicar no GitHub, o Git não estava instalado
no computador e o terminal retornava `CommandNotFoundException`. Resolvi
instalando o Git e reabrindo o VS Code para o terminal reconhecer o comando.
Depois, o primeiro commit falhou por falta de identidade (`user.name` e
`user.email`), o que também impediu o `push`. Configurei os dois com
`git config --global` e repeti o commit e o envio.

**Divisão em dupla:** o projeto foi feito individualmente.

## 8. Decisões técnicas

1. **Validação em JavaScript, com `novalidate` no formulário.** Assim as regras
   (tamanho mínimo, valores permitidos) e as mensagens ficam sob controle do
   código, em vez de depender só do `required` do navegador.
2. **Cards em vez de tabela.** Cada tarefa tem vários campos e os cards se
   adaptam melhor a telas pequenas, além de comportar o seletor de status e o
   botão de detalhes.
3. **Renderização separada dos dados.** O array `tarefas` guarda o estado e as
   funções `renderizarLista` e `renderizarDashboard` apenas desenham a tela.
   Toda mudança altera o array e chama `atualizarTela()`.
4. **`textContent` em vez de `innerHTML`** para dados digitados pelo usuário,
   evitando que HTML inserido nos campos seja interpretado.
5. **ID incremental** (`proximoId`) em vez de `Date.now()`, para manter o número
   da tarefa simples e sequencial.
6. **Foco devolvido após mudar o status.** Como `atualizarTela()` recria os
   cards, o `select` que estava em foco deixaria de existir. Cada `select`
   recebe `data-id` e, após a atualização, o foco volta ao da mesma tarefa, o que
   mantém a navegação por teclado.
7. **Comparação de datas como texto.** Datas no formato `AAAA-MM-DD` têm a ordem
   alfabética igual à cronológica, então o prazo é comparado com a data de hoje
   sem `Date`, evitando problemas de fuso horário.

## 9. Programação assíncrona

1. **Onde existe?** No carregamento inicial das tarefas (`carregarRegistros` e
   `iniciarAplicacao`, em `js/app.js`).
2. **Qual operação representa?** Uma busca de dados em um servidor, simulada com
   `setTimeout` de 1 segundo.
3. **Onde são usados `Promise`, `async` e `await`?** `carregarRegistros()`
   retorna uma `Promise` que resolve após o `setTimeout`. `iniciarAplicacao()` é
   `async` e usa `await` para esperar os dados antes de desenhar a tela, com
   `try/catch/finally` para tratar falhas (se a Promise for rejeitada, aparece
   "Não foi possível carregar as tarefas." e o botão volta a ser habilitado).
4. **O que aparece na interface durante a operação?** A mensagem "Carregando
   tarefas..." na área da lista, e o botão "Cadastrar tarefa" fica desabilitado
   até os dados chegarem.

## 10. Limitações e melhorias futuras

**Ainda não faz:**
- Os dados ficam só em memória: ao recarregar a página, voltam ao estado inicial.
- Não é possível editar nem excluir uma tarefa.
- Não há login nem níveis de acesso.

**Com mais tempo:** persistência (`localStorage` ou banco de dados), API real no
lugar da simulação, autenticação, notificações de prazo próximo e integração
com e-mail.

## 11. Uso de IA

| Data | Descrição do modelo | Prompt utilizado | Onde foi usado |
|---|---|---|---|
| 07/10/2026 | Claude, chat | Pedi para comparar o projeto com o enunciado da AV1 e apontar o que faltava; depois pedi os ajustes finais e melhorias. | Revisão geral e ajustes em `js/app.js` e `css/style.css`. |

**O que foi revisado ou adaptado:** Revisei as mudanças sugeridas em `js/app.js`
(uso de `replaceAll`, rejeição da `Promise` no `catch`, revalidação do campo ao
digitar, ocultação da mensagem de sucesso, foco após mudar status, dashboard com
zeros no carregamento, destaque de atraso e atributos `aria` nos erros) e testei
o comportamento no navegador. Os comandos de Git foram executados por mim e o
texto do README foi conferido para refletir o que de fato existe no repositório.