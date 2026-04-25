/**
 * main.jsx — React Entry Point
 *
 * CONCEPT: This is where React "mounts" onto the HTML page.
 * index.html has a <div id="root"></div>.
 * React takes over that div and renders our entire component tree inside it.
 * After this point, React controls the DOM — not the browser's default HTML rendering.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Find the #root element in index.html and attach React to it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
