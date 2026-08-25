# tools/ — Generadores de entregables

Scripts que producen el material comercial en `business/`. Existen para que cambiar un
dato de un entregable cueste **editar una línea y correr un comando**, en lugar de
reescribir el documento entero.

## Uso

```bash
npm run docs:dossier   # → business/CareSignal_Dossier_Ejecutivo.docx
npm run docs:deck      # → business/CareSignal_Pitch_Inversionistas.pptx
npm run docs:lamina    # → business/CareSignal_Lamina_Apertura.pptx
npm run docs:all       # los tres
```

El dossier acepta una ruta alternativa como argumento, útil cuando el archivo destino
está abierto en Word y queda bloqueado:

```bash
node tools/build-dossier.cjs business/borrador.docx
```

## Los scripts

| Script | Genera | Librería |
|---|---|---|
| `build-dossier.cjs` | Dossier ejecutivo: portada, índice automático, 8 secciones y 2 anexos | `docx` |
| `build-deck.cjs` | Deck de inversionistas: 13 láminas con notas del orador | `pptxgenjs` |
| `build-lamina.cjs` | Lámina de apertura suelta, 16:9 | `pptxgenjs` |

## Por qué son `.cjs`

El `package.json` declara `"type": "module"`, así que un `.js` se interpreta como módulo
ES y `require()` falla. La extensión `.cjs` los fuerza a CommonJS, que es lo que ambas
librerías esperan.

## Convenciones al editarlos

- **La paleta y la tipografía están al inicio de cada script**, en constantes. Cambiar
  la identidad visual se hace ahí, no buscando colores repartidos por el archivo.
- **Las cifras se toman de `docs/09-datos-mercado.md`.** Si un número cambia ahí,
  búscalo en el generador y actualízalo; no dejes que diverjan.
- **Los marcadores `[ precio ]` y `[ nombre · correo · teléfono ]` son intencionales.**
  Señalan lo que aún no está decidido. No los rellenes con datos inventados.
- **Cada entregable repite los límites del producto**: no es dispositivo médico, no
  diagnostica, no sustituye personal. Si añades una lámina, mantén esa disciplina.

## Verificación

Después de generar un `.pptx`, conviene validarlo:

```bash
python <ruta-skill-pptx>/scripts/office/validate.py business/archivo.pptx
```

En Windows puede fallar por codificación al leer el XML; forzar UTF-8 lo resuelve:

```bash
PYTHONUTF8=1 python <ruta>/validate.py business/archivo.pptx
```

**Limitación conocida:** este equipo no tiene LibreOffice ni Poppler instalados, así que
no es posible renderizar los documentos a imagen para revisarlos visualmente. La
validación disponible es estructural (XML, relaciones, tipos de contenido) y de
contenido, no visual. Instalar LibreOffice cerraría ese hueco.
