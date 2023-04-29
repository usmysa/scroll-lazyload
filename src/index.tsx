import React from "react"
import ReactDOM from "react-dom/client"
import { Client, cacheExchange, fetchExchange, Provider } from "urql"
import "./reset.scss"
import App from "./page"

export const client = new Client({
  url: "https://graphql-pokeapi.graphcdn.app/",
  exchanges: [cacheExchange, fetchExchange],
})

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <React.StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </React.StrictMode>
)
