# vite-plugin-dom-inspector

Plugin Vite que injeta um inspetor DOM visual no canto inferior direito da página durante o **modo de desenvolvimento**.

> Funciona apenas com `vite dev` (não afeta a build de produção).

## Motivação

Muitas extensões, IDEs e GUIs com IA não possuem um seletor de DOM integrado. Este plugin preenche essa lacuna: em vez de escrever seletores manualmente, você inspeciona visualmente qualquer elemento da página e copia o seletor CSS com um clique — agilizando o processo de fornecer contexto preciso para ferramentas de IA.

---

## Instalação

```bash
npm install --save-dev vite-plugin-dom-inspector
```

## Configuração

No seu arquivo `vite.config.js` (ou `vite.config.ts`):

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { meuDomInspectorPlugin } from 'vite-plugin-dom-inspector'

export default defineConfig({
  plugins: [
    react(),
    meuDomInspectorPlugin()
  ]
})
```

Pronto! Ao rodar `npm run dev`, um botão **Inspect** aparecerá no canto inferior direito da página.

## Como usar

1. Clique no botão **Inspect** (ícone de lupa) para ativar o modo de inspeção (o botão fica vermelho).
2. Mova o mouse sobre os elementos da página — um brilho azul destacará o elemento sob o cursor.
3. Um tooltip escuro exibirá a **tag**, **ID** e **classes CSS** do elemento.
4. **Clique** em qualquer elemento para copiar o seletor e o HTML externo para a área de transferência.
5. Pressione **Escape** ou clique no botão **Close** para desativar.

| Estado | Botão | Comportamento |
|--------|-------|---------------|
| Inativo | Inspect (azul) | Nada acontece ao mover o mouse |
| Ativo | Close (vermelho) | Destaque azul + tooltip ao mover o mouse; clique copia seletor e HTML |
