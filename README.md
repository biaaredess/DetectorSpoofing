# Você é o detector

Jogo da feira de extensão da USP para alunos do ensino médio. Ele representa
uma pesquisa sobre **detecção de GPS spoofing em drones**: no ataque, alguém
manda um sinal de GPS falso e o drone passa a "achar" que está em outro lugar.
A detecção compara a foto da câmera do drone com a imagem de satélite do lugar
onde o GPS diz que ele está. Se as imagens batem, o voo é normal; se não batem,
é ataque.

O jogador faz o papel desse detector: são 12 rodadas de 10 segundos, divididas
em 4 climas (céu limpo, neblina, chuva e noite). Cada partida leva uns 2 minutos.
O jogo funciona sem internet, com mapas gerados por código e fontes embutidas.

## Como rodar

Precisa do [Node.js](https://nodejs.org/) 20 ou mais novo.

```bash
npm install
npm run dev
```

Depois abra o endereço que aparecer no terminal 

## Versão para a feira

```bash
npm run build
```

O build gera **um único arquivo**, `dist/index.html`, com o código, o CSS e as
fontes dentro dele.

O "Placar do dia" fica guardado no próprio navegador (localStorage), com uma
lista separada para cada data. O botão "Limpar placar" apaga só a lista de hoje.

## Como o código está organizado

```
src/
  config.ts        todas as constantes: tempos, níveis, dificuldade, cores
  rng.ts           gerador pseudoaleatório com seed (mulberry32)
  geometry.ts      pontos, quadrados e funções de interpolação
  storage.ts       placar do dia (localStorage, sempre com try/catch)
  game/            regras do jogo, sem nenhum acesso ao DOM
    machine.ts       máquina de estados: intro → nível → jogando → feedback → fim
    rounds.ts        sorteio das rodadas e das posições do GPS
    scoring.ts       pontuação
    stats.ts         acerto por nível e pior nível
    feedback.ts      frase que explica cada resposta
  world/           mapa procedural (uma zona por arquivo em zones/)
    MapSource.ts     interface de onde vêm as imagens
  render/          câmera, satélite, marcadores e efeitos de clima
  ui/              telas, teclado, relógio da rodada e o App que liga tudo
```

## Trocando os mapas por imagens reais

O jogo só conhece a interface `MapSource` (`src/world/MapSource.ts`):

```ts
interface MapSource {
  readonly worldSize: number; // lado do mundo, em pixels
  drawRegion(ctx, region, dest): void; // desenha um pedaço do mundo no canvas
}
```

Hoje ela é atendida pelo mapa procedural (`createProceduralMap`). Para usar um
recorte de satélite de verdade:

1. Salve uma imagem **quadrada** (por exemplo, um ortomosaico de 4000×4000 px)
   em `public/mapas/campus.jpg`.
2. Em `src/main.ts`, troque o mapa procedural pelo carregador de imagens que já
   existe em `src/world/imageMapSource.ts`:

   ```ts
   import { loadImageMapSource } from './world/imageMapSource';

   async function bootstrap(): Promise<void> {
     // ...
     const map = await loadImageMapSource('./mapas/campus.jpg');
     const app = new App({ root, map, leaderboard, newSeed: freshSeed });
     app.start();
   }

   void bootstrap();
   ```

3. Se a escala da imagem for diferente da do mapa procedural, ajuste
   `VIEW.worldSpan` (quanto do mundo aparece em cada imagem) e as distâncias de
   `ATTACK` em `src/config.ts`.

A câmera continua aplicando rotação, escala, tom de cor, desfoque e clima por
cima da imagem. Para usar fotos de câmera reais no lugar dessa simulação, dá
para passar ao `App` uma segunda `MapSource` só para a câmera e usá-la em
`renderCamera`.

> Arquivos de `public/` são copiados para `dist/`, ao lado do `index.html`.
> Nesse caso, leve a pasta `dist/` inteira para a feira, e não só o HTML.
