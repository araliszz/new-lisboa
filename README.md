# TaskDLA — Gerenciador de Tarefas

Aplicação web para organizar tarefas do dia a dia, desenvolvida com **HTML5, CSS3 e JavaScript puro** como atividade acadêmica de Desenvolvimento Web.

🔗 **Demonstração online:** https://araliszz.github.io/new-lisboa/

---

## 📌 Descrição

O TaskFlow é um gerenciador de tarefas com layout de *dashboard*. O usuário cadastra tarefas com título, descrição e prioridade, acompanha o andamento por indicadores e encontra o que precisa com filtros e pesquisa.

Tudo funciona diretamente no navegador, sem servidor, banco de dados ou API externa:

- As tarefas ficam salvas no **`localStorage`** do navegador, então continuam lá depois de atualizar ou fechar a página.
- A preferência de tema (claro ou escuro) também é salva. Na primeira visita, o tema segue a configuração do sistema operacional.
- A interface se adapta a computadores, tablets e celulares. Em telas pequenas, a barra lateral vira uma faixa de filtros no topo.

## ✨ Funcionalidades

- ➕ **Criar tarefas** com título, descrição opcional e prioridade (alta, média ou baixa).
- ✏️ **Editar tarefas** em uma janela modal.
- 🗑️ **Excluir tarefas**, com confirmação antes de remover.
- ✅ **Marcar como concluída** ou voltar para pendente.
- 🔺 **Organizar por prioridade**, além de ordenar por mais recentes, mais antigas ou ordem alfabética.
- 🔎 **Filtrar** por situação (todas, pendentes, concluídas) e por prioridade.
- 🔍 **Pesquisar pelo nome**, ignorando acentos e maiúsculas, com destaque do termo encontrado.
- 📊 **Indicadores**: total, pendentes, concluídas e barra de progresso.
- 💾 **Armazenamento local** com `localStorage`.
- 🌗 **Tema claro e escuro**.
- 📱 **Design responsivo**, com animações discretas que respeitam a opção de reduzir movimento do sistema.

## 🛠️ Tecnologias utilizadas

| Tecnologia | Uso |
|---|---|
| **HTML5** | Estrutura semântica da página (`aside`, `main`, `section`, `dialog`) |
| **CSS3** | Estilização, variáveis CSS para os temas, Grid, Flexbox, animações e media queries |
| **JavaScript (ES6+)** | Interatividade, manipulação do DOM e persistência com `localStorage` |
| **Git** | Controle de versão |
| **GitHub / GitHub Pages** | Hospedagem do código e da demonstração online |

Não foram usados frameworks nem bibliotecas. A fonte *Plus Jakarta Sans* vem do Google Fonts; sem internet, a página usa a fonte do sistema.

## 📁 Estrutura de pastas

```
new-lisboa/
├── index.html          # Estrutura da página
├── README.md           # Documentação do projeto
├── .gitignore          # Arquivos ignorados pelo Git
├── css/
│   └── style.css       # Estilos, temas e responsividade
├── js/
│   └── script.js       # Lógica da aplicação
└── assets/
    └── icons/
        └── favicon.svg # Ícone e logotipo
```

## ▶️ Como executar

**Opção 1: online**

Acesse https://araliszz.github.io/new-lisboa/

**Opção 2: no computador**

1. Clone o repositório:
   ```bash
   git clone https://github.com/araliszz/new-lisboa.git
   ```
2. Abra a pasta do projeto.
3. Dê dois cliques em `index.html` para abrir no navegador (Chrome, Edge, Firefox ou Safari).

Não é preciso instalar nada.

## 👤 Autor

**Daniel Lisboa**

Projeto desenvolvido para fins acadêmicos.
