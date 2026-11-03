# Selo — gerador de código QR

![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

Gerador de código QR que roda no navegador. A prévia muda enquanto o texto ou a URL é digitado. Dá para escolher a cor do primeiro plano e do fundo, o tamanho em pixels e o nível de correção de erros, e baixar o símbolo em PNG.

| O que entra no código | O que o app faz |
| --- | --- |
| O texto exatamente como foi digitado | Não acrescenta `https://` |
| Host sem esquema (`exemplo.com`) | Avisa que o celular pode não abrir como link |
| Contraste abaixo de 4:1, ou código invertido | Avisa antes do download |
| Texto longo demais para o nível de correção | Mostra o erro e trava o PNG |

## Stack

- React 19 e TypeScript
- Vite 8 e Tailwind CSS 4
- [`qrcode`](https://github.com/soldair/node-qrcode) para desenhar o símbolo no canvas
- sem backend: cor, tamanho e correção ficam no estado da página

## Estrutura

```
.
├── index.html
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx              # monta o React
    ├── App.tsx               # formulário, prévia e download
    ├── styles.css            # tokens de cor e tipo
    ├── qr-options.ts         # contraste, hex e aviso de URL
    └── qr-options.test.ts    # o que dá para testar sem canvas
```

A zona quieta é fixa em 4 módulos. O PNG sai com o tamanho pedido, ou maior se o símbolo não couber — a página diz qual foi o tamanho real.

## Como rodar

```bash
git clone https://github.com/gabrielteramae/selo.git
cd selo
npm install
npm run dev
```

`npm run build` gera `dist/`. `npm test` roda a suíte de `qr-options`.

## Testes realizados

`npm test` cobre contraste, hex válido, aviso de host sem esquema (inclusive com porta) e a mensagem de texto longo demais. Não há teste de browser para o canvas nem para o download.

---

© 2026 Gabriel Teramae Chan
