import { html, render } from "lit-html";
import { styleMap } from "lit-html/directives/style-map.js";

import { Serie } from "../src/lit-line";
import "../src/lit-line";

enum View {
  None,
  HighDensity,
  MultiLines,
}

export class DemoApp extends HTMLElement {
  private selection: { time: number; values: (number | null)[] } | null;
  private data: Serie[];
  private selectedView: View;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.selection = null;
    this.data = this.createDataSet();
    this.selectedView = View.None;

    this.render();
  }

  connectedCallback() {
    this.selectView(View.HighDensity);
  }

  disconnectedCallback() {}

  selectView(view: View) {
    this.selectedView = view;

    switch (view) {
      case View.HighDensity:
        this.data = [{ color: "#fe7142", points: this.createRandom(500) }];
        break;
      case View.MultiLines:
        this.data = [
          { color: "#68bb79", points: this.createSinusoid(300, 0) },
          { color: "#9a57e8", points: this.createSinusoid(300, Math.PI) },
        ];
        break;
    }

    this.render();
  }

  createDataSet() {
    const points = Array.from({ length: 300 }, (_, i) => {
      return {
        time: i,
        value: 10 * Math.sin(0.1 * i), //Math.floor(Math.random() * 40)
      };
    });

    return [{ unit: "usd", color: "#591", points }];
  }

  createRandom(length: number) {
    return Array.from({ length }, (_, i) => {
      return {
        time: i,
        value: Math.floor(Math.random() * 40),
      };
    });
  }

  createSinusoid(length: number, phase: number) {
    return Array.from({ length }, (_, i) => {
      return {
        time: i,
        value: 10 * Math.sin(0.04 * i + phase),
      };
    });
  }

  onSelection(e: CustomEvent) {
    this.selection = e.detail;
    this.render();
  }

  render() {
    this.shadowRoot &&
      render(
        html`
          <header>
            <span class="logo">&lt;lit-line/&gt;</span>
          </header>

          <h1>
            <strong>{small, fast, responsive, interactive}</strong> svg line chart web component for
            <strong>modern website</strong>. That's it.
          </h1>

          <main>
            <nav class="nav">
              ${this.selection === null
                ? html`
                    <button
                      class="item"
                      ?selected=${this.selectedView === View.HighDensity}
                      @click=${() => this.selectView(View.HighDensity)}
                    >
                      Random data
                    </button>
                    <button
                      class="item"
                      ?selected=${this.selectedView === View.MultiLines}
                      @click=${() => this.selectView(View.MultiLines)}
                    >
                      Multi lines
                    </button>
                  `
                : html`
                    <span class="item">
                      index:
                      <span class="time">${Math.round(this.selection.time)}</span>
                      | values:
                      ${this.selection.values.map(
                        (value, i) =>
                          html`<span class="value" style=${styleMap({ color: this.data[i].color })}
                            >${value ? Math.round(value) : "--"}</span
                          >`
                      )}
                    </span>
                  `}
            </nav>

            <lit-line
              @lit-line:selected=${(e: CustomEvent) => this.onSelection(e)}
              .data=${this.data}
            ></lit-line>
          </main>

          <footer>
            <span>
              <a href="https://twitter.com/AdrienForward">Adrien Pinet</a>
            </span>
          </footer>

          <style>
            :host {
              display: flex;
              flex-flow: column;
              justify-content: space-between;
              padding: 1em;
              min-height: calc(100vh - 2em);
              font-size: 1em;
            }

            .icon {
              height: 1em;
              width: 1em;
            }

            a {
              text-decoration: none;
              font-weight: 600;
              color: inherit;
            }

            a .icon {
              margin-right: 0.4em;
            }

            button {
              display: flex;
              align-items: center;
            }

            header {
              display: flex;
              justify-content: space-between;
              font-size: 1.4em;
            }

            header > .logo {
              font-weight: 600;
            }

            header > .github {
              color: #445;
            }

            header > .github:hover {
              color: #112;
            }

            h1 {
              padding-left: 0.2em;
              color: #224;
              font-size: 1em;
              font-weight: 300;
            }

            nav {
              display: flex;
              flex-flow: row;
              justify-content: center;
              align-items: center;
              font-size: 1em;
              min-height: 3em;
              padding: 1em 0;
              margin-top: 2em 0 1em 0;
            }

            .nav > .item {
              background-color: transparent;
              border: 2px solid transparent;
              padding: 0.5em;
              font-size: 1em;
            }

            .nav > .item > .time,
            .nav > .item > .value {
              padding: 0.2em 0.4em;
              border-radius: 0.2em;
              font-weight: 600;
            }

            .nav > .item > .value {
              color: white;
              margin: 0 0.2em;
            }

            .nav > .item[selected] {
              border-color: black;
              font-weight: 600;
            }

            .nav > .item:not([selected]) {
              cursor: pointer;
            }

            lit-line {
              width: 100%;
              height: 25vh;
              --lit-line-selected-time--color: #53a0e8;
              --lit-line-selected-time--width: 3;
            }

            footer {
              display: flex;
              padding: 2em 0;
              font-size: 0.8em;
              justify-content: flex-end;
              color: #556;
            }

            @media (min-height: 400px) {
              lit-line {
                height: 50vh;
              }
            }
            @media (min-height: 600px) {
              lit-line {
                height: 40vh;
              }
            }
          </style>
        `,
        this.shadowRoot
      );
  }
}

window.customElements.define("demo-app", DemoApp);
