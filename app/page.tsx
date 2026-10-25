'use client';

import { ChangeEvent, useState } from 'react';

export default function Home() {
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [recovery, setRecovery] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function createWorkspace() {
    setBusy(true); setMessage('');
    const response = await fetch('/api/workspaces', { method: 'POST' });
    const data = await response.json(); setBusy(false);
    if (response.ok) { setWorkspace(data.workspaceId); setRecovery(data.recoveryCode); }
    else setMessage(data.error ?? 'Impossible de créer l’espace.');
  }

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    if (!workspace || !event.target.files?.length) return;
    setBusy(true); setMessage('Analyse du document…');
    const form = new FormData(); form.set('workspaceId', workspace);
    Array.from(event.target.files).forEach((file) => form.append('files', file));
    const response = await fetch('/api/documents', { method: 'POST', body: form });
    const data = await response.json(); setBusy(false);
    setMessage(response.ok ? `${data.pages} page(s) enregistrée(s).` : data.error ?? 'Échec de l’import.');
  }

  return <main className="shell">
    <header className="topbar"><div className="brand">tutor.ai</div><div className="badge">Cameroun · Français</div></header>
    <section className="hero"><h1>Comprends mieux. Révise plus intelligemment.</h1><p>Ton compagnon d’étude pour transformer tes notes et documents en explications, exercices et révisions adaptées au contexte camerounais.</p>
      <div className="actions"><button className="primary" onClick={createWorkspace} disabled={busy || !!workspace}>{workspace ? 'Espace actif' : busy ? 'Création…' : 'Commencer sans compte'}</button><label className="secondary">Importer des notes<input type="file" hidden multiple accept="image/*,application/pdf" onChange={upload} disabled={!workspace || busy} /></label></div>
      {recovery && <div className="card"><h2>Ton espace est prêt</h2><p>Garde ce code pour récupérer ton espace après un changement de navigateur :</p><strong>{recovery}</strong><p className="small">Identifiant : {workspace}</p></div>}
      {message && <p role="status">{message}</p>}
    </section>
    <section className="grid" style={{ marginTop: 56 }}><article className="card"><h2>📚 Tes documents</h2><p>Importe des photos, plusieurs pages ou des PDF scannés. Maximum 10 pages par analyse.</p></article><article className="card"><h2>🤖 Ton tuteur</h2><p>Pose tes questions en français et obtiens une réponse basée sur tes propres notes.</p></article><article className="card"><h2>✍️ Entraîne-toi</h2><p>Génère des QCM et des questions structurées avec des explications.</p></article></section>
  </main>;
}
