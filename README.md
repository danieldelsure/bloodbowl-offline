# BB Chile - El desafío

Juego offline contra la IA para revivir el Torneo de Campeones III (2025, 16 equipos) y el II (2024, 14 equipos): primera ronda real y suizo después. El resultado es un solo archivo, `index.html`, que funciona sin internet.

## Estructura

- `index.html`: el juego ya armado (es lo que sirve Vercel). No se edita a mano.
- `src/index.html`: estructura de la página.
- `src/css/style.css`: estilos.
- `src/js/`: código en orden numérico (`01-nucleo`, `02-motor-y-plan`, `03-ia`, `04-torneo`, `05-interfaz`).
- `src/data/`: sprites (`assets.js`), torneos (`tourney.js` = III, `tourney2.js` = II), tipografías (`fonts.css`).
- `build.py`: `python3 build.py` regenera `index.html` desde `src/`.
- `test/`: simulaciones y pruebas (`node test/bench.js 200 AI2 AI`).

## Guardado

La partida y el torneo se guardan en el navegador. Desde la pausa o el menú se puede descargar un archivo `.json` y volver a cargarlo después (en otro navegador o computador).

Proyecto de fans sin fines de lucro. Sprites de FUMBBL usados con atribución a sus autores.

## Agregar un torneo

1. `node tools/volcar_rosters.js` (vuelca las razas del juego a `tools/rosters.json`).
2. `python3 tools/importar_tourplay.py <carpeta con los CSV de tourplay> src/data/tourneyN.js TDCN tdcN "Nombre" "fecha" posterN --excluir "Equipo que no jugó"`.
3. Sumar el afiche a `assets.js` (clave `posterN`), el archivo a `build.py` y la constante a `TORNEOS` en `04-torneo.js`.

El afiche del Torneo I (2023) está en `src/posters/afiche-2023.jpg`, listo para cuando se arme ese torneo.
