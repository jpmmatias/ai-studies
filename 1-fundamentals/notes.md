# Machine Learning, Deep Learning e Inteligência Artificial

Vivemos um momento em que termos como **Inteligência Artificial**, **Machine Learning** e **Deep Learning** estão em alta. Seja em postagens no LinkedIn, artigos ou produtos no mercado, é comum encontrar essas expressões sem entender exatamente o que significam.

O objetivo deste material é **desmistificar esses conceitos**, mostrando que eles são mais acessíveis do que parecem e explicando como se aplicam, especialmente no contexto do **desenvolvimento de software e desenvolvimento web**.

---

# O que é Inteligência Artificial?

A **Inteligência Artificial (IA)** é um campo amplo da computação cujo objetivo é **automatizar tarefas intelectuais que normalmente seriam realizadas por humanos**.

De forma geral, podemos definir IA como:

> O esforço de criar sistemas capazes de executar tarefas que normalmente exigiriam inteligência humana.

Essas tarefas incluem:

- Reconhecimento de imagens
- Processamento de linguagem natural
- Tomada de decisão
- Planejamento
- Sistemas de recomendação

IA engloba diversas abordagens e técnicas, incluindo:

- **Machine Learning**
- **Redes neurais**
- **Deep Learning**
- Sistemas baseados em regras

Historicamente, muitos sistemas de IA não utilizavam aprendizado a partir de dados. Um exemplo clássico são os **primeiros programas de xadrez**, que eram baseados em **regras programadas manualmente pelos desenvolvedores**.

Esses sistemas **não aprendiam com dados**, apenas seguiam regras explícitas.

---

![Venn Diagram](../assets/veenDiagramAI.png)

---

Apesar do nome sugerir algo semelhante à inteligência humana, a IA **não replica o cérebro humano de forma literal**.

Termos como:

- neurônios
- redes neurais
- camadas

são **metáforas inspiradas no funcionamento biológico**, mas os sistemas de IA são, na prática, **modelos matemáticos e estatísticos**.

De forma simplificada:

> Inteligência Artificial é qualquer sistema capaz de aprender padrões a partir de dados para executar uma tarefa.

Quando falamos de sistemas que aprendem com dados, estamos entrando no campo do **Machine Learning**.

---

# Machine Learning: o coração da IA moderna

**Machine Learning (ML)**, ou **Aprendizado de Máquina**, é uma subárea da Inteligência Artificial focada em algoritmos capazes de **identificar padrões em dados e fazer previsões ou decisões automaticamente**.

Em vez de escrever regras manualmente para resolver um problema, em Machine Learning:

1. Fornecemos **dados**
2. O algoritmo **aprende padrões**
3. O modelo passa a **fazer previsões para novos dados**

Convém distinguir **algoritmo** e **modelo**: o algoritmo é o **método** (regras matemáticas e otimização) que percorre os dados para ajustar parâmetros; o **modelo** é o **resultado desse treino** — uma função (ou estrutura parametrizada) que recebe entradas novas e produz previsões sem repetir todo o aprendizado.

Esse paradigma torna os sistemas:

- mais **flexíveis**
- mais **adaptáveis**
- mais **escaláveis**

Hoje, Machine Learning está presente em inúmeras aplicações, como:

- sistemas de recomendação (Netflix, Spotify, Amazon)
- filtros de spam
- assistentes virtuais
- reconhecimento facial
- sistemas de busca

---

# Tipos de aprendizado em Machine Learning

## 1. Aprendizado Supervisionado (Supervised Learning)

É o tipo de aprendizado **mais comum atualmente**.

Nesse modelo, o algoritmo aprende a partir de **dados rotulados**, ou seja, cada exemplo possui a **resposta correta associada**.

O objetivo do modelo é aprender a relação entre **entrada e saída** para conseguir prever resultados em novos dados.

### Regressão

Usada quando queremos prever **valores contínuos**.

Exemplo clássico:

- prever o **preço de uma casa** com base em:
  - tamanho
  - localização
  - número de quartos

O algoritmo aprende uma função que aproxima os dados e permite estimar valores futuros.

---

### Classificação

Utilizada quando o resultado é **discreto (categorias)**.

Exemplo:

- identificar se um tumor é:
  - **benigno**
  - **maligno**

Nesse caso, o modelo tenta encontrar uma **fronteira de decisão** que separa as classes.

---

### Curiosidade técnica: Support Vector Machines (SVM)

As **Support Vector Machines (SVM)** são algoritmos de classificação que podem utilizar o chamado **Kernel Trick**.

Esse método permite que o algoritmo **trabalhe em espaços de características extremamente grandes — até infinitos — de forma computacionalmente eficiente**.

---

## 2. Aprendizado Não Supervisionado (Unsupervised Learning)

Nesse tipo de aprendizado, os dados **não possuem rótulos**.

O objetivo do algoritmo é **descobrir padrões ou estruturas ocultas nos dados**.

---

### Clustering (Agrupamento)

O algoritmo agrupa dados semelhantes automaticamente.

Exemplo:

O **Google News** consegue agrupar milhares de notícias sobre o mesmo tema, mesmo sem receber informações explícitas sobre quais notícias pertencem a qual categoria.

---

### Cocktail Party Problem

O chamado **Cocktail Party Problem** representa a capacidade de separar diferentes fontes de áudio a partir de uma gravação única.

Por exemplo:

- separar **a voz de uma pessoa**
- de **música de fundo**

Algoritmos como **Independent Component Analysis (ICA)** são utilizados para resolver esse tipo de problema.

---

## 3. Aprendizado por Reforço (Reinforcement Learning)

O **Reinforcement Learning** baseia-se em um sistema de **recompensas e punições**.

Um agente interage com um ambiente e aprende por tentativa e erro.

O processo funciona da seguinte forma:

1. O agente executa uma ação
2. O ambiente retorna uma recompensa ou punição
3. O agente ajusta sua estratégia para maximizar recompensas futuras

Exemplo:

- controle de robôs
- jogos
- veículos autônomos

Em muitos casos, **não existe uma resposta correta imediata**, mas sim uma sequência de ações que leva a um objetivo final.

Em alguns problemas menciona-se ainda **aprendizagem semi-supervisionada**: combina-se um grande volume de dados **sem rótulo** com um subconjunto **rotulado**, situando-se entre os cenários supervisionado e não supervisionado.

---

# Engenharia de Machine Learning vs. "Magia Negra"

Andrew Ng defende que desenvolver sistemas de Machine Learning **não deve ser um processo de tentativa e erro aleatório**.

Em vez disso, deve ser tratado como **um processo de engenharia estruturado**.

Uma abordagem comum é utilizar **análise de erro (error analysis)** para identificar:

- se o problema está na **quantidade de dados**
- na **qualidade dos dados**
- na **escolha do algoritmo**
- ou na necessidade de **mais capacidade computacional**

Essa estratégia ajuda a direcionar o esforço de desenvolvimento, evitando meses de trabalho em abordagens que não trarão melhorias significativas ao modelo.

---

# A revolução do Deep Learning

A chamada **Deep Learning Revolution** refere-se ao grande avanço no uso de **redes neurais profundas** que começou por volta de **2012** e continua até hoje.

Esse avanço ocorreu graças a três fatores principais:

- maior disponibilidade de **dados**
- aumento da **capacidade computacional (GPUs)**
- melhorias nas **técnicas de treinamento de redes neurais**

Desde então, redes neurais profundas passaram a ser aplicadas em uma ampla variedade de problemas, incluindo:

- visão computacional
- reconhecimento de voz
- processamento de linguagem natural
- sistemas de recomendação
- veículos autônomos

Em muitos casos, essas redes permitiram resolver problemas que antes eram considerados praticamente impossíveis para máquinas.

---

# O que é Deep Learning?

**Deep Learning** é uma **subárea do Machine Learning** baseada no uso de **redes neurais artificiais profundas**.

A ideia central é empilhar múltiplas camadas de neurônios artificiais, permitindo que o modelo aprenda **representações cada vez mais abstratas dos dados**.

Por exemplo, em um sistema de reconhecimento de imagens:

1. Camadas iniciais detectam **bordas**
2. Camadas intermediárias detectam **formas**
3. Camadas profundas detectam **objetos completos**

Isso permite resolver tarefas complexas como:

- reconhecimento de imagens
- reconhecimento de fala
- tradução automática
- geração de texto
- veículos autônomos

---

Embora seja tecnicamente uma subárea de Machine Learning, **Deep Learning ganhou grande destaque devido ao seu impacto recente na indústria e na pesquisa em IA**.

Um exemplo clássico apresentado em estudos de Deep Learning é um sistema capaz de **aprender a dirigir um carro apenas observando um humano dirigir**, utilizando redes neurais para aprender diretamente a partir de dados visuais.

---

# Redes Neurais

Uma **rede neural artificial (RNA)** é um modelo matemático formado por muitas unidades simples — os **neurônios artificiais** — conectadas entre si. Cada conexão tem um **peso** que o algoritmo **ajusta durante o treinamento**, usando dados, para que a rede passe a mapear entradas (por exemplo, pixels de uma imagem) em saídas úteis (por exemplo, “é um gato” ou “vire à esquerda”).

---

## Do neurônio à rede

Um neurônio típico combina várias **entradas**, multiplica cada uma pelo seu **peso**, soma tudo (muitas vezes com um **viés**, ou *bias*, que desloca a decisão) e passa o resultado por uma **função de ativação**. Essa função introduz **não linearidade**: sem ela, empilhar camadas não aumentaria o poder expressivo do modelo — seria equivalente a uma única transformação linear.

---

## Camadas: entrada, ocultas e saída

As redes são organizadas em **camadas**:

- **Camada de entrada** recebe os dados brutos.
- **Camadas ocultas** transformam esses dados em representações intermediárias — o mesmo princípio das “bordas → formas → objetos” que vimos em visão computacional.
- **Camada de saída** produz o resultado da tarefa (classes, valores contínuos, probabilidades etc.).

Quando há **muitas** camadas ocultas, estamos no regime do **Deep Learning**: o modelo fica “profundo” em número de transformações sucessivas.

---

## Como a rede aprende (visão geral)

O treinamento costuma seguir esta ideia: comparar a **previsão** da rede com a **resposta desejada** (nos problemas supervisionados), medir o **erro** e **atualizar os pesos** para reduzi-lo. Na prática, isso é feito com algoritmos de otimização como a **descida de gradiente** (e variantes), que indicam em qual direção alterar cada peso.

O mecanismo clássico para propagar esse ajuste por todas as camadas é a **retropropagação** (*backpropagation*): o erro é calculado na saída e “volta” pela rede para atualizar pesos e vieses de forma coordenada. Não é necessário dominar as fórmulas para entender o papel dela — apenas que **é o processo que torna o aprendizado em profundidade computacionalmente viável**.

---

## Relação com o seu contexto (software e web)

Na prática, você raramente implementará retropropagação à mão; bibliotecas como **TensorFlow.js** encarregam-se da arquitetura, dos gradientes e da aceleração numérica. A secção seguinte resume **o que** essa stack oferece e **como** encaixa no fluxo: dados, treino, avaliação e modelo em produção.

---

# TensorFlow.js e ML no navegador

**TensorFlow.js** é uma biblioteca **open source** em JavaScript, desenvolvida pela Google como **companheira** do TensorFlow em Python. Permite construir fluxos de ML que correm no **navegador** ou no **Node.js** — por exemplo, o usuário pode interagir com um modelo ao abrir uma página, em muitos casos **sem instalar** drivers ou aplicações de sistema.

---

## API em camadas, API de baixo nível e backends

Para treino e inferência, a biblioteca usa tradicionalmente **WebGL** no browser para acelerar operações numéricas. Oferece uma **API de camadas** (*high-level*) para definir modelos de forma declarativa e uma **API de baixo nível** centrada em **álgebra linear** sobre tensores (com raízes no antigo projeto *deeplearn.js*). É comum também **importar** modelos já treinados noutros ambientes (por exemplo, fluxos em TensorFlow ou Keras), quando o formato e a versão são compatíveis com as ferramentas de conversão e carregamento disponíveis.

---

## Tensores: o alvo de todas as operações

No centro da API estão os **tensores**: blocos de dados organizados como **arrays multidimensionais** (valores numéricos ou outros tipos suportados). Propriedades que aparecem em quase todos os exemplos:

- **rank**: número de dimensões do tensor;
- **shape**: tamanho ao longo de cada dimensão (por exemplo, `[lote, altura, largura, canais]`);
- **dtype**: tipo dos valores (em muitos tutoriais, por padrão, `float32`).

Cria-se um tensor a partir de arrays JavaScript com `tf.tensor`; existem atalhos como `tf.tensor1d` … `tf.tensor6d` para tornar o número de dimensões explícito. As operações são, em geral, **imutáveis**: somar ou transformar tensores **devolve novos** tensores em vez de alterar os originais.

---

## Memória no browser

Tensores podem residir em buffers acelerados (por exemplo, na GPU via WebGL); acumular tensores sem os libertar pode **crescer o consumo de memória** de forma silenciosa. A API expõe `dispose()` (ou `tf.dispose`) para libertar um tensor e `tf.tidy()` para executar um bloco de operações e **conservar só o resultado final**, descartando intermediários:

```js
const y = tf.tidy(() => a.square().neg());
```

---

## Três modos de trabalho com a biblioteca

Uma forma simples de organizar o ecossistema (como em introduções dedicadas ao TensorFlow.js) é pensar em três níveis de esforço:

1. **Modelo pré-treinado**: carregar um modelo já treinado para uma tarefa concreta e fazer só **inferência** no cliente ou no servidor Node.
2. **Transfer learning** (*transferência de aprendizagem*): partir de um modelo existente e **re-treinar** (ou congelar camadas e treinar um cabeçalho) com dados do seu domínio.
3. **Criar, treinar e prever em JavaScript**: definir a arquitetura, o laço de treino e a avaliação **no próprio ecossistema JS** — útil para protótipos, demos educativas e produtos com requisitos de privacidade ou latência no cliente.

Em qualquer modo, o fluxo de produto permanece: **dados → treino (quando aplicável) → validação → implantação e monitorização**.

---

## Ligação a obras que aprofundam TensorFlow.js

O livro *Deep Learning with JavaScript* (equipa ligada ao TensorFlow, edição Manning) parte de motivações semelhantes e aprofunda **treino no ecossistema web**, preparação e transformação de dados, visualização de métricas e **generalização** — por exemplo **subajuste** e **sobreajuste** (*underfitting* / *overfitting*) — ou seja, se o modelo serve para dados novos e não só para o conjunto de treino.

---

## Leituras sugeridas

- Gerard, Charlie. *Practical Machine Learning in JavaScript: TensorFlow.js for Web Developers*. Apress, 2021. ISBN 978-1-4842-6417-1.
- Cai, Shanqing; Bileschi, Stan; Nielsen, Eric; Chollet, François. *Deep Learning with JavaScript*. Manning — útil para aprofundar TensorFlow.js, treino e boas práticas quando tiveres o PDF à mão.