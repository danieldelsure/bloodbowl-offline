# BB Chile - El desafío

Juego offline contra la IA para revivir el Torneo de Campeones III (16 equipos reales, primera ronda real y suizo después). El resultado es un solo archivo, `index.html`, que funciona sin internet.

## Estructura

- `index.html`: el juego ya armado (es lo que sirve Vercel). No se edita a mano.
- `src/index.html`: estructura de la página.
- `src/css/style.css`: estilos.
- `src/js/`: código en orden numérico (`01-nucleo`, `02-motor-y-plan`, `03-ia`, `04-torneo`, `05-interfaz`).
- `src/data/`: sprites (`assets.js`), torneo (`tourney.js`), tipografías (`fonts.css`).
- `build.py`: `python3 build.py` regenera `index.html` desde `src/`.
- `test/`: simulaciones y pruebas (`node test/bench.js 200 AI2 AI`).

## Guardado

La partida y el torneo se guardan en el navegador. Desde la pausa o el menú se puede descargar un archivo `.json` y volver a cargarlo después (en otro navegador o computador).

Proyecto de fans sin fines de lucro. Sprites de FUMBBL usados con atribución a sus autores.
